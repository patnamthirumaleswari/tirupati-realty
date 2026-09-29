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
invisible to the public, until you act on it. Oldest listings are shown first.

**At a glance, each listing shows:** a cover photo, the property type,
locality, price and area, who posted it (with a ✓ Verified mark if you've
granted them that badge), how long it's been waiting, and Approve / Reject
buttons.

**Click "Show full details" to review the whole listing before deciding:**
- All photos (click one to enlarge). A listing with no photos is flagged in red.
- The full description
- Every detail filled in for that property type — area, bedrooms, plot size, road width, approved layout, and so on
- The amenities chosen
- A link to the pinned location on a map, and a link to open the listing exactly as a visitor would see it

The Approve / Reject buttons are repeated at the bottom of the expanded view,
so you can decide without scrolling back up.

**Other actions**
- **Reveal phone** — shows the owner's number so you can contact them if something needs clarifying. Every reveal is logged.
- **Approve** — makes the listing visible in public search immediately.
- **Reject** — the listing never goes public, and the owner sees it marked "Rejected".

**Important: think before rejecting.** There is currently no way to tell the
owner *why* a listing was rejected (the automatic email is generic), and a
rejected listing cannot be edited or resubmitted by its owner — they would
have to post a brand-new one. So if a listing just needs a small fix (a
missing photo, an unclear price), it's usually better to contact the owner
first. They can still edit it while it's pending, and you can approve it once
it's fixed. Reserve Reject for spam, fake, or clearly inappropriate listings.

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
- **Change their role** — `user` (default), `agent`, `builder`, or `admin`. Changing someone to `builder` lets them create projects (see "Builder accounts and projects" below). Changing someone to `admin` gives them full access to everything in this guide, so only do this for people you trust completely.
- You cannot change your own role from this page (a safety measure to prevent accidentally locking yourself out of admin).

**Not yet built:** there's no way to fully block/disable an account from here yet — that's a planned future addition. For now, the closest option is changing a problematic user's role, or asking Claude (or a developer) to disable the account directly in Supabase if truly necessary.

---

## Builder accounts and projects

A **project** groups all the units (flats, floors, plots) of one development under
a single public page, with the builder's declared RERA ID, total units, possession
date and an optional brochure or floor plan. Visitors can browse them at `/projects`
(linked in the site footer as "New Projects").

**Setting up a builder.** People can now request this themselves:
1. A logged-in user visits `/projects/new` and fills in "Request builder account"
   (business name, and optionally a message about their business).
2. It appears in **Builder requests** in this nav, oldest first.
3. Do a basic check, as the requirements document intends (a call-back, and business
   proof for builders).
4. Click **Approve**. This immediately changes their account's role to `builder` — a
   "My Projects" tab then appears in their account, where they can create a project and
   add units to it. Or click **Reject**; they can submit a new request afterward if they
   want to.
5. Consider also granting the **Verified** badge in **Users** if you're satisfied.

You can still change someone's role to `builder` directly from **Users**, without them
requesting it, the same as before.

**What is and isn't checked**
- **Each unit is reviewed like any other listing.** A builder's units go through the
  same pending queue. On the review card, a unit that belongs to a project shows
  "Unit in project: ..." so you can see the connection.
- **The RERA ID is declared, not verified.** The site shows it labelled as declared by
  the builder and tells buyers to check it themselves on the Andhra Pradesh RERA
  portal (rera.ap.gov.in). If a builder's RERA ID matters to your decision to verify
  them, check it on that portal yourself.
- **Projects themselves are not put through an approval queue.** Once a builder account
  exists, a new project appears on the public site immediately (its units still need
  approval). Granting the `builder` role is the point where you are deciding to trust
  them. If a project should not be there (a mistake, spam, something fake), delete it,
  as described below.
- **A unit can only be added to its own builder's project.** The database enforces this,
  so nobody can attach a listing to someone else's project.

**Deleting a project**
- A builder can delete their own project from its **Edit project** page (scroll to the
  bottom). You can delete any project: open it while logged in as admin and use
  **Edit or delete project (admin)**.
- **Deleting a project does not delete its units.** They stay live as ordinary listings and
  simply stop appearing under the project. The confirmation says how many units are
  affected before anything happens.
- The project page and its brochure file are removed permanently. This cannot be undone.
- When you delete someone else's project, it is recorded in the **Audit log**.

**Limits for now**
- Brochures can be a PDF or image up to 10 MB. When a brochure is replaced or removed, the
  old file is deleted from storage too.
- A project can't be moved to a different builder from the site.

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
listing, who granted a Verified badge, who changed whose role, who deleted
a project, and when.
Useful if you ever need to answer "who did this, and when?" This is
append-only: nothing here can be edited or deleted through the app.

---

## Things that need a developer (not doable from the admin panel yet)

- Fully blocking a user account
- Letting builders request their own builder account (today an admin has to change the role), and moving a project to a different builder
- Telling an owner *why* a listing was rejected, or letting them resubmit it (not built yet)
- Reliable email delivery to owners: approval, rejection, and new-inquiry emails currently go out from a shared test sender address. Until a sending domain is verified with the email provider (Resend), these emails may only reach the provider account's own address, so **don't rely on owners receiving them yet**. (The emails also tell owners to "contact support," and the site's contact email is still a placeholder.)
- Restoring from a weekly backup (a developer/technical person needs to do this directly in Supabase)
- Changing site-wide text, legal pages, or design

---

## If something looks wrong

If a listing, user, or piece of data looks broken or unexpected, it's
usually safest to leave it alone and flag it to a developer rather than
try to fix it directly in the database — most of the data here is
protected by security rules that assume the app's normal flows are being
used, not direct edits.
