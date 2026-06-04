'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminShell from '@/components/AdminShell';
import { notifyError, notifySuccess, notifyWarning } from '@/lib/notify';
import { adminAPI } from '@/lib/adminAPI';
import axios from 'axios';

export default function AdminClient() {
  const router = useRouter();
  const { user, isLoggedIn, hydrated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push('/admin-login');
    } else if (hydrated && isLoggedIn && user?.role !== 'admin') {
      notifyWarning('Hanya admin yang bisa akses halaman ini');
      router.push('/dashboard');
    }
  }, [hydrated, isLoggedIn, user, router]);

  // Fetch stats
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      fetchStats();
    }
  }, [isLoggedIn, user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      notifyError('Gagal mengambil data statistik');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell>
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-leaf mr-2" style={{ color: 'var(--forest)' }} />
            Dashboard Admin
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">Pantau semua aktivitas dan kelola users</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[var(--forest)] animate-bounce"></div>
              <span className="text-[var(--muted)]">Memuat data...</span>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-[var(--charcoal)] mt-2">{stats.total_users}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <i className="fa-solid fa-users text-lg text-blue-600"></i>
                </div>
              </div>
            </div>

            {/* Total Scans */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] font-medium">Total Scan</p>
                  <p className="text-3xl font-bold text-[var(--charcoal)] mt-2">{stats.total_scans}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <i className="fa-solid fa-camera text-lg text-green-600"></i>
                </div>
              </div>
            </div>

            {/* Registered Scans */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] font-medium">Scan Users</p>
                  <p className="text-3xl font-bold text-[var(--charcoal)] mt-2">{stats.total_registered_scans}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                  <i className="fa-solid fa-rectangle-list text-lg text-purple-600"></i>
                </div>
              </div>
            </div>

            {/* Guest Scans */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] font-medium">Guest Scan</p>
                  <p className="text-3xl font-bold text-[var(--charcoal)] mt-2">{stats.total_guest_scans}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <i className="fa-solid fa-globe text-lg text-amber-600"></i>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Quick Links */}
        <div className="space-y-4">
          {/* Users Section */}
          <div className="rounded-2xl border border-gray-200 p-6" style={{ background: 'linear-gradient(135deg, rgba(76, 181, 114, 0.05) 0%, rgba(76, 181, 114, 0.02) 100%)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[var(--charcoal)] mb-2">Kelola Users</p>
                <p className="text-sm text-[var(--muted)]">Lihat daftar semua users, edit, atau hapus user yang tidak aktif</p>
              </div>
              <a
                href="/admin/users"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors hover:opacity-90"
                style={{ background: 'var(--leaf)' }}
              >
                <i className="fa-solid fa-arrow-right"></i>
                Ke Users
              </a>
            </div>
          </div>

          {/* Guest Scans Section */}
          <div className="rounded-2xl border border-gray-200 p-6" style={{ background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(251, 191, 36, 0.02) 100%)' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-[var(--charcoal)] mb-2">Lihat Guest Scans</p>
                <p className="text-sm text-[var(--muted)]">Tinjau semua scan dari pengguna tamu/guest yang tersimpan di database</p>
              </div>
              <a
                href="/admin/guest-scans"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors hover:opacity-90"
                style={{ background: 'var(--forest)' }}
              >
                <i className="fa-solid fa-arrow-right"></i>
                Ke Guest Scans
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
