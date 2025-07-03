
import { supabase } from "@/integrations/supabase/client";

export const createTemporarySupabaseSession = async (userId: string, email: string) => {
  try {
    console.log('Creating temporary Supabase session for:', email);
    
    // Try to create or get the user in Supabase auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.id === userId || u.email === email);
    
    if (!existingUser) {
      // Create the user in Supabase auth
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        id: userId,
        email: email,
        password: `temp_${Date.now()}`,
        email_confirm: true
      });
      
      if (error) {
        console.error('Error creating user in Supabase auth:', error);
        return false;
      }
      
      console.log('Created user in Supabase auth:', newUser.user?.id);
    }
    
    return true;
  } catch (error) {
    console.error('Error with Supabase session management:', error);
    return false;
  }
};

export const ensureSupabaseSession = async (user: { id: string; email: string; role: string }) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session && ['admin', 'superadmin', 'controller'].includes(user.role)) {
      console.log('No Supabase session for admin user, attempting to create one');
      
      // Try anonymous sign in as a fallback
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Anonymous sign in failed:', error);
      } else {
        console.log('Anonymous session created');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring Supabase session:', error);
    return false;
  }
};
