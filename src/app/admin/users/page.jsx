import { generateMetaData } from '@/lib/seoConfig';
import UsersClient from './UsersClient';

export const metadata = generateMetaData(
  'Manage Users | SekarPadi Admin',
  'Kelola semua pengguna terdaftar di sistem.',
  '/admin/users'
);

export default function AdminUsersPage() {
  return <UsersClient />;
}
