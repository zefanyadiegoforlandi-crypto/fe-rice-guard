'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { notifyError } from '@/lib/notify';

export default function AdminLoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, user, isLoggedIn, hydrated } = useAuth();

  // Redirect jika sudah login atau jika user bukan admin
  useEffect(() => {
    if (!hydrated) return;
    
    // Kalau sudah login, cek role
    if (isLoggedIn && user?.role === 'admin') {
      // Admin langsung ke /admin
      router.push('/admin');
    } else if (isLoggedIn && user?.role !== 'admin') {
      // User biasa redirect ke login
      router.push('/login');
    }
  }, [isLoggedIn, hydrated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login(email, password);
    if (!result.success) {
      const msg = result.error || 'Login gagal';
      notifyError(msg);
    }
    // AuthContext sudah handle redirect berdasarkan role otomatis
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-[56px] bg-white">
      {/* Admin Branding Panel */}
      <div className="admin-brand-panel hidden lg:flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--forest) 0%, var(--leaf) 100%)' }}>
        <div className="absolute top-12 left-12 w-72 h-72 rounded-full opacity-10 bg-white" />
        <div className="absolute bottom-16 right-10 w-56 h-56 rounded-full opacity-10 bg-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/10" />

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
            <i className="fa-solid fa-leaf text-2xl text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3 leading-snug">
            Admin Panel<br />SekarPadi
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Kelola pengguna, pantau aktivitas, dan optimalkan performa sistem dari dashboard admin terpusat.
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {[
              { icon: 'fa-users-gear', text: 'Manajemen pengguna' },
              { icon: 'fa-chart-bar', text: 'Analitik mendalam' },
              { icon: 'fa-lock', text: 'Akses terenkripsi' },
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
            <span className="text-xl font-extrabold" style={{ color: 'var(--forest)' }}>Admin Panel</span>
          </div>

          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--charcoal)] mb-1.5">
              Login Admin
            </h1>
            <p className="text-[var(--muted)] text-sm">
              Masuk dengan akun admin untuk mengelola sistem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-[var(--charcoal)]">Email Admin</label>
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
                  placeholder="admin@email.com"
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

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}
            >
              {loading ? (
                <><i className="fa-solid fa-spinner fa-spin" /><span>Memproses...</span></>
              ) : (
                <><span>Masuk sebagai Admin</span><i className="fa-solid fa-arrow-right text-sm" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--muted)] text-sm">
              Bukan admin?{' '}
              <Link href="/login" className="hover:opacity-80 font-semibold transition-colors" style={{ color: 'var(--forest)' }}>
                Login sebagai user biasa
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
