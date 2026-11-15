// Supabase Edge Function: submit-review (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function anonymizeDisplayName(input = ''): string {
  const trimmed = String(input).trim();
  if (!trimmed) return 'Anonymous';
  if (/^Parent\s+[A-Z0-9& ]+$/i.test(trimmed)) return trimmed;
  if (/^[A-Z]\.[A-Z]\.,/i.test(trimmed)) return trimmed;
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return `${parts[0][0].toUpperCase()}.`;
  return `${parts[0][0].toUpperCase()}.${parts[parts.length - 1][0].toUpperCase()}.`;
}

function containsUrl(text = ''): boolean {
  return /https?:\/\/|www\./i.test(text);
}

async function verifyTurnstile(token: string, secret: string, ip?: string): Promise<boolean> {
  if (!secret) return true;
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
    console.error('[submit-review] Turnstile error:', err);
    return false;
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
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'care@zizodonorandsurrogacy.com';
  const adminEmail = Deno.env.get('ADMIN_NOTIFICATION_EMAIL') || 'coordinator@zizodonorandsurrogacy.com';

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Honeypot check
  if (body.website_url) {
    return new Response(JSON.stringify({ error: 'Submission rejected' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Turnstile verification
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || undefined;
  const turnstileValid = await verifyTurnstile(body.turnstile_token, turnstileSecret, clientIp);
  if (!turnstileValid) {
    return new Response(JSON.stringify({ error: 'Security check failed. Please refresh and try again.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validation
  const rating = Number(body.rating);
  if (!rating || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: 'Please provide a star rating between 1 and 5.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const text = String(body.body || '').trim();
  if (text.length < 50 || text.length > 1500) {
    return new Response(JSON.stringify({ error: 'Reviews must be between 50 and 1,500 characters.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (containsUrl(text) || containsUrl(body.title || '')) {
    return new Response(JSON.stringify({ error: 'For privacy and security, links are not permitted in reviews.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!body.consent_publish || !body.consent_anonymous) {
    return new Response(JSON.stringify({ error: 'Please accept both consent checkboxes to submit.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Handle verified token if present
  let bookingId: string | null = null;
  let isVerified = false;
  const token = body.token ? String(body.token).trim() : '';

  if (token) {
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const { data: bk, error: bkErr } = await supabase
      .from('bookings')
      .select('id, review_token_used')
      .eq('review_token_hash', tokenHash)
      .single();

    if (bkErr || !bk) {
      return new Response(JSON.stringify({ error: 'Invalid or expired review invitation token.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (bk.review_token_used) {
      return new Response(JSON.stringify({ error: 'This review invitation link has already been used.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    bookingId = bk.id;
    isVerified = true;

    // Mark token as used
    await supabase.from('bookings').update({ review_token_used: true }).eq('id', bk.id);
  }

  const role = ['Intended Parent', 'Surrogate', 'Egg Donor'].includes(body.role)
    ? body.role
    : 'Intended Parent';

  const { error: insertErr } = await supabase.from('reviews').insert({
    booking_id: bookingId,
    display_name: anonymizeDisplayName(body.display_name),
    role,
    rating,
    title: String(body.title || '').trim().slice(0, 140),
    body: text,
    country: body.country ? String(body.country).trim() : null,
    status: 'pending',
    featured: false,
    verified: isVerified,
    source: isVerified ? 'verified_client' : 'public',
    consent_publish: true,
  });

  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Notify team of pending review
  if (resendApiKey) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `New Review Pending Moderation (${isVerified ? 'Verified' : 'Public'})`,
        text: `A new ${role} review was submitted and is awaiting moderation in the admin portal.\n\nRating: ${rating}/5\nTitle: ${body.title}\nText:\n${text}`,
      }),
    }).catch((e) => console.error('[submit-review notify]', e));
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Thank you for sharing your experience. Your review has been submitted for moderation.',
    }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
});
