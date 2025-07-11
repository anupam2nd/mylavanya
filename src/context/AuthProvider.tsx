import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, AuthContextType } from './AuthContext';
import { handleUserSession } from '@/utils/authHandlers';
import { loginUser, logoutUser } from '@/utils/authOperations';

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
            handleUserSession(session, setUser);
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
        handleUserSession(session, setUser);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role?: string): Promise<boolean> => {
    return loginUser(email, password, role, setUser);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setSession(null);
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