
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
          // Determine user type and fetch appropriate profile data
          await handleUserSession(session);
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
      const userEmail = session.user.email;
      const userMetadata = session.user.user_metadata;
      
      // Check if user is a member (from Supabase auth)
      if (userMetadata?.userType === 'member') {
        // Fetch member profile data
        const { data: memberProfile } = await supabase
          .from('member_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (memberProfile) {
          setUser({
            id: session.user.id,
            email: userEmail || '',
            role: 'member',
            firstName: memberProfile.first_name,
            lastName: memberProfile.last_name
          });
          return;
        }
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

      // Check if user is an artist
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
      // For members, use Supabase auth directly
      if (!role || role === 'member') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        return !!data.user;
      }

      // For admin/artist users, we still use the existing login logic
      // but also create a Supabase session if successful
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
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
