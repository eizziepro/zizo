// Supabase Edge Function: send-reminders (pg_cron triggered)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
  const in1h = new Date(now.getTime() + 3600 * 1000).toISOString();

  const { data: due24 } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_24h_sent', false)
    .lte('start_at', in24h)
    .gt('start_at', now.toISOString());

  for (const bk of due24 || []) {
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM_EMAIL') || 'care@zizodonorandsurrogacy.com',
          to: bk.email,
          subject: 'Reminder: Your Zizo consultation tomorrow',
          text: `Hello ${bk.name}, this is a gentle reminder of your upcoming Zizo consultation.`,
        }),
      });
    }
    await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', bk.id);
  }

  const { data: due1 } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_1h_sent', false)
    .lte('start_at', in1h)
    .gt('start_at', now.toISOString());

  for (const bk of due1 || []) {
    await supabase.from('bookings').update({ reminder_1h_sent: true }).eq('id', bk.id);
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
});
