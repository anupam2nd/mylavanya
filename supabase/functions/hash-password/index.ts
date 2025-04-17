
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode as encodeBase64 } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Custom password hashing function for Deno environment
 * Uses PBKDF2 with SHA-256 for secure password hashing
 */
async function hashPassword(password: string, saltRounds = 10): Promise<string> {
  try {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltString = encodeBase64(salt);
    
    // Encode password as UTF-8
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // Use PBKDF2 for password hashing
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    
    const iterations = 10000 * saltRounds;
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
    
    // Return in a format with algorithm, iterations, salt and hash
    // Final format: $pbkdf2-sha256$i=100000$<salt>$<hash>
    const hashedPassword = `$pbkdf2-sha256$i=${iterations}$${saltString}$${hashString}`;
    console.log('Generated hash format:', hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error('Error in hashPassword function:', error);
    throw new Error(`Failed to hash password: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received hash-password request');
    const { password } = await req.json()

    if (!password) {
      console.error('Password is required but was not provided')
      return new Response(
        JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Attempting to hash password...');
    
    try {
      const hashedPassword = await hashPassword(password);
      console.log('Password hashed successfully');

      return new Response(
        JSON.stringify({ hashedPassword }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (hashError) {
      console.error('Error during password hashing process:', hashError);
      return new Response(
        JSON.stringify({ error: 'Failed to hash password', details: hashError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    console.error('Error in hash-password function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
