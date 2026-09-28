// The RERA disclaimer shown wherever a project's RERA ID is displayed.
// One component so the wording stays identical everywhere. The requirements
// document asks for exactly this: show the ID as declared by the builder,
// and tell buyers to verify it themselves, because Tirupati Realty is not
// certifying it.

const AP_RERA_URL = 'https://rera.ap.gov.in';

export default function ReraNote({ className = '' }) {
  return (
    <p className={`text-xs leading-relaxed text-[var(--color-ink-softer)] ${className}`}>
      The RERA ID is shown exactly as declared by the builder. Tirupati Realty does not verify or
      certify RERA registration, so please check it yourself on the{' '}
      <a
        href={AP_RERA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-[var(--color-teal)]"
      >
        Andhra Pradesh RERA portal
      </a>{' '}
      (Registered, then Projects) before making any decision.
    </p>
  );
}
