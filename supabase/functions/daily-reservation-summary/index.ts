import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Reservation {
  id: string
  reservation_number: number
  first_name: string
  last_name: string
  phone: string
  appointment_date: string
  appointment_time: string
  total_price: number
  deposit_paid: number
  deposit_paid_status: boolean
  rest_paid_status: boolean
  design_images: string[]
  notes: string | null
  artist_id: string | null
  created_at: string
}

interface Staff {
  id: string
  name: string
  role: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body to check for manual date override
    let requestBody = {}
    try {
      const bodyText = await req.text()
      if (bodyText) {
        requestBody = JSON.parse(bodyText)
      }
    } catch (e) {
      // Ignore JSON parse errors for empty body
    }

    // Get environment variables
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_DAILY_BOT_TOKEN')
    const TELEGRAM_DAILY_CHAT_ID = Deno.env.get('TELEGRAM_DAILY_CHAT_ID')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_DAILY_CHAT_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables')
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get target date - either from request body or today's date
    const targetDate = (requestBody as any).date || new Date().toISOString().split('T')[0]
    const isManual = (requestBody as any).manual || false
    const dateLabel = isManual ? 'Manual Request' : 'Scheduled'

    // Fetch reservations for target date
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('appointment_date', targetDate)
      .order('appointment_time', { ascending: true })

    if (reservationsError) {
      throw new Error(`Error fetching reservations: ${reservationsError.message}`)
    }

    // Fetch staff data for artist names
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('id, name, role')

    if (staffError) {
      throw new Error(`Error fetching staff: ${staffError.message}`)
    }

    const staffMap = new Map(staff.map((s: Staff) => [s.id, s.name]))

    // If no reservations for today, send a simple message
    if (!reservations || reservations.length === 0) {
      const message = `🎨 *Daily Reservations* 🎨\n\n📅 *Date:* ${new Date(targetDate).toLocaleDateString('en-GB')} ${isManual ? '(Manual)' : ''}\n\n📋 No reservations scheduled for this date.\n\n🏪 *Krampus Tattoo Studio*`
      
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_DAILY_CHAT_ID, message)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Daily summary sent (no reservations)', date: targetDate }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send header message
    const headerMessage = `🎨 *Daily Reservations* 🎨\n\n📅 *Date:* ${new Date(targetDate).toLocaleDateString('en-GB')} ${isManual ? '(Manual)' : ''}\n\n📊 *${reservations.length} reservation${reservations.length > 1 ? 's' : ''} scheduled*\n\n🏪 *Krampus Tattoo Studio*`
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_DAILY_CHAT_ID, headerMessage)

    // Small delay after header
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Send individual message for each reservation
    for (let i = 0; i < reservations.length; i++) {
      const reservation = reservations[i]
      const artistName = reservation.artist_id ? staffMap.get(reservation.artist_id) || 'Not assigned' : 'Not assigned'
      const paymentStatus = reservation.deposit_paid_status && reservation.rest_paid_status 
        ? '✅ Fully Paid' 
        : reservation.deposit_paid_status 
        ? '🟡 Deposit Paid' 
        : '🔴 Pending'

      const remainingAmount = reservation.total_price - reservation.deposit_paid

      // Create individual reservation message
      let reservationMessage = `📋 *Reservation #${reservation.reservation_number}*\n\n`
      reservationMessage += `👤 *Client:* ${reservation.first_name} ${reservation.last_name}\n`
      reservationMessage += `📞 *Phone:* ${reservation.phone}\n`
      reservationMessage += `🕐 *Time:* ${reservation.appointment_time}\n`
      reservationMessage += `🎨 *Artist:* ${artistName}\n\n`
      reservationMessage += `💰 *Total Price:* €${reservation.total_price.toFixed(2)}\n`
      reservationMessage += `💳 *Deposit:* €${reservation.deposit_paid.toFixed(2)}\n`
      reservationMessage += `💸 *Remaining:* €${remainingAmount.toFixed(2)}\n`
      reservationMessage += `💳 *Status:* ${paymentStatus}\n`
      
      if (reservation.notes) {
        reservationMessage += `\n📝 *Notes:* ${reservation.notes}\n`
      }

      if (reservation.design_images && reservation.design_images.length > 0) {
        reservationMessage += `\n🖼️ *${reservation.design_images.length} design image${reservation.design_images.length > 1 ? 's' : ''}*`
      }

      // Send the reservation message
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_DAILY_CHAT_ID, reservationMessage)

      // Small delay between message and images
      await new Promise(resolve => setTimeout(resolve, 500))

      // Send design images as photos if they exist
      if (reservation.design_images && reservation.design_images.length > 0) {
        for (let j = 0; j < reservation.design_images.length; j++) {
          const imageData = reservation.design_images[j]
          const imageCaption = `🖼️ Design ${j + 1}/${reservation.design_images.length} - Reservation #${reservation.reservation_number}`
          
          try {
            // Send as photo to preserve quality
            await sendTelegramPhoto(TELEGRAM_BOT_TOKEN, TELEGRAM_DAILY_CHAT_ID, imageData, imageCaption)
          } catch (imageError) {
            console.error(`Error sending image ${j + 1} for reservation ${reservation.reservation_number}:`, imageError)
            // Send error message instead of failing completely
            await sendTelegramMessage(
              TELEGRAM_BOT_TOKEN, 
              TELEGRAM_DAILY_CHAT_ID, 
              `❌ Failed to send design image ${j + 1} for reservation #${reservation.reservation_number}`
            )
          }
          
          // Small delay between images
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }

      // Longer delay between reservations
      if (i < reservations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Daily reservations sent successfully for ${new Date(targetDate).toLocaleDateString('en-GB')}`,
        reservationsCount: reservations.length,
        date: targetDate,
        manual: isManual
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error sending daily reservations:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function sendTelegramMessage(botToken: string, chatId: string, message: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Telegram API error: ${errorData}`)
  }

  return response.json()
}

async function sendTelegramPhoto(botToken: string, chatId: string, imageData: string, caption: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  
  // Check if it's a base64 data URL
  if (imageData.startsWith('data:image/')) {
    // Extract base64 data
    const base64Data = imageData.split(',')[1]
    
    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    // Create form data
    const formData = new FormData()
    formData.append('chat_id', chatId)
    formData.append('caption', caption)
    formData.append('parse_mode', 'Markdown')
    
    // Create blob and append as file
    const blob = new Blob([binaryData], { type: 'image/jpeg' })
    formData.append('photo', blob, 'design.jpg')
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Telegram photo API error: ${errorData}`)
    }

    return response.json()
  } else {
    // If it's a regular URL, send it directly
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: imageData,
        caption: caption,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Telegram photo API error: ${errorData}`)
    }

    return response.json()
  }
}