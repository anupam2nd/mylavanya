
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  isEmailConfirmed?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        
        if (session?.user) {
          // Handle member users (from Supabase auth)
          if (session.user.user_metadata?.userType === 'member') {
            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email!,
              role: 'member',
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName,
              isEmailConfirmed: !!session.user.email_confirmed_at,
            };
            setUser(authUser);
          } 
          // Handle admin/controller users (legacy system)
          else {
            // Try to find user in UserMST table
            try {
              const { data: userData } = await supabase
                .from('UserMST')
                .select('id, email_id, role, FirstName, LastName')
                .eq('uuid', session.user.id)
                .maybeSingle();

              if (userData) {
                const authUser: AuthUser = {
                  id: userData.id.toString(),
                  email: userData.email_id,
                  role: userData.role,
                  firstName: userData.FirstName,
                  lastName: userData.LastName,
                };
                setUser(authUser);
              } else {
                // If no user data found, sign out
                await supabase.auth.signOut();
              }
            } catch (error) {
              logger.error('Error fetching user data:', error);
              await supabase.auth.signOut();
            }
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // The onAuthStateChange callback will handle this
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
