import AdminGuestScansClient from './AdminGuestScansClient';

export const metadata = {
  title: 'Guest Scans - Rice Detection Admin',
  description: 'Lihat semua guest scans',
};

export default function AdminGuestScansPage() {
  return <AdminGuestScansClient />;
}
