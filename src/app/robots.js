
const SITE_URL = 'https://tirupati-realty.patnamthirumaleswari.workers.dev';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/login', '/signup', '/listings/new'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
