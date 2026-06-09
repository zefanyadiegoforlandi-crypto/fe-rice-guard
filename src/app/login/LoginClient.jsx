'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { notifyError } from '@/lib/notify';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, isLoggedIn, hydrated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    // Kalau user sudah login
    if (isLoggedIn) {
      // Admin redirect ke admin-login atau admin
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        // User biasa redirect ke dashboard
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, hydrated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);
    if (!result.success) {
      const msg = result.error || 'Login gagal';
      notifyError(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-[56px] bg-white">
      {/* Green Branding Panel — hidden on mobile, visible on lg+ */}
      <div className="auth-brand-panel hidden lg:flex items-center justify-center">
        <div className="absolute top-12 left-12 w-72 h-72 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-16 right-10 w-56 h-56 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
            <i className="fa-solid fa-leaf text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 leading-snug">
            Selamat Datang<br />di SekarPadi
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Platform cerdas untuk mendeteksi penyakit dan hama pada tanaman padi secara real-time menggunakan teknologi AI.
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {[
              { icon: 'fa-bolt', text: 'Deteksi instan dengan AI' },
              { icon: 'fa-shield-halved', text: 'Data aman & terenkripsi' },
              // { icon: 'fa-chart-line', text: 'Dashboard analitik lengkap' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${item.icon} text-white text-xs`} />
                </div>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
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
              Masuk ke akun Anda
            </h1>
            <p className="text-[var(--muted)] text-sm">
              Pantau kesehatan padi Anda dengan dashboard terpadu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-gray-400 text-sm" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="contoh@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Kata sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-gray-400 text-sm" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input pr-12"
                  placeholder="Masukkan kata sandi"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-btn-primary">
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin" /><span>Memproses...</span></>
              ) : (
                <><span>Masuk</span><i className="fa-solid fa-arrow-right text-sm" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--muted)] text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[var(--forest)] hover:text-[var(--leaf)] font-semibold transition-colors">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
