'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { notifySuccess, notifyError, confirmAction } from '@/lib/notify';

const APPSHELL_ROUTES = ['/dashboard', '/scan', '/history', '/settings'];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isLanding = pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll for transparent navbar on landing
  useEffect(() => {
    if (!isLanding) { setScrolled(true); return; }
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // PWA install prompt handling (beforeinstallprompt + appinstalled)
  useEffect(() => {
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
      notifySuccess('Aplikasi berhasil diinstall');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        isLanding && !scrolled
          ? 'bg-transparent border-b border-transparent'
          : 'bg-white/85 backdrop-blur border-b border-white/60 shadow-sm'
      }`}>
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3">
          {/* Logo */}
          <Link href="/" className={`text-base sm:text-lg md:text-xl font-bold flex items-center gap-1 sm:gap-2 flex-shrink-0 transition-colors ${
            isLanding && !scrolled ? 'text-white' : 'text-[var(--forest)]'
          }`}>
            <i className={`fa-solid fa-leaf text-lg sm:text-xl ${isLanding && !scrolled ? 'text-[#4CB572]' : 'text-[var(--leaf)]'}`}></i>
            <span className="hidden sm:inline">SekarPadi</span>
          </Link>

          {/* Scrollable nav links */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap ${
              isLanding && !scrolled ? 'text-white/80' : ''
            }`}>
              <Link href="/" className={`px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${
                isLanding && !scrolled ? 'hover:bg-white/10 text-white' : 'hover:bg-[var(--mint-soft)] text-[var(--forest)]'
              }`}>Beranda</Link>
              {isLoggedIn && (
                <Link href="/dashboard" className={`px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${
                  isLanding && !scrolled ? 'hover:bg-white/10 text-white/80' : 'hover:bg-[var(--mint-soft)]'
                }`}>Dashboard</Link>
              )}
              <Link href="/#tentang" className={`px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${
                isLanding && !scrolled ? 'hover:bg-white/10 text-white/80' : 'hover:bg-[var(--mint-soft)]'
              }`}>Tentang Kami</Link>
              <Link href="/#faq" className={`px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors ${
                isLanding && !scrolled ? 'hover:bg-white/10 text-white/80' : 'hover:bg-[var(--mint-soft)]'
              }`}>FAQ</Link>
              
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {!isPwaInstalled && deferredPrompt && (
              <button
                onClick={async () => {
                  try {
                    deferredPrompt.prompt();
                    const choice = await deferredPrompt.userChoice;
                    if (choice.outcome === 'accepted') {
                      notifySuccess('Terima kasih! Tambahkan ke layar utama.');
                    } else {
                      notifyError('Instalasi dibatalkan.');
                    }
                    setDeferredPrompt(null);
                  } catch (err) {
                    notifyError('Gagal menampilkan prompt instalasi');
                  }
                }}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm bg-white/90"
              >
                <i className="fa-solid fa-plus mr-1"></i>
                Pasang
              </button>
            )}
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 rounded-full bg-[var(--leaf)] text-white hover:bg-[#3a9b5d] text-xs sm:text-sm transition-colors max-w-[130px] sm:max-w-none"
                >
                  <i className="fa-solid fa-user text-[10px] sm:text-xs flex-shrink-0"></i>
                  <span className="truncate">{user?.name}</span>
                  <i className={`fa-solid fa-chevron-down text-[8px] sm:text-[10px] transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--charcoal)] hover:bg-[var(--mint-soft)] transition-colors"
                    >
                      <i className="fa-solid fa-gear text-[var(--muted)] w-4 text-center"></i>
                      Setting
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={async () => {
                        const ok = await confirmAction({
                          title: 'Keluar dari akun?',
                          text: 'Anda akan keluar dari sesi saat ini.',
                          confirmText: 'Ya, keluar',
                          icon: 'question',
                          confirmColor: '#e53e3e',
                        });
                        if (ok) {
                          setDropdownOpen(false);
                          logout();
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fa-solid fa-right-from-bracket w-4 text-center"></i>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full border text-xs sm:text-sm whitespace-nowrap transition-colors ${
                  isLanding && !scrolled
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-[var(--leaf)] text-[var(--forest)] hover:bg-[var(--mint-soft)]'
                }`}>
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-[var(--leaf)] text-white hover:bg-[#3a9b5d] text-xs sm:text-sm whitespace-nowrap"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
