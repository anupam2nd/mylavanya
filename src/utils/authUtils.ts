
import { supabase } from "@/integrations/supabase/client";

export const createTemporarySupabaseSession = async (userId: string, email: string) => {
  try {
    console.log('Creating temporary Supabase session for:', email);
    
    // Try to create or get the user in Supabase auth - using a different approach
    // since admin.listUsers might not be available with the current setup
    
    // Try to sign in anonymously first to establish a session
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.log('Sign out error (expected):', signOutError.message);
    }
    
    // Create an anonymous session for admin operations
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    
    if (anonError) {
      console.error('Error creating anonymous session:', anonError);
      return false;
    }
    
    console.log('Created anonymous session for admin operations');
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
