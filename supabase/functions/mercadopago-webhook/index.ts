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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Mercado Pago webhook:', body);

    // Get payment details
    if (body.type === 'payment') {
      // Get Mercado Pago access token from app_settings
      const { data: settings } = await supabaseClient
        .from('app_settings')
        .select('value')
        .eq('key', 'mercadopago_access_token')
        .single();

      if (!settings?.value) {
        throw new Error('Mercado Pago não configurado');
      }

      const accessToken = settings.value;

      // Get payment details from Mercado Pago
      const paymentResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${body.data.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const payment = await paymentResponse.json();
      console.log('Payment details:', payment);

      if (payment.status === 'approved') {
        const userId = payment.metadata.user_id;
        
        // Update subscription status
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'active',
            mercadopago_subscription_id: payment.id,
            expires_at: expiresAt.toISOString(),
          })
          .eq('user_id', userId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        console.log('Subscription activated for user:', userId);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to avoid MP retrying
      }
    );
  }
});
