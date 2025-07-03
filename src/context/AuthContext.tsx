
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      console.log('Refreshing session:', data.session?.user?.id);
      
      if (data.session?.user) {
        // Get user details from UserMST table
        const { data: userData, error } = await supabase
          .from('UserMST')
          .select('*')
          .eq('uuid', data.session.user.id)
          .single();

        if (userData && !error) {
          const userObj = {
            id: userData.uuid,
            email: userData.email_id || data.session.user.email || '',
            role: userData.role || 'user',
            firstName: userData.FirstName,
            lastName: userData.LastName,
          };
          setUser(userObj);
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      } else {
        // If there's no session but we have a stored user, retrieve it
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
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // First, check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
          // Get user details from UserMST table
          const { data: userData, error } = await supabase
            .from('UserMST')
            .select('*')
            .eq('uuid', session.user.id)
            .single();

          if (userData && !error) {
            const userObj = {
              id: userData.uuid,
              email: userData.email_id || session.user.email || '',
              role: userData.role || 'user',
              firstName: userData.FirstName,
              lastName: userData.LastName,
            };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        } else {
          // Check if user is stored in localStorage
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
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user details from UserMST table when signed in
        try {
          const { data: userData, error } = await supabase
            .from('UserMST')
            .select('*')
            .eq('uuid', session.user.id)
            .single();

          if (userData && !error) {
            const userObj = {
              id: userData.uuid,
              email: userData.email_id || session.user.email || '',
              role: userData.role || 'user',
              firstName: userData.FirstName,
              lastName: userData.LastName,
            };
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
    // Show enhanced logout toast notification
    toast.success("👋 Logged out successfully", {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '500',
        padding: '16px 20px',
        boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25), 0 10px 10px -5px rgba(16, 185, 129, 0.04)',
      },
      className: 'logout-toast',
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
