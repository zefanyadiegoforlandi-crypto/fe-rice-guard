'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/lib/authAPI';
import { notifySuccess, notifyError } from '@/lib/notify';
import AppShell from '@/components/AppShell';
import Swal from 'sweetalert2';

export default function SettingsClient() {
  const router = useRouter();
  const { isLoggedIn, hydrated, user, updateName } = useAuth();

  /* ── Name state ── */
  const [name, setName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  /* ── Password state ── */
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn) { router.push('/login'); return; }
    // Admin hanya boleh akses /admin
    if (user?.role === 'admin') { router.push('/admin'); return; }
    if (user?.name) setName(user.name);
  }, [isLoggedIn, hydrated, user, router]);

  /* ── Password strength ── */
  const getStrength = () => {
    if (!newPassword) return { level: 0, label: '', color: '' };
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    if (s <= 1) return { level: 1, label: 'Lemah', color: '#ef4444' };
    if (s <= 3) return { level: 2, label: 'Cukup', color: '#f59e0b' };
    return { level: 3, label: 'Kuat', color: '#22c55e' };
  };
  const strength = getStrength();

  /* ── Handlers ── */
  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) { notifyError('Nama tidak boleh kosong'); return; }
    setNameLoading(true);
    const result = await updateName(name.trim());
    setNameLoading(false);
    if (result.success) {
      notifySuccess('Nama berhasil diubah');
    } else {
      notifyError(result.error || 'Gagal mengubah nama');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { notifyError('Password baru minimal 6 karakter'); return; }
    if (newPassword !== confirmPassword) { notifyError('Konfirmasi password tidak cocok'); return; }

    const confirm = await Swal.fire({
      title: 'Yakin mengubah password?',
      text: 'Setelah mengubah password, perubahan tidak bisa dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, ubah password',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#48bb78',
      cancelButtonColor: '#d1d5db',
    });
    if (!confirm.isConfirmed) return;

    setPwLoading(true);
    try {
      await authAPI.changePassword(newPassword);
      notifySuccess('Password berhasil diubah');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Gagal mengubah password';
      notifyError(msg);
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Toggle eye button ── */
  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle} tabIndex={-1}
      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
      <i className={`fa-solid ${show ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
    </button>
  );

  // Guard: Jangan render sampai hydration selesai dan user terverifikasi login
  if (!hydrated || !isLoggedIn) {
    return null;
  }

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-gear mr-2 text-[var(--leaf)]" />
            Setting
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">Kelola profil dan keamanan akun Anda.</p>
        </div>

        {/* ════════════ Profile Card ════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <i className="fa-solid fa-user text-[var(--leaf)] text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--charcoal)]">Profil</h2>
              <p className="text-xs text-[var(--muted)]">Informasi dasar akun Anda</p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="p-5 sm:p-6 space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-gray-400 text-sm" />
                </span>
                <input
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="auth-input cursor-not-allowed bg-gray-50 text-gray-500"
                />
              </div>
              <p className="text-[11px] text-[var(--muted)]">Email tidak dapat diubah.</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Nama</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-gray-400 text-sm" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="Nama lengkap"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={nameLoading || name.trim() === user?.name}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[.97] transition-all"
                style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
                {nameLoading ? <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</> : <><i className="fa-solid fa-check" /> Simpan Nama</>}
              </button>
            </div>
          </form>
        </div>

        {/* ════════════ Password Card ════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <i className="fa-solid fa-lock text-amber-500 text-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--charcoal)]">Keamanan</h2>
              <p className="text-xs text-[var(--muted)]">Ubah kata sandi akun Anda</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="p-5 sm:p-6 space-y-4">
            {/* New password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Password baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400 text-sm" />
                </span>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="auth-input pr-12"
                  placeholder="Minimal 6 karakter"
                />
                <EyeBtn show={showNew} toggle={() => setShowNew(!showNew)} />
              </div>
              {/* Strength bar */}
              {newPassword && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.level ? strength.color : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Konfirmasi password baru</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400 text-sm" />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input pr-12"
                  placeholder="Ulangi password baru"
                />
                <EyeBtn show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <i className="fa-solid fa-circle-exclamation text-[10px]" /> Password tidak cocok
                </p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={pwLoading || !newPassword || newPassword !== confirmPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[.97] transition-all"
                style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
                {pwLoading ? <><i className="fa-solid fa-spinner fa-spin" /> Mengubah...</> : <><i className="fa-solid fa-shield-halved" /> Ubah Password</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
