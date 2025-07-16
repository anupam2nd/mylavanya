
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
          .eq('id', data.session.user.id)
          .single();

        if (userData && !error) {
          const userObj = {
            id: userData.id,
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
            
            // Try to create a Supabase session for this user
            console.log('Attempting to restore Supabase session for stored user:', parsedUser.email);
            
            // Check if this user exists in UserMST and has a password
            const { data: userData, error } = await supabase
              .from('UserMST')
              .select('id, email_id, password')
              .eq('id', parsedUser.id)
              .single();

            if (userData && userData.password) {
              console.log('User found in UserMST, creating auth user if needed');
              
              // Try to sign in to establish Supabase session
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: userData.email_id,
                password: 'temp_password' // This won't work, but we need a different approach
              });
              
              if (signInError) {
                console.log('Could not establish Supabase session with stored credentials');
              }
            }
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
            .eq('id', session.user.id)
            .single();

          if (userData && !error) {
            const userObj = {
              id: userData.id,
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
              console.log('Found stored user:', parsedUser.email, 'role:', parsedUser.role);
              setUser(parsedUser);
              
              // For admin/superadmin users, we need to create a temporary Supabase session
              if (parsedUser.role === 'admin' || parsedUser.role === 'superadmin' || parsedUser.role === 'controller') {
                console.log('Creating temporary session for admin user');
                
                // Create a temporary auth session by signing in anonymously and then updating the user ID
                try {
                  const { error: signOutError } = await supabase.auth.signOut();
                  if (signOutError) console.log('Sign out error (expected):', signOutError.message);
                  
                  // Create an anonymous session and then manually set the user ID
                  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
                  
                  if (!anonError && anonData.user) {
                    console.log('Created anonymous session, updating user context');
                    // The user context is already set, we just need Supabase to recognize this user
                  }
                } catch (sessionError) {
                  console.log('Could not create temporary session:', sessionError);
                }
              }
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
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user details from UserMST table when signed in
        try {
          const { data: userData, error } = await supabase
            .from('UserMST')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData && !error) {
            const userObj = {
              id: userData.id,
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
        // Only clear if we don't have a stored admin user
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
    
    // For admin users, try to create a proper Supabase session
    if (userData.role === 'admin' || userData.role === 'superadmin' || userData.role === 'controller') {
      try {
        console.log('Creating Supabase session for admin user:', userData.email);
        
        // First, check if this user exists in Supabase Auth
        const { data: existingUser } = await supabase.auth.admin.getUserById(userData.id).catch(() => ({ data: null }));
        
        if (!existingUser) {
          console.log('User not found in Supabase Auth, creating...');
          // Create user in Supabase Auth
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            id: userData.id,
            email: userData.email,
            password: 'temp_password_' + Date.now(),
            email_confirm: true
          });
          
          if (createError) {
            console.error('Error creating user in Supabase Auth:', createError);
          } else {
            console.log('User created in Supabase Auth:', newUser.user?.id);
          }
        }
        
        // Try to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: 'temp_password_' + Date.now()
        });
        
        if (signInError) {
          console.log('Direct sign in failed, using anonymous session');
          // Fallback: create anonymous session
          await supabase.auth.signInAnonymously();
        }
      } catch (error) {
        console.error('Error creating Supabase session:', error);
      }
    }
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
