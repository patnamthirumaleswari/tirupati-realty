// A small line icon for each kind of property. Used for the "no photo yet"
// placeholder on listing cards and for the "browse by type" tiles on the
// homepage, so a listing without a photo still looks intentional.
//
// No hooks or browser-only code in here, so it works in server and client
// components alike.

const ICON_FOR_TYPE = {
  apartment: 'building',
  builder_floor: 'building',
  studio: 'building',
  villa: 'house',
  land: 'plot',
  commercial_shop: 'shop',
};

const SHAPES = {
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1.5" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
      <path d="M10.5 21v-3h3v3" />
    </>
  ),
  house: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v10h13V10" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  plot: (
    <>
      <circle cx="17" cy="7" r="2" />
      <path d="M3 19 9 10l4 6 3-4 5 7z" />
    </>
  ),
  shop: (
    <>
      <path d="M4 9 5.5 4h13L20 9z" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
};

export default function PropertyTypeIcon({ type, size = 24, strokeWidth = 1.6, className = '' }) {
  const kind = ICON_FOR_TYPE[type] || 'building';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {SHAPES[kind]}
    </svg>
  );
}
