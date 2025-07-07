
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()
    
    console.log('Hash-password function called for member registration')
    
    if (!password) {
      console.error('No password provided to hash-password function')
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use Web Crypto API for password hashing (more compatible with Deno)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const saltString = Array.from(salt, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Import the password as a key
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    // Derive the hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    )
    
    const hashArray = new Uint8Array(hashBuffer)
    const hashString = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Combine salt and hash for storage
    const hashedPassword = `pbkdf2:100000:${saltString}:${hashString}`
    
    console.log('Password hashed successfully for member')

    return new Response(
      JSON.stringify({ hashedPassword }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in hash-password function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
