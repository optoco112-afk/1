import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    // Get current time in UTC
    const now = new Date()
    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()

    console.log(`Scheduler triggered at ${now.toISOString()} (UTC ${currentHour}:${currentMinute})`)

    // Check if it's midnight UTC (00:00)
    if (currentHour === 0 && currentMinute === 0) {
      console.log('Triggering daily reservation summary...')
      
      // Call the daily summary function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/daily-reservation-summary`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Daily summary failed: ${result.error || 'Unknown error'}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Daily summary sent successfully',
          timestamp: now.toISOString(),
          result: result
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Not midnight, just acknowledge the ping
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Scheduler ping at ${now.toISOString()}. Next summary at next 00:00 UTC.`,
          currentTime: now.toISOString(),
          nextTrigger: 'Next 00:00 UTC'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in daily scheduler:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})