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
  { value: 'apartment', label: 'Apartment', category: 'residential', fieldTemplate: 'building' },
  { value: 'villa', label: 'Independent House/Villa', category: 'residential', fieldTemplate: 'building' },
  { value: 'builder_floor', label: 'Independent/Builder Floor', category: 'residential', fieldTemplate: 'building' },
  { value: 'studio', label: 'Studio Apartment / 1 RK', category: 'residential', fieldTemplate: 'building' },
  { value: 'land', label: 'Land / Plot', category: 'residential', fieldTemplate: 'land' },

  // Commercial
  { value: 'commercial_shop', label: 'Commercial Shop / Showroom', category: 'commercial', fieldTemplate: 'building' },
];

export function getPropertyType(value) {
  return PROPERTY_TYPES.find((t) => t.value === value);
}

export function typeLabel(value) {
  return getPropertyType(value)?.label || value;
}

export function fieldTemplateFor(value) {
  return getPropertyType(value)?.fieldTemplate || 'building';
}

export function typesForCategory(category) {
  return PROPERTY_TYPES.filter((t) => t.category === category);
}
