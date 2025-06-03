
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
    const { password, hashedPassword } = await req.json()
    
    console.log("Verifying password...")
    console.log("Plain password received:", password ? "Yes" : "No")
    console.log("Hashed password received:", hashedPassword ? "Yes" : "No")
    console.log("Hash format:", hashedPassword ? hashedPassword.substring(0, 20) + "..." : "N/A")
    
    if (!password || !hashedPassword) {
      console.error("Missing password or hashedPassword")
      return new Response(
        JSON.stringify({ error: 'Password and hashedPassword are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the stored hash
    const hashParts = hashedPassword.split(':')
    if (hashParts.length !== 4 || hashParts[0] !== 'pbkdf2') {
      console.error("Invalid hash format")
      return new Response(
        JSON.stringify({ error: 'Invalid hash format', isValid: false }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const iterations = parseInt(hashParts[1])
    const saltString = hashParts[2]
    const storedHashString = hashParts[3]
    
    // Convert salt from hex string to Uint8Array
    const salt = new Uint8Array(
      saltString.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []
    )
    
    // Hash the provided password with the same salt and iterations
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      key,
      256
    )
    
    const hashArray = new Uint8Array(hashBuffer)
    const computedHashString = Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('')
    
    // Compare the hashes
    const isValid = computedHashString === storedHashString
    
    console.log("Password verification result:", isValid)

    return new Response(
      JSON.stringify({ isValid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error in verify-password function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', isValid: false }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
