// Supabase Edge Function: create-booking (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!secret) return true; // Bypass only if Turnstile is unconfigured
  if (!token) return false;
  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('[create-booking] Turnstile error:', err);
    return false;
  }
}

function generateIcs(opts: {
  uid: string;
  summary: string;
  description: string;
  start: Date;
  end: Date;
  organizerEmail?: string;
  organizerName?: string;
}): string {
  const formatUtc = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const now = new Date();
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zizo Donor and Surrogacy//Consultation Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${opts.uid}@zizodonorandsurrogacy.com`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(opts.start)}`,
    `DTEND:${formatUtc(opts.end)}`,
    `SUMMARY:${opts.summary}`,
    `DESCRIPTION:${opts.description.replace(/\n/g, '\\n')}`,
    opts.organizerEmail
      ? `ORGANIZER;CN=${opts.organizerName || 'Zizo Care Team'}:mailto:${opts.organizerEmail}`
      : 'ORGANIZER;CN=Zizo Care Team:mailto:care@zizodonorandsurrogacy.com',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

async function sendEmailViaResend(apiKey: string, payload: {
  from: string;
  to: string;
  subject: string;
  text: string;
  attachments?: Array<{ filename: string; content: string }>;
}) {
  if (!apiKey) {
    console.info('[create-booking] Mock email sent (no RESEND_API_KEY):', payload.subject, 'to', payload.to);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[create-booking] Resend error:', err);
    }
  } catch (err) {
    console.error('[create-booking] Email dispatch error:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET') || '';
  const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
  const appUrl = (Deno.env.get('APP_URL') || 'https://zizodonorandsurrogacy.com').replace(/\/$/, '');

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 1. Honeypot check
  if (body.website_url) {
    return new Response(JSON.stringify({ error: 'Submission rejected' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Turnstile verification
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined;
  const turnstileValid = await verifyTurnstile(body.turnstile_token, turnstileSecret, clientIp);
  if (!turnstileValid) {
    return new Response(JSON.stringify({ error: 'Security verification failed. Please refresh and try again.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. Rate limiting check (max 5 bookings per email per hour)
  const clientEmail = String(body.email || '').trim().toLowerCase();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count: recentCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('email', clientEmail)
    .gte('created_at', oneHourAgo);

  if ((recentCount || 0) >= 5) {
    return new Response(JSON.stringify({ error: 'Booking rate limit reached. Please contact us directly if you need assistance.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 4. Fetch consultation type
  const { data: ct, error: ctErr } = await supabase
    .from('consultation_types')
    .select('*')
    .eq('id', body.consultation_type_id)
    .eq('active', true)
    .single();

  if (ctErr || !ct) {
    return new Response(JSON.stringify({ error: 'Selected consultation type is not available.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Determine staff member to assign (default coordinator if not specified)
  let staffId = body.staff_id;
  if (!staffId) {
    const { data: defaultStaff } = await supabase
      .from('staff')
      .select('id')
      .eq('active', true)
      .in('role', ['coordinator', 'owner'])
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    staffId = defaultStaff?.id;
  }

  if (!staffId) {
    return new Response(JSON.stringify({ error: 'No coordinator available to receive this booking.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const startAt = new Date(body.start_at);
  if (isNaN(startAt.getTime()) || startAt.getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: 'Please choose a future consultation time.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const endAt = new Date(startAt.getTime() + ct.duration_min * 60000);

  // Generate cryptographic single-use manage token
  const rawManageToken = crypto.randomUUID() + crypto.randomUUID();
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawManageToken));
  const tokenHash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // 5. Atomic insert with exclusion constraint
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      consultation_type_id: ct.id,
      staff_id: staffId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: 'confirmed',
      name: String(body.name || '').trim(),
      email: clientEmail,
      phone: String(body.phone || '').trim(),
      country: String(body.country || '').trim(),
      audience: String(body.audience || 'Intended Parent'),
      channel: String(body.channel || 'Google Meet'),
      note: body.note ? String(body.note).trim() : null,
      token_hash: tokenHash,
    })
    .select('id')
    .single();

  if (insertError) {
    // Postgres code 23P01 is exclusion_violation
    if (insertError.code === '23P01') {
      return new Response(
        JSON.stringify({ error: 'That time was just taken. Please pick another available slot.' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    return new Response(JSON.stringify({ error: insertError.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 6. Generate .ics file and dispatch confirmation email
  const manageUrl = `${appUrl}/book/manage/?token=${rawManageToken}`;
  const icsContent = generateIcs({
    uid: booking.id,
    summary: `Zizo Consultation: ${ct.name}`,
    description: `Your ${ct.name} with Zizo Donor and Surrogacy.\nChannel: ${body.channel}\nManage or reschedule: ${manageUrl}`,
    start: startAt,
    end: endAt,
  });

  const icsBase64 = btoa(icsContent);

  // Dispatch client confirmation
  await sendEmailViaResend(resendApiKey, {
    from: Deno.env.get('RESEND_FROM_EMAIL') || 'care@zizodonorandsurrogacy.com',
    to: clientEmail,
    subject: `Zizo Consultation Confirmed: ${ct.name}`,
    text: `Hello ${body.name},\n\nYour ${ct.name} is confirmed for ${startAt.toUTCString()} (WAT: ${new Date(startAt.getTime() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).\n\nSelected channel: ${body.channel}\n\nTo reschedule or cancel your consultation, visit:\n${manageUrl}\n\nWarm regards,\nZizo Donor and Surrogacy Team`,
    attachments: [
      {
        filename: 'consultation.ics',
        content: icsBase64,
      },
    ],
  });

  // Dispatch coordinator alert
  const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'coordinator@zizodonorandsurrogacy.com';
  await sendEmailViaResend(resendApiKey, {
    from: Deno.env.get('RESEND_FROM_EMAIL') || 'care@zizodonorandsurrogacy.com',
    to: adminEmail,
    subject: `New Booking: ${body.name} (${ct.name})`,
    text: `A new consultation has been booked.\n\nName: ${body.name}\nEmail: ${clientEmail}\nPhone: ${body.phone}\nCountry: ${body.country}\nRole: ${body.audience}\nType: ${ct.name}\nTime UTC: ${startAt.toISOString()}\nChannel: ${body.channel}\nNote: ${body.note || 'None'}`,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      manageToken: rawManageToken,
      bookingId: booking.id,
      manageUrl,
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
