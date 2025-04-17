
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()

    if (!password) {
      console.error('Password is required but was not provided')
      return new Response(
        JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Attempting to hash password...')
    
    // Generate salt and hash password with more robust error handling
    try {
      const salt = await bcrypt.genSalt(10)
      console.log('Salt generated successfully')
      
      const hashedPassword = await bcrypt.hash(password, salt)
      console.log('Password hashed successfully')

      return new Response(
        JSON.stringify({ hashedPassword }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (hashError) {
      console.error('Error during password hashing process:', hashError)
      return new Response(
        JSON.stringify({ error: 'Failed to hash password', details: hashError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    // Log the actual error for debugging
    console.error('Error in hash-password function:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
