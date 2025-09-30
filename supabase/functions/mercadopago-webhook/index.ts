import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for webhooks
    )

    // Get webhook data
    const webhookData = await req.json()
    
    console.log('Webhook received:', webhookData)

    // Check if it's a payment notification
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data.id

      // Get Mercado Pago access token
      const { data: settings } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'mercadopago_access_token')
        .single()

      if (!settings?.value) {
        throw new Error('Mercado Pago access token not found')
      }

      // Get payment details from Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${settings.value}`,
        }
      })

      if (!paymentResponse.ok) {
        throw new Error(`Failed to get payment details: ${paymentResponse.status}`)
      }

      const payment = await paymentResponse.json()
      
      // Update subscription status based on payment status
      const subscriptionStatus = payment.status === 'approved' ? 'active' : 
                                 payment.status === 'rejected' ? 'cancelled' : 'pending'

      // Find subscription by external_reference (user_id)
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', payment.external_reference)
        .eq('status', 'pending')
        .single()

      if (subError) {
        console.error('Subscription not found:', subError)
        throw new Error('Subscription not found')
      }

      // Update subscription
      await supabase
        .from('subscriptions')
        .update({
          status: subscriptionStatus,
          updated_at: new Date().toISOString(),
          expires_at: subscriptionStatus === 'active' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days from now
            null
        })
        .eq('id', subscription.id)

      console.log(`Subscription ${subscription.id} updated to ${subscriptionStatus}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})