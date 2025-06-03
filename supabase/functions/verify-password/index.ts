
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

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
    console.log("Hash starts with $2b$:", hashedPassword ? hashedPassword.startsWith('$2b$') : "N/A")
    
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

    // Use bcrypt.compareSync for better compatibility in Deno
    let isValid = false
    try {
      isValid = await bcrypt.compare(password, hashedPassword)
      console.log("Password verification result:", isValid)
    } catch (compareError) {
      console.error("Bcrypt compare error:", compareError)
      // Fallback: try with sync version
      try {
        isValid = bcrypt.compareSync(password, hashedPassword)
        console.log("Password verification result (sync):", isValid)
      } catch (syncError) {
        console.error("Bcrypt sync compare error:", syncError)
        throw new Error("Password comparison failed")
      }
    }

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
