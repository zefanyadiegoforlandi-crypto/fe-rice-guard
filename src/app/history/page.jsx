import { generateMetaData } from '@/lib/seoConfig';
import HistoryClient from './HistoryClient';

export const metadata = generateMetaData(
  'Riwayat Deteksi | SekarPadi',
  'Lihat riwayat hasil deteksi penyakit dan hama padi Anda di SekarPadi.',
  '/history'
);

export default function HistoryPage() {
  return <HistoryClient />;
}
