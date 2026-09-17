export function formatPrice(listing) {
  if (listing.price_on_request) return 'Price on request';
  const amount = listing.purpose === 'rent' ? listing.rent_amount : listing.price;
  if (!amount) return 'Price on request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
}
