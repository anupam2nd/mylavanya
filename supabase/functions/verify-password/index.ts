
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
    
    // Parse the stored hash - Modified to be more flexible with parsing
    const parts = hashedPassword.split('$');
    
    // We should have at least 3 parts (empty, algorithm, params+salt+hash)
    if (parts.length < 3) {
      console.error('Invalid hash format, expected at least 3 parts but got', parts.length);
      return false;
    }
    
    const algorithm = parts[1];
    
    if (algorithm !== 'pbkdf2-sha256') {
      console.error('Unsupported algorithm:', algorithm);
      return false;
    }

    // The format should be $pbkdf2-sha256$i=iterations$salt$hash
    // Find the iterations part
    let iterations = 0;
    let saltString = '';
    let storedHash = '';
    
    // Loop through remaining parts to extract parameters
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('i=')) {
        iterations = parseInt(part.substring(2));
      } else if (!saltString && part.length > 0) {
        saltString = part;
      } else if (!storedHash && part.length > 0) {
        storedHash = part;
      }
    }
    
    if (iterations === 0 || !saltString || !storedHash) {
      console.error('Missing required hash components', {
        hasIterations: iterations > 0,
        hasSalt: !!saltString,
        hasHash: !!storedHash
      });
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
