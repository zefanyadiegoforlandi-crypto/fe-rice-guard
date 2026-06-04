import '@/styles/globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'SekarPadi - Deteksi Penyakit & Hama Padi Berbasis AI',
  description: 'Analisis cepat tanaman padi, deteksi penyakit dan hama, dengan rekomendasi tindakan dalam bahasa Indonesia.',
  keywords: 'deteksi penyakit padi, hama padi, AI pertanian, monitoring tanaman, rekomendasi perawatan',
  authors: [{ name: 'SekarPadi Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com',
    siteName: 'SekarPadi',
    title: 'SekarPadi - Deteksi Penyakit & Hama Padi Berbasis AI',
    description: 'Analisis cepat tanaman padi, deteksi penyakit dan hama, dengan rekomendasi tindakan.',
    images: [
      {
        url: process.env.NEXT_PUBLIC_OG_IMAGE || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SekarPadi - Deteksi Padi',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SekarPadi - Deteksi AI untuk Padi',
    description: 'Analisis cepat kesehatan padi dengan AI.',
    images: [process.env.NEXT_PUBLIC_TWITTER_IMAGE || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'}/twitter-image.png`],
  },
  canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#16a34a" />
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://sekarpadi.com'} />
        <link rel="icon" href="/favicon.ico" />
        {/* manifest and apple-touch-icon removed (PWA disabled) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': 'SekarPadi',
            'description': 'AI-powered rice disease and pest detection system',
            'applicationCategory': 'AgricultureApplication',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          })
        }} />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
