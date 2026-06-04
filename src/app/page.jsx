import LandingContent from '@/components/LandingContent';
import { generateMetaData } from '@/lib/seoConfig';

export const metadata = generateMetaData(
  'SekarPadi - Deteksi AI untuk Tanaman Padi',
  'Unggah foto tanaman padi, dapatkan analisis instan serta rekomendasi perawatan dalam bahasa Indonesia.',
  '/'
);

export default function LandingPage() {
  return <LandingContent />;
}
