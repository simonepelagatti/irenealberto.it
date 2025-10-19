// Supabase Edge Function to send order confirmation emails
// Using Resend for email delivery

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  id: string
  title: string
  description: string
  unitPrice: number
  quantity: number
  isBackHome: boolean
}

interface OrderEmailData {
  sessionCode: string
  guestName: string
  guestEmail: string | null
  guestMessage: string
  items: OrderItem[]
  total: number
  hasBackHome: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate required environment variables
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY environment variable is not set')
    return new Response(
      JSON.stringify({ success: false, error: 'Email service configuration error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }

  if (!ADMIN_EMAIL || !FROM_EMAIL) {
    console.error('❌ Email configuration incomplete:', { ADMIN_EMAIL: !!ADMIN_EMAIL, FROM_EMAIL: !!FROM_EMAIL })
    return new Response(
      JSON.stringify({ success: false, error: 'Email configuration incomplete' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }

  try {
    const orderData: OrderEmailData = await req.json()

    console.log('📧 Sending emails for order:', orderData.sessionCode)

    const results = []

    // 1. Send admin notification email
    const adminEmailResult = await sendAdminEmail(orderData)
    results.push({ type: 'admin', result: adminEmailResult })

    // 2. Send guest confirmation email (if email provided)
    if (orderData.guestEmail) {
      const guestEmailResult = await sendGuestEmail(orderData)
      results.push({ type: 'guest', result: guestEmailResult })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ Email sending error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function sendAdminEmail(orderData: OrderEmailData) {
  const html = generateAdminEmailHTML(orderData)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `🎁 Nuovo regalo ricevuto! - ${orderData.sessionCode}`,
      html: html,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Admin email failed: ${JSON.stringify(data)}`)
  }

  console.log('✅ Admin email sent:', data)
  return data
}

async function sendGuestEmail(orderData: OrderEmailData) {
  const html = generateGuestEmailHTML(orderData)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [orderData.guestEmail],
      subject: `Grazie per il tuo regalo - Codice: ${orderData.sessionCode}`,
      html: html,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(`Guest email failed: ${JSON.stringify(data)}`)
  }

  console.log('✅ Guest email sent:', data)
  return data
}

function generateAdminEmailHTML(orderData: OrderEmailData): string {
  const itemsHTML = orderData.items.map(item => {
    const quantity = item.quantity || 1
    const itemTotal = item.unitPrice * quantity
    const priceDisplay = item.isBackHome
      ? '<span style="color: #4a7c59;">Libera offerta</span>'
      : `${quantity} × €${item.unitPrice.toFixed(2)} = €${itemTotal.toFixed(2)}`

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          <strong>${item.title}</strong><br>
          <small style="color: #666;">${item.description}</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">
          ${priceDisplay}
        </td>
      </tr>
    `
  }).join('')

  const totalHTML = orderData.hasBackHome && orderData.total === 0
    ? '<p style="color: #4a7c59; font-weight: bold;">Solo libera offerta - importo non specificato</p>'
    : `<p style="font-size: 1.2rem; color: #543647; font-weight: bold;">Contributo totale suggerito: €${orderData.total.toFixed(2)}</p>`

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f5ebe8, #f7ede9); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="color: #543647; margin: 0 0 10px;">🎁 Nuovo Regalo Ricevuto!</h1>
        <p style="color: #6b5856; margin: 0;">Lista regalo viaggio di nozze - Irene & Alberto</p>
      </div>

      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #543647; margin-top: 0;">Dettagli Ordine</h2>

        <p><strong>Codice:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; color: #543647; font-size: 1.1rem;">${orderData.sessionCode}</code></p>
        <p><strong>Nome ospite:</strong> ${orderData.guestName}</p>
        ${orderData.guestEmail ? `<p><strong>Email ospite:</strong> ${orderData.guestEmail}</p>` : ''}
        ${orderData.guestMessage ? `<p><strong>Messaggio:</strong><br><em style="color: #666;">"${orderData.guestMessage}"</em></p>` : ''}

        <h3 style="color: #543647; margin-top: 24px;">Esperienze Selezionate</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${itemsHTML}
        </table>

        ${totalHTML}

        <div style="margin-top: 24px; padding: 16px; background: #f7fbfa; border-left: 4px solid #543647; border-radius: 4px;">
          <p style="margin: 0;"><strong>Prossimi passi:</strong></p>
          <ol style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Attendi il bonifico con causale contenente il codice <strong>${orderData.sessionCode}</strong></li>
            <li>Associa il pagamento ricevuto a questo ordine</li>
            <li>Conferma la prenotazione delle esperienze</li>
          </ol>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; color: #999; font-size: 0.9rem;">
        <p>Irene & Alberto — 6 dicembre 2025</p>
        <p>Lista regalo viaggio di nozze</p>
      </div>
    </body>
    </html>
  `
}

function generateGuestEmailHTML(orderData: OrderEmailData): string {
  const itemsHTML = orderData.items.map(item => {
    const quantity = item.quantity || 1
    const itemTotal = item.unitPrice * quantity
    const quantityText = quantity > 1 ? `${quantity} pacchetti` : '1 pacchetto'
    const priceDisplay = item.isBackHome
      ? '<span style="color: #4a7c59;">Libera offerta</span>'
      : `${quantity} × €${item.unitPrice.toFixed(2)} = €${itemTotal.toFixed(2)}`

    return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">
          <strong>${item.title}</strong><br>
          <small style="color: #666;">${quantityText}</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">
          ${priceDisplay}
        </td>
      </tr>
    `
  }).join('')

  let totalSectionHTML = ''
  if (orderData.hasBackHome && orderData.total === 0) {
    totalSectionHTML = `
      <div style="margin: 20px 0; padding: 16px; background: #f0f7f5; border-radius: 8px; border-left: 4px solid #4a7c59;">
        <p style="margin: 0; color: #4a7c59; font-weight: bold;">"Back Home" è a libera offerta: contribuisci con l'importo che desideri.</p>
      </div>
    `
  } else if (orderData.hasBackHome && orderData.total > 0) {
    totalSectionHTML = `
      <div style="margin: 20px 0; padding: 16px; background: #f7fbfa; border-radius: 8px; text-align: right;">
        <p style="margin: 0; font-size: 1.2rem; color: #543647; font-weight: bold;">Contributo suggerito: €${orderData.total.toFixed(2)}</p>
        <p style="margin: 8px 0 0; font-size: 0.9rem; color: #666;">Il pacchetto "Back Home" è a libera offerta.</p>
      </div>
    `
  } else {
    totalSectionHTML = `
      <div style="margin: 20px 0; padding: 16px; background: #f7fbfa; border-radius: 8px; text-align: right;">
        <p style="margin: 0; font-size: 1.2rem; color: #543647; font-weight: bold;">Contributo suggerito: €${orderData.total.toFixed(2)}</p>
        <p style="margin: 8px 0 0; font-size: 0.9rem; color: #666;">Importo indicativo - puoi contribuire con l'importo che preferisci.</p>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f5ebe8, #f7ede9); padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
        <h1 style="color: #543647; margin: 0 0 10px;">Grazie ${orderData.guestName}! ❤️</h1>
        <p style="color: #6b5856; margin: 0;">Il tuo regalo ci accompagnerà nel nostro viaggio di nozze</p>
      </div>

      <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #543647; margin-top: 0;">Il tuo codice regalo</h2>
        <div style="background: linear-gradient(135deg, #faf6f5, #f0e5df); border: 2px solid #543647; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <p style="margin: 0; color: #543647; font-size: 1.5rem; font-weight: bold; letter-spacing: 0.05em;">${orderData.sessionCode}</p>
        </div>

        <h3 style="color: #543647; margin-top: 24px;">Riepilogo Regalo</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${itemsHTML}
        </table>

        ${totalSectionHTML}

        <div style="margin-top: 24px; padding: 20px; background: #fff; border: 2px solid #543647; border-radius: 8px;">
          <h3 style="margin: 0 0 12px; color: #543647;">Dati per il bonifico</h3>
          <p style="margin: 8px 0;"><strong>IBAN:</strong> IT86C0538702404000004570095</p>
          <p style="margin: 8px 0;"><strong>Intestato a:</strong> Guizzardi Alberto, Cominotti Irene</p>
          <p style="margin: 8px 0;"><strong>Banca:</strong> BPER BANCA SPA — Bologna ag 4</p>

          <div style="margin-top: 16px; padding: 12px; background: #f7fbfa; border-radius: 6px;">
            <p style="margin: 0 0 8px;"><strong>Causale:</strong></p>
            <p style="margin: 0; color: #543647; font-weight: bold;">Regalo Viaggio — Irene & Alberto — Codice: ${orderData.sessionCode}</p>
          </div>

          <p style="margin: 16px 0 0; font-size: 0.9rem; color: #666;">
            <strong>Importante:</strong> Inserisci il codice <strong>${orderData.sessionCode}</strong> nella causale del bonifico
            per permetterci di associare il tuo regalo al viaggio.
          </p>
        </div>

        ${orderData.guestMessage ? `
        <div style="margin-top: 20px; padding: 16px; background: #f0f7f5; border-left: 4px solid #4a7c59; border-radius: 4px;">
          <p style="margin: 0; font-size: 0.9rem; color: #666;"><strong>Il tuo messaggio:</strong></p>
          <p style="margin: 8px 0 0; font-style: italic; color: #543647;">"${orderData.guestMessage}"</p>
        </div>
        ` : ''}
      </div>

      <div style="margin-top: 20px; text-align: center; color: #999; font-size: 0.9rem;">
        <p>Conserva questa email come promemoria!</p>
        <p style="margin-top: 16px;">Irene & Alberto — 6 dicembre 2025</p>
        <p>Lista regalo viaggio di nozze</p>
      </div>
    </body>
    </html>
  `
}
