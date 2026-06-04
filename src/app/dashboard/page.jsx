import { generateMetaData } from '@/lib/seoConfig';
import DashboardClient from './DashboardClient';

export const metadata = generateMetaData(
  'Dashboard | SekarPadi',
  'Lihat ringkasan scan penyakit dan hama padi Anda di dashboard SekarPadi.',
  '/dashboard'
);

export default function DashboardPage() {
  return <DashboardClient />;
}
