# Tirupati Realty — Admin Panel Guide

This guide covers everything an admin can do on Tirupati Realty. All admin
pages live under `/admin/...` and require being logged in with an account
whose role is `admin`.

---

## Getting to the admin panel

Log in with an admin account. An **"Admin"** link then appears in the main
navigation bar, next to "My Account" — it's only visible to admins, so
regular users never see it. Click it to land on the pending-listings queue.

(You can also go directly to any `/admin/...` URL below — but only while
logged in as an admin. Anyone else who visits those URLs is sent back to
the homepage; the link itself isn't a secret or a key.)

A row of tabs appears at the top of every admin page: **Pending listings | Reports | Users | Localities | Amenities | Audit log**.

---

## Pending listings — `/admin/listings`

This is the moderation queue. Every listing a user submits starts here,
invisible to the public, until you act on it.

For each pending listing you can:
- **View its details** — click through to see the full listing as a visitor would
- **Reveal the owner's phone number** — same secure, logged reveal a visitor would use
- **Approve** — makes it publicly visible in search immediately
- **Reject** — the owner sees it marked "Rejected" in their own account; it never goes public

What to check before approving:
- Title and description make sense and aren't spam
- Price and area look reasonable (not obviously wrong, like ₹0 for a full house)
- Photos are actually of a property, not something unrelated
- Note: approving does **not** mean you've verified legal ownership, title, or government approvals — that's explicitly outside what this platform does (see the disclaimer shown on every listing).

---

## Reports — `/admin/reports`

When a visitor clicks "Report this listing" on any listing, it lands here
with their reason. You can review the listing and either dismiss the
report or reject the listing outright (same effect as rejecting it from
the Pending Listings queue).

---

## Users — `/admin/users`

A list of every registered account. For each user you can:

- **Grant / Remove the "Verified" badge** — shows a green checkmark next to their name wherever it appears (their listings, their profile). Use this for agents/builders you've confirmed are legitimate.
- **Change their role** — `user` (default), `agent`, `builder`, or `admin`. Changing someone to `admin` gives them full access to everything in this guide, so only do this for people you trust completely.
- You cannot change your own role from this page (a safety measure to prevent accidentally locking yourself out of admin).

**Not yet built:** there's no way to fully block/disable an account from here yet — that's a planned future addition. For now, the closest option is changing a problematic user's role, or asking Claude (or a developer) to disable the account directly in Supabase if truly necessary.

---

## Localities — `/admin/localities`

The master list of areas listings can be tagged with (Tilak Road, Alipiri,
Renigunta, etc.) — this is what populates the locality dropdown/checkboxes
everywhere on the site. You can add a new locality or deactivate one
(deactivated localities stop appearing as filter options, but existing
listings tagged with them are unaffected).

---

## Amenities — `/admin/amenities`

The master checklist of amenities (parking, lift, security, etc.) that
appears on the listing creation form. Same add/deactivate pattern as
localities.

---

## Audit log — `/admin/audit-log`

A read-only history of admin actions — who approved/rejected which
listing, who granted a Verified badge, who changed whose role, and when.
Useful if you ever need to answer "who did this, and when?" This is
append-only: nothing here can be edited or deleted through the app.

---

## Things that need a developer (not doable from the admin panel yet)

- Fully blocking a user account
- Managing builder/project listings (no UI exists yet)
- Restoring from a weekly backup (a developer/technical person needs to do this directly in Supabase)
- Changing site-wide text, legal pages, or design

---

## If something looks wrong

If a listing, user, or piece of data looks broken or unexpected, it's
usually safest to leave it alone and flag it to a developer rather than
try to fix it directly in the database — most of the data here is
protected by security rules that assume the app's normal flows are being
used, not direct edits.
