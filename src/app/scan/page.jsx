import { generateMetaData } from '@/lib/seoConfig';
import ScanClient from './ScanClient';

export const metadata = generateMetaData(
  'Scan | SekarPadi',
  'Upload foto tanaman padi dan dapatkan hasil deteksi AI instan di SekarPadi.',
  '/scan'
);

export default function ScanPage() {
  return <ScanClient />;
}
