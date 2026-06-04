'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/scan', label: 'Scan', icon: 'fa-camera' },
];

export default function GuestShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--mint)] pt-[52px] sm:pt-[56px]">
      {/* Mobile hamburger — floating top */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-[62px] sm:top-[66px] left-4 z-30 h-10 w-10 rounded-xl bg-green-600/30 border border-white/30 text-white hover:bg-green-600/50 hover:border-white/50 flex items-center justify-center text-sm active:scale-95 transition-all"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always fixed, below navbar */}
      <aside
        className={`
          fixed top-[68px] sm:top-[72px] bottom-4 left-4 z-50 w-[260px] bg-white rounded-2xl flex flex-col
          transform transition-all duration-300 ease-in-out
          lg:z-20 border border-gray-100 shadow-sm overflow-y-auto
          lg:block lg:translate-x-0 lg:shadow-sm
          ${sidebarOpen ? 'block translate-x-0 shadow-2xl' : 'hidden -translate-x-[300px]'}
        `}
      >
        {/* Guest badge */}
        <div className="px-5 pt-5 pb-3">
          <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-center">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              <i className="fa-solid fa-user-secret mr-1"></i>
              Mode Guest
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[var(--mint)] to-white">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg font-bold text-[var(--forest)]">
              <i className="fa-solid fa-user-secret"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--forest)] truncate">Guest</p>
              <p className="text-[11px] text-[var(--muted)]">Pengguna Tamu</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Menu</p>
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--forest)] text-white shadow-sm'
                    : 'text-[var(--muted)] hover:bg-gray-50 hover:text-[var(--forest)]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  isActive ? 'bg-white/20' : 'bg-gray-50'
                }`}>
                  <i className={`fa-solid ${icon}`}></i>
                </div>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Info badge */}
        <div className="px-5 pb-5 mt-auto">
          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-center">
            <p className="text-xs text-blue-600 font-medium">
              <i className="fa-solid fa-info-circle mr-1"></i>
              Mode akses terbatas
            </p>
          </div>
        </div>
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="min-h-screen lg:ml-[276px] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
