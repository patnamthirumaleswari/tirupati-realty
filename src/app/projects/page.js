import { getProjects, getLiveUnitCountsByProject } from '@/lib/queries';
import ProjectCard from '@/app/components/ProjectCard';

// Live data again (a new project must show up straight away), so render this
// on each visit instead of freezing it at deploy time.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'New projects',
  description: 'Residential and commercial projects by builders in Tirupati, with the units available in each.',
};

export default async function ProjectsPage() {
  const [projects, unitCounts] = await Promise.all([
    getProjects(),
    getLiveUnitCountsByProject().catch(() => ({})),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 md:px-8">
      <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">New projects</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">
        Developments by local builders, each with its own page, declared RERA ID and the units
        currently available.
      </p>

      {projects.length === 0 ? (
        <p className="mt-10 text-[var(--color-ink-soft)]">
          No projects have been added yet. Builders can add theirs from their account once it has
          been set up as a builder account.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} liveUnits={unitCounts[project.id] || 0} />
          ))}
        </div>
      )}
    </main>
  );
}
