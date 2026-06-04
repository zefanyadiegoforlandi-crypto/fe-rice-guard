'use client';

import AppShell from '@/components/AppShell';
import { useAuth } from '@/hooks/useAuth';
import GuestShell from '@/components/GuestShell';

export default function Privacy() {
  const { isLoggedIn, hydrated } = useAuth();
  
  if (!hydrated) return null;
  
  const Shell = isLoggedIn ? AppShell : GuestShell;

  return (
    <Shell>
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-shield mr-2" style={{ color: 'var(--forest)' }} />
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-[var(--muted)] mt-2">Terakhir diperbarui: 5 April 2026</p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--charcoal)]">Ringkasan</h2>
            <p className="leading-relaxed text-[var(--charcoal)]">SekarPadi menyimpan informasi akun Anda dan gambar yang Anda unggah untuk memberikan layanan deteksi penyakit padi. Semua data Anda dilindungi dan dapat dihapus kapan saja.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--charcoal)]">Data yang Kami Simpan</h2>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--forest)] mb-2">1. Informasi Akun</h3>
                <ul className="list-disc list-inside text-[var(--charcoal)] space-y-1">
                  <li>Nama pengguna</li>
                  <li>Email</li>
                  <li>Password (disimpan terenkripsi)</li>
                </ul>
              </div>
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-[var(--forest)] mb-2">2. Gambar dan Hasil Deteksi</h3>
                <ul className="list-disc list-inside text-[var(--charcoal)] space-y-1">
                  <li>Gambar tanaman padi yang Anda unggah</li>
                  <li>Hasil analisis dan deteksi penyakit/hama</li>
                  <li>Rekomendasi penanganan</li>
                  <li>Timestamp upload</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--charcoal)]">Penggunaan Data</h2>
            <ul className="list-disc list-inside space-y-2 text-[var(--charcoal)]">
              <li>Menyediakan layanan deteksi penyakit padi</li>
              <li>Menyimpan riwayat scan Anda</li>
              <li>Memberikan rekomendasi perawatan tanaman</li>
              <li>Meningkatkan akurasi model deteksi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--charcoal)]">Keamanan</h2>
            <p className="leading-relaxed text-[var(--charcoal)] mb-3">Data Anda dilindungi dengan:</p>
            <ul className="list-disc list-inside space-y-2 text-[var(--charcoal)]">
              <li>Enkripsi password (tidak disimpan dalam bentuk plain text)</li>
              <li>Koneksi aman (HTTPS)</li>
              <li>Akses terbatas hanya untuk Anda</li>
            </ul>
          </section>

          <section className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[var(--forest)]">Menghapus Data Anda</h2>
            <p className="text-[var(--charcoal)] mb-3">Anda dapat menghapus gambar dan hasil scan kapan saja dengan:</p>
            <ul className="list-disc list-inside space-y-2 text-[var(--charcoal)] mb-4">
              <li>Klik tombol <strong>Hapus</strong> pada setiap hasil scan di halaman Riwayat</li>
              <li>Gambar akan dihapus dari server kami secara permanen</li>
              <li>Anda juga bisa menghapus akun secara keseluruhan di pengaturan</li>
            </ul>
            <p className="text-sm text-gray-600 bg-white p-4 rounded border border-blue-200">
              <strong>Catatan:</strong> Setelah dihapus, data tidak dapat dipulihkan. Pastikan Anda benar-benar ingin menghapusnya.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-[var(--charcoal)]">Hak Anda</h2>
            <ul className="list-disc list-inside space-y-2 text-[var(--charcoal)]">
              <li><strong>Akses:</strong> Anda bisa melihat semua gambar dan data Anda di halaman Riwayat</li>
              <li><strong>Hapus:</strong> Anda bisa menghapus gambar atau akun kapan saja</li>
              <li><strong>Download:</strong> Anda memiliki semua hak atas gambar yang Anda upload</li>
            </ul>
          </section>

          <section className="bg-green-50 border border-green-200 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[var(--forest)]">Kontak</h2>
            <p className="text-[var(--charcoal)]">Jika Anda memiliki pertanyaan tentang privasi atau data Anda:</p>
            <p className="mt-3 font-semibold text-[var(--charcoal)]">Email: support@sekarpadi.local</p>
            <p className="text-sm text-[var(--muted)] mt-4">Lokasi: Indonesia</p>
          </section>
        </div>
      </div>
    </Shell>
  );
}
