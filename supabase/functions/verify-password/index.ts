
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    const { email, password, type } = await req.json()

    if (!email || !password || !type) {
      return new Response(
        JSON.stringify({ error: 'Email, password and type are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from the appropriate table
    const { data: user, error } = await supabaseAdmin
      .from(type === 'member' ? 'MemberMST' : 'UserMST')
      .select('*')
      .ilike(type === 'member' ? 'MemberEmailId' : 'Username', email)
      .single()

    if (error || !user) {
      return new Response(
        JSON.stringify({ isValid: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Compare the provided password with the stored hash
    const isValid = await bcrypt.compare(password, user.password)

    return new Response(
      JSON.stringify({ 
        isValid,
        user: isValid ? user : null
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
