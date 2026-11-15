// Supabase Edge Function: create-booking (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const body = await req.json();
  if (body.website_url) return new Response(JSON.stringify({ error: 'Rejected' }), { status: 400 });

  const { data: ct } = await supabase
    .from('consultation_types')
    .select('*')
    .eq('id', body.consultation_type_id)
    .eq('active', true)
    .single();
  if (!ct) return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });

  const startAt = new Date(body.start_at);
  const endAt = new Date(startAt.getTime() + ct.duration_min * 60000);
  const rawToken = crypto.randomUUID() + crypto.randomUUID();
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawToken));
  const tokenHash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

  const { error } = await supabase.from('bookings').insert({
    consultation_type_id: ct.id,
    staff_id: body.staff_id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    status: 'confirmed',
    name: body.name,
    email: body.email,
    phone: body.phone,
    country: body.country,
    audience: body.audience,
    channel: body.channel,
    note: body.note || null,
    token_hash: tokenHash,
  });

  if (error) {
    // Postgres 23P01 = exclusion_violation (double booking prevented by btree_gist)
    if (error.code === '23P01') {
      return new Response(
        JSON.stringify({ error: 'That time was just taken. Please pick another slot.' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true, manageToken: rawToken }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});
