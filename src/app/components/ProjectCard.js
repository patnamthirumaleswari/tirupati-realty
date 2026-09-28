import Link from 'next/link';
import { formatPossession } from '@/lib/format';

export default function ProjectCard({ project, liveUnits = 0 }) {
  const possession = formatPossession(project.possession_date);
  const builderName = project.builder?.agency_name || project.builder?.full_name || 'Builder';

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block rounded-2xl border border-[var(--color-sand)] bg-[var(--color-surface)] p-5 transition-all hover:-translate-y-1.5 hover:border-[var(--color-teal)] hover:shadow-[0_20px_40px_-18px_rgba(36,28,21,0.2)]"
    >
      <div className="text-[13px] font-semibold text-[var(--color-ink-softer)]">
        {builderName}
        {project.builder?.is_verified && (
          <span className="ml-1.5 text-[var(--color-green)]">✓ Verified</span>
        )}
      </div>
      <div className="font-display mt-1 text-xl font-semibold text-[var(--color-ink)]">
        {project.project_name}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--color-ink-soft)]">
        <span>
          {liveUnits} {liveUnits === 1 ? 'unit' : 'units'} live
        </span>
        {project.total_units ? <span>{project.total_units} in total</span> : null}
        {possession ? <span>Possession {possession}</span> : null}
      </div>
    </Link>
  );
}
