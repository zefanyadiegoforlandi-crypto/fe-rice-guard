import { generateMetaData } from '@/lib/seoConfig';
import LoginClient from './LoginClient';

export const metadata = generateMetaData(
  'Masuk | SekarPadi',
  'Masuk ke SekarPadi untuk memantau deteksi penyakit dan hama padi.',
  '/login'
);

export default function LoginPage() {
  return <LoginClient />;
}
