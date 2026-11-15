// Supabase Edge Function: submit-form (Deno)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    console.error('[submit-form] Turnstile error:', err);
    return false;
  }
}

async function sendEmailViaResend(apiKey: string, payload: {
  from: string;
  to: string;
  subject: string;
  text: string;
}) {
  if (!apiKey) {
    console.info('[submit-form] Mock email:', payload.subject, 'to', payload.to);
    return;
  }
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[submit-form] Email error:', err);
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
    return new Response(JSON.stringify({ error: 'Security verification failed. Please refresh and try again.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const formType = String(body.form_type || 'contact').toLowerCase();

  // 1. Newsletter Subscription
  if (formType === 'newsletter') {
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return new Response(JSON.stringify({ error: 'A valid email address is required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: subErr } = await supabase.from('subscribers').upsert(
      {
        email,
        name: body.name ? String(body.name).trim() : null,
        status: 'pending',
        consent_text: 'I agree to receive occasional updates and information from Zizo Donor and Surrogacy.',
      },
      { onConflict: 'email' }
    );

    if (subErr) {
      return new Response(JSON.stringify({ error: subErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await sendEmailViaResend(resendApiKey, {
      from: fromEmail,
      to: email,
      subject: 'Confirm your Zizo subscription',
      text: `Hello ${body.name || 'there'},\n\nThank you for subscribing to Zizo Donor and Surrogacy updates. We promise to send only thoughtful, relevant information.\n\nWarm regards,\nZizo Team`,
    });

    return new Response(JSON.stringify({ ok: true, message: 'Thank you for subscribing.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 2. Surrogate / Egg Donor Application
  if (formType === 'surrogate_application' || formType === 'egg_donor_application') {
    const kind = formType === 'surrogate_application' ? 'surrogate' : 'egg_donor';
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();

    if (!email || !name || !phone) {
      return new Response(JSON.stringify({ error: 'Please provide your name, email, and phone number.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: appErr } = await supabase.from('applications').insert({
      kind,
      name,
      email,
      phone,
      age_range: String(body.age_range || '21-35'),
      country: String(body.country || 'Nigeria'),
      city: String(body.city || 'Lagos'),
      answers: body.answers || {},
      status: 'new',
    });

    if (appErr) {
      return new Response(JSON.stringify({ error: appErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const title = kind === 'surrogate' ? 'Gestational Surrogate Initial Application' : 'Egg Donor Initial Application';

    await sendEmailViaResend(resendApiKey, {
      from: fromEmail,
      to: email,
      subject: `Zizo Application Received: ${title}`,
      text: `Hello ${name},\n\nThank you for reaching out to Zizo. We have safely received your initial ${title.toLowerCase()}.\n\nA member of our coordination team will review your details with complete discretion and get in touch.\n\nWarm regards,\nZizo Care Team`,
    });

    await sendEmailViaResend(resendApiKey, {
      from: fromEmail,
      to: adminEmail,
      subject: `New Application: ${name} (${title})`,
      text: `A new ${kind} application has been submitted:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${body.country}\nCity: ${body.city}`,
    });

    return new Response(JSON.stringify({ ok: true, redirect: '/thank-you/' }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // 3. General Inquiries & Cost Estimates
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const message = String(body.message || '').trim();

  if (!email || !name || !message) {
    return new Response(JSON.stringify({ error: 'Please provide your name, email, and message.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { error: inqErr } = await supabase.from('inquiries').insert({
    type: formType,
    name,
    email,
    phone: body.phone ? String(body.phone).trim() : null,
    country: body.country ? String(body.country).trim() : null,
    message,
    status: 'new',
  });

  if (inqErr) {
    return new Response(JSON.stringify({ error: inqErr.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await sendEmailViaResend(resendApiKey, {
    from: fromEmail,
    to: email,
    subject: 'Thank you for contacting Zizo Donor and Surrogacy',
    text: `Hello ${name},\n\nThank you for reaching out to Zizo. We have received your message and will respond promptly.\n\nWarm regards,\nZizo Care Team`,
  });

  await sendEmailViaResend(resendApiKey, {
    from: fromEmail,
    to: adminEmail,
    subject: `New Inquiry from ${name}`,
    text: `New message received:\n\nName: ${name}\nEmail: ${email}\nPhone: ${body.phone || 'N/A'}\nCountry: ${body.country || 'N/A'}\nMessage:\n${message}`,
  });

  return new Response(JSON.stringify({ ok: true, redirect: '/thank-you/' }), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
