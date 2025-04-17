import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as encodeBase64, decode as decodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Verifies a password against a PBKDF2 hash
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    // Check if the hash format matches what we expect
    if (!hashedPassword.startsWith('$pbkdf2-sha256$')) {
      console.error('Unsupported hash format:', hashedPassword);
      return false;
    }
    
    // Parse the stored hash
    const parts = hashedPassword.split('$');
    console.log('parts', parts);
    
    // We should have 5 parts ($, pbkdf2-sha256, i=iterations, salt, hash)
    if (parts.length !== 5) {
      console.error('Invalid hash format, expected 5 parts but got', parts.length);
      return false;
    }
    
    const algorithm = parts[1];
    const params = parts[2];
    
    if (algorithm !== 'pbkdf2-sha256') {
      console.error('Unsupported algorithm:', algorithm);
      return false;
    }
    
    // Extract parameters
    if (!params.startsWith('i=')) {
      console.error('Invalid parameters format:', params);
      return false;
    }
    
    const iterations = parseInt(params.substring(2)); // Use substring instead of split
    if (isNaN(iterations)) {
      console.error('Invalid iterations value');
      return false;
    }
    
    const saltString = parts[3];
    const storedHash = parts[4];
    
    if (!saltString || !storedHash) {
      console.error('Missing salt or hash in stored password', { saltString, storedHash });
      return false;
    }
    
    try {
      // Decode the salt
      const salt = decodeBase64(saltString);
      
      // Encode password as UTF-8
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(password);
      
      // Use PBKDF2 to derive bits
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordData,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: iterations,
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );
      
      const hashArray = new Uint8Array(derivedBits);
      const hashString = encodeBase64(hashArray);
      
      // Compare the calculated hash with the stored hash
      return hashString === storedHash;
    } catch (error) {
      console.error('Error in base64 decoding or hash computation:', error);
      return false;
    }
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password, type } = await req.json()

    if (!email || !password || !type) {
      return new Response(
        JSON.stringify({ error: 'Email, password and type are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    console.log(`Verifying password for ${type} with email: ${normalizedEmail}`);

    let user;
    let storedHash;

    if (type === 'member') {
      const { data, error } = await supabase
        .from('MemberMST')
        .select('*, id, MemberEmailId, password, MemberFirstName, MemberLastName')
        .ilike('MemberEmailId', normalizedEmail)
        .single();

      if (error || !data) {
        console.error('Error fetching member:', error || 'Member not found');
        return new Response(
          JSON.stringify({ isValid: false, error: 'Invalid credentials' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      user = data;
      storedHash = data.password;
    } else {
      const { data, error } = await supabase
        .from('UserMST')
        .select('*, id, Username, password, FirstName, LastName, role')
        .ilike('Username', normalizedEmail)
        .single();

      if (error || !data) {
        console.error('Error fetching user:', error || 'User not found');
        return new Response(
          JSON.stringify({ isValid: false, error: 'Invalid credentials' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      user = data;
      storedHash = data.password;
    }

    // Check if we have a stored hash
    if (!storedHash) {
      console.error('No password hash found for user');
      return new Response(
        JSON.stringify({ isValid: false, error: 'Invalid credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Attempting to verify stored hash');
    
    // Verify the password
    const isValid = await verifyPassword(password, storedHash);

    if (!isValid) {
      console.log('Password verification failed');
      return new Response(
        JSON.stringify({ isValid: false, error: 'Invalid credentials' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Password verified successfully');
    return new Response(
      JSON.stringify({ isValid: true, user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in verify-password function:', error);
    
    return new Response(
      JSON.stringify({ isValid: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
