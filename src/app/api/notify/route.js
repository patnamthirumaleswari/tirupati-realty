import { createClient } from '@supabase/supabase-js';

const FROM_ADDRESS = 'Tirupati Realty <onboarding@resend.dev>';
const SITE_URL = 'https://tirupati-realty.pages.dev';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set — skipping email send.');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend API error:', res.status, text);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = adminClient();

    if (body.type === 'new_inquiry') {
      // Look up the ACTUAL stored inquiry by id, rather than trusting
      // whatever content the client sends here — this prevents someone
      // from spoofing arbitrary email content by calling this endpoint
      // directly with made-up sender/message fields.
      const { data: inquiry, error: inquiryError } = await supabase
        .from('inquiries')
        .select('sender_name, sender_phone, message, listing:listings(id, title, owner_id)')
        .eq('id', body.inquiryId)
        .single();

      if (inquiryError || !inquiry) {
        return Response.json({ error: 'Inquiry not found' }, { status: 404 });
      }

      const { data: ownerAuth } = await supabase.auth.admin.getUserById(
        inquiry.listing.owner_id
      );
      const ownerEmail = ownerAuth?.user?.email;
      if (!ownerEmail) return Response.json({ ok: true }); // nothing to send to

      await sendEmail({
        to: ownerEmail,
        subject: `New inquiry: ${inquiry.listing.title}`,
        html: `
          <p>You've received a new inquiry on <strong>${inquiry.listing.title}</strong>.</p>
          <p><strong>Name:</strong> ${inquiry.sender_name}<br/>
          <strong>Phone:</strong> ${inquiry.sender_phone}</p>
          ${inquiry.message ? `<p><strong>Message:</strong> ${inquiry.message}</p>` : ''}
          <p><a href="${SITE_URL}/listings/${inquiry.listing.id}">View the listing</a></p>
        `,
      });

      return Response.json({ ok: true });
    }

    if (body.type === 'listing_approved' || body.type === 'listing_rejected') {
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('id, title, owner_id')
        .eq('id', body.listingId)
        .single();

      if (listingError || !listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 });
      }

      const { data: ownerAuth } = await supabase.auth.admin.getUserById(listing.owner_id);
      const ownerEmail = ownerAuth?.user?.email;
      if (!ownerEmail) return Response.json({ ok: true });

      const approved = body.type === 'listing_approved';
      await sendEmail({
        to: ownerEmail,
        subject: approved
          ? `Your listing is now live: ${listing.title}`
          : `Your listing needs attention: ${listing.title}`,
        html: approved
          ? `<p>Good news — <strong>${listing.title}</strong> has been approved and is now visible in search.</p>
             <p><a href="${SITE_URL}/listings/${listing.id}">View your live listing</a></p>`
          : `<p><strong>${listing.title}</strong> was not approved for public listing. If you think this is a mistake, please review the listing details and contact support.</p>
             <p><a href="${SITE_URL}/dashboard">Go to your dashboard</a></p>`,
      });

      return Response.json({ ok: true });
    }

    return Response.json({ error: 'Unknown notification type' }, { status: 400 });
  } catch (err) {
    console.error('Notify API error:', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
