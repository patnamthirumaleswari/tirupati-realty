export function formatPrice(listing) {
  if (listing.price_on_request) return 'Price on request';
  const amount = listing.purpose === 'rent' ? listing.rent_amount : listing.price;
  if (!amount) return 'Price on request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

// "2027-03-01" -> "Mar 2027". Returns null for a missing or invalid date so
// callers can simply skip showing it. The date is read as a local date on
// purpose: parsing a bare "YYYY-MM-DD" as UTC could show the previous month
// in some timezones.
export function formatPossession(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

// The storage path of a brochure, worked out from its public web address,
// e.g. ".../object/public/project-brochures/<user-id>/<file>.pdf?x=1" ->
// "<user-id>/<file>.pdf". Returns null for anything that is not a file in
// the brochure bucket, so a bad or foreign address can never make us try to
// delete something else.
export function brochurePathFromUrl(url) {
  if (typeof url !== 'string') return null;
  const marker = '/object/public/project-brochures/';
  const at = url.indexOf(marker);
  if (at === -1) return null;
  const raw = url.slice(at + marker.length).split('?')[0].split('#')[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch (err) {
    return null;
  }
}
