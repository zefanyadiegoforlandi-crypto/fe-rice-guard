export default function sitemap() {
  return [
    {
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
