import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

export const loginUser = async (
  email: string, 
  password: string, 
  role?: string,
  setUser?: (user: User | null) => void
): Promise<boolean> => {
  try {
    console.log('Login attempt for:', email, 'with role:', role);
    
    // For admin/superadmin/controller users, handle legacy login differently
    if (role && ['admin', 'superadmin', 'controller'].includes(role)) {
      return await handleAdminLogin(email, password, setUser);
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

const handleAdminLogin = async (
  email: string, 
  password: string,
  setUser?: (user: User | null) => void
): Promise<boolean> => {
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
  if (setUser) {
    setUser({
      id: adminUser.uuid,
      email: adminUser.email_id || '',
      role: adminUser.role || 'admin',
      firstName: adminUser.FirstName,
      lastName: adminUser.LastName
    });
  }
  
  console.log('Admin login successful');
  return true;
};

export const logoutUser = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
  }
};