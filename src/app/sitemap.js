import { supabase } from '@/lib/supabaseClient';


const SITE_URL = 'https://tirupati-realty.patnamthirumaleswari.workers.dev';

// Built on each request instead of once at deploy time, so new listings and
// projects reach search engines as soon as they are live.
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Only live listings are worth indexing — anything pending/rejected
  // shouldn't show up in search engines. RLS also only returns 'live' rows
  // to this anon query regardless, so this filter is a belt-and-braces match.
  const { data: listings } = await supabase
    .from('listings')
    .select('id, updated_at')
    .eq('status', 'live');

  const listingRoutes = (listings || []).map((listing) => ({
    url: `${SITE_URL}/listings/${listing.id}`,
    lastModified: listing.updated_at,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Project pages are public too.
  const { data: projects } = await supabase
    .from('builder_projects')
    .select('id, created_at');

  const projectRoutes = (projects || []).map((project) => ({
    url: `${SITE_URL}/projects/${project.id}`,
    lastModified: project.created_at,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...listingRoutes, ...projectRoutes];
}
