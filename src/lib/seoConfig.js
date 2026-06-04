// SEO Configuration and utilities
export const siteConfig = {
  name: 'SekarPadi',
  title: 'SekarPadi - Deteksi Penyakit & Hama Padi Berbasis AI',
  description: 'Deteksi penyakit dan hama padi secara cepat dengan AI. Hasil instan, rekomendasi praktis, dan riwayat scan tersimpan.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com',
  ogImage: process.env.NEXT_PUBLIC_OG_IMAGE || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/og-image.png`,
  twitterImage: process.env.NEXT_PUBLIC_TWITTER_IMAGE || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/twitter-image.png`,
  twitterHandle: '@sekarpadi',
  keywords: [
    'rice disease detection',
    'rice pest detection',
    'AI plant analysis',
    'crop monitoring',
    'rice farming',
    'agricultural technology',
    'plant health',
    'pest management',
  ],
};

export const generateMetaData = (title, description, path = '') => ({
  title,
  description,
  canonical: `${siteConfig.url}${path}`,
  openGraph: {
    title,
    description,
    url: `${siteConfig.url}${path}`,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [siteConfig.twitterImage],
  },
});

export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SekarPadi',
    url: siteConfig.url,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/logo.png`,
    sameAs: [
      'https://twitter.com/sekarpadi',
      'https://facebook.com/sekarpadi',
    ],
  },
  
  application: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SekarPadi',
    description: siteConfig.description,
    applicationCategory: 'AgricultureApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    image: siteConfig.ogImage,
  },
  
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Apa itu SekarPadi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SekarPadi adalah sistem berbasis AI untuk mendeteksi penyakit dan hama pada tanaman padi. Cukup unggah foto dan dapatkan analisis instan beserta rekomendasi penanganan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Seberapa cepat deteksi AI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Deteksi diproses secara cepat untuk membantu identifikasi penyakit umum pada padi. Hasil menampilkan skor kepercayaan agar mudah dievaluasi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Apakah SekarPadi gratis digunakan?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ya, SekarPadi sepenuhnya gratis. Buat akun dan mulai mendeteksi penyakit tanaman padi sekarang juga.',
        },
      },
    ],
  },
};
