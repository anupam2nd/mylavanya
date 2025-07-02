
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Add a function to refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      
      // If there's no session but we have a stored user, retrieve it
      if (!data.session && !user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            localStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      // Handle session refresh error silently
    }
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Initialize Supabase auth with the stored user
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            // No active Supabase session, but user exists in localStorage
          }
        });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Auth state changed
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Also set up a Supabase session for the user if it's not set
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // We can't actually create a session without the proper auth flow,
        // but we ensure the user is stored in localStorage
      }
    });
  };

  const logout = () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('user');
    
    // Import and use the custom toast here
    import('@/context/ToastContext').then(({ useCustomToast }) => {
      const { showToast } = useCustomToast();
      if (currentUser?.role === 'member') {
        showToast("Logged out successfully", 'success', 3000);
      }
    }).catch(() => {
      // Fallback if import fails
    });
    
    // Also sign out from Supabase if there's an active session
    supabase.auth.signOut().then(() => {
      navigate('/');
    });
  };

  const contextValue = {
    user, 
    loading, 
    login, 
    logout, 
    isAuthenticated: user !== null,
    refreshSession
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
