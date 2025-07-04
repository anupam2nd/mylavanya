
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

  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      console.log('Refreshing session:', data.session?.user?.id);
      
      if (data.session?.user) {
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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session check:', session?.user?.id);
        
        if (session?.user) {
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
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log('Found stored user:', parsedUser.email, 'role:', parsedUser.role);
              setUser(parsedUser);
            } catch (error) {
              console.error('Error parsing stored user:', error);
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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.role !== 'admin' && parsedUser.role !== 'superadmin' && parsedUser.role !== 'controller') {
              setUser(null);
              localStorage.removeItem('user');
            }
          } catch (error) {
            setUser(null);
            localStorage.removeItem('user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.role === 'admin' || userData.role === 'superadmin' || userData.role === 'controller') {
      try {
        console.log('Creating Supabase session for admin user:', userData.email);
        await supabase.auth.signInAnonymously();
      } catch (error) {
        console.error('Error creating Supabase session:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    
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
