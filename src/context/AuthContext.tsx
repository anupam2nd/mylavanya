
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { isSyntheticEmail } from '@/utils/syntheticEmail';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Handle user session and profile data
          setTimeout(() => {
            handleUserSession(session);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        handleUserSession(session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (session: Session) => {
    try {
      const authUser = session.user;
      const userEmail = authUser.email;
      const userMetadata = authUser.user_metadata;
      
      // Check if user is a member (from Supabase auth with userType metadata or synthetic email)
      const isMemberAuth = userMetadata?.userType === 'member' || (userEmail && isSyntheticEmail(userEmail));
      
      // Check if user is an artist (from Supabase auth with userType metadata)
      const isArtistAuth = userMetadata?.userType === 'artist';

      if (isMemberAuth) {
        // Fetch member data from MemberMST table using UUID
        const { data: memberData, error: memberError } = await supabase
          .from('MemberMST')
          .select('*')
          .eq('uuid', authUser.id)
          .single();

        if (memberError && memberError.code !== 'PGRST116') {
          console.error('Error fetching member data:', memberError);
        }

        if (memberData) {
          setUser({
            id: authUser.id,
            email: memberData.MemberEmailId || memberData.synthetic_email || userEmail || '',
            role: 'member',
            firstName: memberData.MemberFirstName,
            lastName: memberData.MemberLastName
          });
          return;
        }

        // If no member data found, create a basic user profile from auth data
        console.log('No member profile found, creating basic user profile');
        setUser({
          id: authUser.id,
          email: userEmail || '',
          role: 'member',
          firstName: userMetadata?.firstName || '',
          lastName: userMetadata?.lastName || ''
        });
        return;
      }

      if (isArtistAuth) {
        // Fetch artist data from ArtistMST table using UUID
        const { data: artistData, error: artistError } = await supabase
          .from('ArtistMST')
          .select('*')
          .eq('uuid', authUser.id)
          .single();

        if (artistError && artistError.code !== 'PGRST116') {
          console.error('Error fetching artist data:', artistError);
        }

        if (artistData) {
          setUser({
            id: authUser.id,
            email: artistData.emailid || userEmail || '',
            role: 'artist',
            firstName: artistData.ArtistFirstName,
            lastName: artistData.ArtistLastName
          });
          return;
        }

        // If no artist data found, create a basic user profile from auth data
        console.log('No artist profile found, creating basic user profile');
        setUser({
          id: authUser.id,
          email: userEmail || '',
          role: 'artist',
          firstName: userMetadata?.firstName || '',
          lastName: userMetadata?.lastName || ''
        });
        return;
      }

      // Check if user is an admin/superadmin/controller
      const { data: adminUser } = await supabase
        .from('UserMST')
        .select('*')
        .eq('email_id', userEmail)
        .eq('active', true)
        .single();

      if (adminUser) {
        setUser({
          id: adminUser.uuid,
          email: userEmail || '',
          role: adminUser.role || 'admin',
          firstName: adminUser.FirstName,
          lastName: adminUser.LastName
        });
        return;
      }

      // Fallback: Check if user is an artist (legacy without Supabase Auth)
      const { data: artistUser } = await supabase
        .from('ArtistMST')
        .select('*')
        .eq('emailid', userEmail)
        .eq('Active', true)
        .single();

      if (artistUser) {
        setUser({
          id: artistUser.uuid,
          email: userEmail || '',
          role: 'artist',
          firstName: artistUser.ArtistFirstName,
          lastName: artistUser.ArtistLastName
        });
        return;
      }

      console.log('No user profile found for:', userEmail);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      console.log('Login attempt for:', email, 'with role:', role);
      
      // For admin/superadmin/controller users, handle legacy login differently
      if (role && ['admin', 'superadmin', 'controller'].includes(role)) {
        console.log('Handling legacy admin login');
        
        // Check if user exists in UserMST
        const { data: adminUser, error: adminError } = await supabase
          .from('UserMST')
          .select('*')
          .ilike('email_id', email.trim().toLowerCase())
          .eq('active', true)
          .single();

        if (adminError || !adminUser) {
          console.error('Admin user not found:', adminError);
          return false;
        }

        // Verify password using edge function
        const { data: verifyResult, error: verifyError } = await supabase.functions.invoke('verify-password', {
          body: { 
            password: password,
            hashedPassword: adminUser.password
          }
        });
        
        if (verifyError || !verifyResult?.isValid) {
          console.error('Password verification failed:', verifyError);
          return false;
        }

        // Create a manual session for admin users (they don't use Supabase Auth)
        setUser({
          id: adminUser.uuid,
          email: adminUser.email_id || '',
          role: adminUser.role || 'admin',
          firstName: adminUser.FirstName,
          lastName: adminUser.LastName
        });
        
        console.log('Admin login successful');
        return true;
      }

      // For members and artists, use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth login error:', error);
        return false;
      }
      
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
