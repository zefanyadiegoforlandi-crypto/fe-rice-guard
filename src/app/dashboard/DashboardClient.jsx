'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { detectionAPI } from '@/lib/detectionAPI';
import { formatToWIBShort } from '@/lib/timeUtils';
import AppShell from '@/components/AppShell';

/* ── Stat card ─────────────────────────────────────────── */
const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor, trend }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center text-lg ${iconColor}`}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
          trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-2xl sm:text-3xl font-extrabold text-[var(--forest)] leading-none">{value}</p>
    <p className="text-sm font-semibold text-[var(--charcoal)] mt-1">{title}</p>
    {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
  </div>
);

/* ── Loading skeleton ──────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-gray-100 mb-3" />
    <div className="h-8 w-20 bg-gray-100 rounded-lg mb-2" />
    <div className="h-4 w-32 bg-gray-50 rounded" />
  </div>
);

export default function DashboardClient() {
  const router = useRouter();
  const { isLoggedIn, hydrated, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    // Admin hanya boleh akses /admin, bukan /dashboard
    if (user?.role === 'admin') {
      router.push('/admin');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data } = await detectionAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isLoggedIn, hydrated, router]);

  // Guard: Jangan render sampai hydration selesai dan user terverifikasi login
  if (!hydrated || !isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-6xl">
          <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const totalScans = stats?.total_scans ?? 0;
  const diseaseCount = stats?.diseases_found ?? 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--forest)] tracking-tight">
              {greeting()}, {user?.name?.split(' ')[0] || 'Pengguna'} 👋
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Berikut ringkasan kondisi tanaman padi Anda hari ini.
            </p>
          </div>
        </div>

        {/* ── Stat cards (2 kolom: Total Scan + Penyakit) ──– */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Scan"
            value={totalScans}
            subtitle="Semua pemindaian"
            icon="fa-camera"
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatCard
            title="Penyakit"
            value={diseaseCount}
            subtitle="Perlu penanganan"
            icon="fa-virus"
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />
        </div>

        {/* ── Grid: Tips + Recent (pojok) ────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Tips */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-[var(--forest)] flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center text-sm text-yellow-600">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              Tips Pemindaian
            </h2>
            <div className="space-y-2.5">
              {[
                { emoji: '☀️', title: 'Cahaya cukup', desc: 'Foto saat siang hari untuk warna akurat.', bg: 'bg-amber-50' },
                { emoji: '🍃', title: 'Fokus ke gejala', desc: 'Arahkan kamera ke area yang terinfeksi.', bg: 'bg-emerald-50' },
                { emoji: '📏', title: 'Jarak ± 15 cm', desc: 'Agar detail daun terlihat jelas.', bg: 'bg-blue-50' },
              ].map((tip) => (
                <div key={tip.title} className={`flex items-center gap-3 p-3 rounded-xl ${tip.bg}`}>
                  <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-[var(--charcoal)]">{tip.title}</p>
                    <p className="text-[11px] text-[var(--muted)] leading-snug">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Detections (pojok) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="font-bold text-[var(--forest)] flex items-center gap-1 text-sm">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-xs text-blue-500">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                Deteksi Terakhir
              </h2>
              <Link href="/history" className="text-[10px] font-semibold text-[var(--leaf)] hover:underline">
                Lihat semua <i className="fa-solid fa-arrow-right ml-0.5"></i>
              </Link>
            </div>

            {stats?.recent_detections?.length > 0 ? (
              <div className="px-4 pb-4 space-y-2 max-h-96 overflow-y-auto">
                {stats.recent_detections.slice(0, 3).map((det) => {
                  const hasDisease = det.diseases?.some(d => d.category?.toLowerCase() === 'disease');
                  const hasPest = det.diseases?.some(d => d.category?.toLowerCase() === 'pest');
                  return (
                    <div key={det.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-[var(--mint)]/40 transition group text-xs">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                        hasDisease ? 'bg-red-50' : hasPest ? 'bg-amber-50' : 'bg-emerald-50'
                      }`}>
                        {hasDisease ? '🦠' : hasPest ? '🐛' : '✅'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-[var(--charcoal)] truncate">
                          {det.image_name || `Gambar #${det.id}`}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {det.diseases?.slice(0, 2).map((d, i) => (
                            <span key={i} className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                              d.category?.toLowerCase() === 'disease'
                                ? 'bg-red-100 text-red-600'
                                : d.category?.toLowerCase() === 'pest'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {d.disease_name}
                            </span>
                          ))}
                        </div>
                        <p className="text-[9px] text-[var(--muted)] mt-0.5">
                          {formatToWIBShort(det.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center px-4 py-6">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl mx-auto mb-1">📋</div>
                <p className="text-[11px] font-semibold text-[var(--charcoal)]">Belum ada deteksi</p>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Mulai scan untuk melihatnya di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
