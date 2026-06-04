import { generateMetaData } from '@/lib/seoConfig';
import RegisterClient from './RegisterClient';

export const metadata = generateMetaData(
  'Daftar | SekarPadi',
  'Buat akun SekarPadi untuk mulai mendeteksi penyakit dan hama padi.',
  '/register'
);

export default function RegisterPage() {
  return <RegisterClient />;
}
