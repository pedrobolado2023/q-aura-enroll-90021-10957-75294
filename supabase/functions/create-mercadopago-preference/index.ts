import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { name, email, phone, whatsapp } = await req.json();

    // Get Mercado Pago access token from app_settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('value')
      .eq('key', 'mercadopago_access_token')
      .single();

    if (settingsError || !settings?.value) {
      throw new Error('Mercado Pago não configurado. Configure as credenciais no painel admin.');
    }

    const accessToken = settings.value;

    // Create preference in Mercado Pago
    const preferenceData = {
      items: [
        {
          title: 'Assinatura Q-aura - Mensal',
          description: 'Acesso completo ao sistema Q-aura',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: 9.90,
        },
      ],
      payer: {
        name: name,
        email: email,
        phone: {
          number: phone,
        },
      },
      back_urls: {
        success: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
        failure: `${req.headers.get('origin')}/assinar?status=failure`,
        pending: `${req.headers.get('origin')}/assinar?status=pending`,
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`,
      metadata: {
        user_id: user.id,
        whatsapp: whatsapp,
      },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    });

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('Mercado Pago error:', errorText);
      throw new Error('Erro ao criar preferência no Mercado Pago');
    }

    const preference = await mpResponse.json();

    // Create pending subscription record
    await supabaseClient.from('subscriptions').insert({
      user_id: user.id,
      status: 'pending',
      amount: 9.90,
    });

    return new Response(
      JSON.stringify({ 
        init_point: preference.init_point,
        preference_id: preference.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
