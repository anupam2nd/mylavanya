
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
      console.log("Session refresh check:", data.session ? "Active session" : "No active session");
      
      // If there's no session but we have a stored user, retrieve it
      if (!data.session && !user) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            console.log("User retrieved from localStorage:", parsedUser);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      console.error("Session refresh error:", error);
    }
  };

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User loaded from localStorage:", parsedUser);
        
        // Initialize Supabase auth with the stored user
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            console.log("No active Supabase session, but user exists in localStorage");
          }
        });
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    console.log("AUTH CONTEXT: About to set user state - potential layout shift point");
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log("AUTH CONTEXT: User state set, localStorage updated");
    
    // Also set up a Supabase session for the user if it's not set
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        console.log("Setting up Supabase session from login");
        // We can't actually create a session without the proper auth flow,
        // but we ensure the user is stored in localStorage
      }
    });
  };

  const logout = () => {
    console.log("Logging out user");
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
      console.log("Logged out successfully");
    });
    
    // Also sign out from Supabase if there's an active session
    supabase.auth.signOut().then(() => {
      console.log("Supabase signout complete");
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
