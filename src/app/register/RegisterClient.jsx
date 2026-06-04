'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { notifyError, notifyWarning } from '@/lib/notify';

export default function RegisterClient() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      const msg = 'Password tidak cocok';
      setError(msg);
      notifyWarning(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password minimal 6 karakter';
      setError(msg);
      notifyWarning(msg);
      return;
    }

    const result = await register(email, name, password);
    if (!result.success) {
      const msg = result.error || 'Pendaftaran gagal';
      setError(msg);
      notifyError(msg);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Lemah', color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Cukup', color: '#f59e0b' };
    return { level: 3, label: 'Kuat', color: '#22c55e' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-[56px] bg-white">
      {/* Green Branding Panel — hidden on mobile, visible on lg+ */}
      <div className="auth-brand-panel hidden lg:flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute bottom-20 right-8 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute top-1/3 right-16 w-40 h-40 rounded-full border border-white/10" />
          <div className="absolute bottom-1/3 left-20 w-24 h-24 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/15 shadow-lg"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <i className="fa-solid fa-leaf text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 leading-snug">
            Bergabung dengan<br />SekarPadi
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Ribuan petani sudah menggunakan SekarPadi untuk melindungi tanaman padi mereka dari penyakit dan hama.
          </p>
          <div className="grid grid-cols-3 gap-2.5 w-full">
            {[
              { val: '1K+', label: 'Pengguna' },
              { val: '50K+', label: 'Scan' },
              { val: '95%', label: 'Akurasi' },
            ].map((s, i) => (
              <div key={i} className="py-3 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.08]">
                <div className="text-xl font-extrabold text-white mb-0.5">{s.val}</div>
                <div className="text-white/50 text-[11px] font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 py-8 sm:px-8 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white lg:bg-transparent rounded-2xl lg:rounded-none shadow-lg lg:shadow-none p-6 sm:p-8 lg:p-0">
          {/* Mobile logo — only on small screens */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md" style={{ background: 'var(--forest)' }}>
              <i className="fa-solid fa-leaf text-white text-lg" />
            </div>
            <span className="text-xl font-extrabold text-[var(--forest)]">SekarPadi</span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--charcoal)] mb-1.5">
              Buat akun baru
            </h1>
            <p className="text-[var(--muted)] text-sm">
              Mulai lacak kesehatan tanaman padi Anda secara gratis.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3.5 rounded-xl mb-5 text-sm">
              <i className="fa-solid fa-circle-exclamation text-red-400 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Nama lengkap</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-user text-gray-400 text-sm" />
                </span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="auth-input" placeholder="Misal: Budi Santoso" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-gray-400 text-sm" />
                </span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="auth-input" placeholder="contoh@email.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Kata sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400 text-sm" />
                </span>
                <input type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="auth-input pr-12" placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.level ? strength.color : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Konfirmasi kata sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400 text-sm" />
                </span>
                <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="auth-input pr-12" placeholder="Ulangi kata sandi" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition">
                  <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
              {confirmPassword && (
                <div className="flex items-center gap-1.5 mt-1">
                  <i className={`fa-solid ${password === confirmPassword ? 'fa-circle-check text-green-500' : 'fa-circle-xmark text-red-400'} text-xs`} />
                  <span className={`text-xs font-semibold ${password === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {password === confirmPassword ? 'Password cocok' : 'Password tidak cocok'}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5">
              <button type="submit" disabled={loading} className="auth-btn-primary">
                {loading ? (
                  <><i className="fa-solid fa-spinner fa-spin" /><span>Memproses...</span></>
                ) : (
                  <><span>Daftar</span><i className="fa-solid fa-arrow-right text-sm" /></>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--muted)] text-sm">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[var(--forest)] hover:text-[var(--leaf)] font-bold transition-colors">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
