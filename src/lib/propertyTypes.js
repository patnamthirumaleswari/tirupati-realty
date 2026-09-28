// Single source of truth for property types across the app — the
// listing creation form, edit form, search filters, and display labels
// all import from here rather than duplicating this mapping.
//
// Deliberately scoped to types genuinely relevant to Tirupati (a single
// mid-size town), not a full pan-India taxonomy — see 0012_expand_
// property_types.sql for the reasoning.
//
// `fieldTemplate` decides which existing set of type-specific fields
// applies: 'building' reuses the apartment-style fields (bedrooms,
// bathrooms, floor, age, facing, furnishing); 'land' reuses the
// land-style fields (plot dimensions, road width, approved layout).

export const PROPERTY_TYPES = [
  // Residential
  { value: 'apartment', label: 'Apartment', shortLabel: 'Apartment', category: 'residential', fieldTemplate: 'building' },
  { value: 'villa', label: 'Independent House/Villa', shortLabel: 'Villa', category: 'residential', fieldTemplate: 'building' },
  { value: 'builder_floor', label: 'Independent/Builder Floor', shortLabel: 'Builder Floor', category: 'residential', fieldTemplate: 'building' },
  { value: 'studio', label: 'Studio Apartment / 1 RK', shortLabel: 'Studio', category: 'residential', fieldTemplate: 'building' },
  { value: 'land', label: 'Land / Plot', shortLabel: 'Land / Plot', category: 'residential', fieldTemplate: 'land' },

  // Commercial
  { value: 'commercial_shop', label: 'Commercial Shop / Showroom', shortLabel: 'Shop', category: 'commercial', fieldTemplate: 'building' },
];

export function getPropertyType(value) {
  return PROPERTY_TYPES.find((t) => t.value === value);
}

export function typeLabel(value) {
  return getPropertyType(value)?.label || value;
}

// A short name for tight spaces (the badge on a listing card). The full
// label is too long there and ends up on top of the favorite button.
export function typeShortLabel(value) {
  return getPropertyType(value)?.shortLabel || typeLabel(value);
}

export function fieldTemplateFor(value) {
  return getPropertyType(value)?.fieldTemplate || 'building';
}

export function typesForCategory(category) {
  return PROPERTY_TYPES.filter((t) => t.category === category);
}
