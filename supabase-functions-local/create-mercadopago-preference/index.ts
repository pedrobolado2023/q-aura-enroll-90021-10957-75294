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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token
    supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    })

    // Get user
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get request body
    const { name, email, phone, whatsapp } = await req.json()

    // Get Mercado Pago credentials from app_settings
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['mercadopago_access_token', 'mercadopago_public_key'])

    if (settingsError) {
      throw new Error(`Settings error: ${settingsError.message}`)
    }

    const settingsObj = settings.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, string>)

    const accessToken = settingsObj.mercadopago_access_token

    if (!accessToken) {
      throw new Error('Mercado Pago access token not configured')
    }

    // Create preference in Mercado Pago
    const preferenceData = {
      items: [
        {
          title: "Q-aura - Sistema de Estudos via WhatsApp",
          description: "Assinatura mensal do sistema Q-aura",
          quantity: 1,
          unit_price: 9.90,
          currency_id: "BRL"
        }
      ],
      payer: {
        name: name,
        email: email,
        phone: {
          number: phone
        }
      },
      back_urls: {
        success: `${req.headers.get('origin')}/pagamento-sucesso`,
        failure: `${req.headers.get('origin')}/pagamento-erro`,
        pending: `${req.headers.get('origin')}/pagamento-pendente`
      },
      auto_return: "approved",
      external_reference: user.id,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`
    }

    // Call Mercado Pago API
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData)
    })

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text()
      throw new Error(`Mercado Pago API error: ${mpResponse.status} - ${errorText}`)
    }

    const preference = await mpResponse.json()

    // Save subscription record
    await supabase
      .from('subscriptions')
      .insert([{
        user_id: user.id,
        mercadopago_subscription_id: preference.id,
        status: 'pending',
        amount: 9.90
      }])

    return new Response(
      JSON.stringify({
        init_point: preference.init_point,
        preference_id: preference.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})