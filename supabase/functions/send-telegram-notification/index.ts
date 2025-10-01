import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReservationData {
  reservationNumber: number
  firstName: string
  lastName: string
  phone: string
  appointmentDate: string
  appointmentTime: string
  totalPrice: number
  depositPaid: number
  artistName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { reservation }: { reservation: ReservationData } = await req.json()

    // Get Telegram bot token and chat ID from environment variables
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram configuration missing')
    }

    // Format the message
    const remainingAmount = reservation.totalPrice - reservation.depositPaid
    const message = `
🦂 *New Reservation Created* 🦂

📋 *Reservation #${reservation.reservationNumber}*

👤 *Customer:* ${reservation.firstName} ${reservation.lastName}
📞 *Phone:* ${reservation.phone}
📅 *Date:* ${new Date(reservation.appointmentDate).toLocaleDateString('en-GB')}
🕐 *Time:* ${reservation.appointmentTime}
${reservation.artistName ? `🎨 *Artist:* ${reservation.artistName}` : ''}

💰 *Total Price:* €${reservation.totalPrice.toFixed(2)}
💳 *Deposit:* €${reservation.depositPaid.toFixed(2)}
💸 *Remaining:* €${remainingAmount.toFixed(2)}

🏪 *Krampus Tattoo Studio*
    `.trim()

    // Send message to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Telegram API error: ${errorData}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, messageId: result.message_id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    
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