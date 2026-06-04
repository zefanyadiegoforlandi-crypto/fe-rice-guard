'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: 'fa-gauge-high' },
  { href: '/admin/users', label: 'Users', icon: 'fa-users' },
  { href: '/admin/guest-scans', label: 'History', icon: 'fa-clock-rotate-left' },

];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--mint)] pt-[52px] sm:pt-[56px]">
      {/* Mobile hamburger — floating top */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-[62px] sm:top-[66px] left-4 z-30 h-10 w-10 rounded-xl bg-transparent border border-white/30 text-white hover:bg-white/10 hover:border-white/50 flex items-center justify-center text-sm active:scale-95 transition-all"
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

      {/* Sidebar */}
      <aside
        className={`
          fixed top-[68px] sm:top-[72px] bottom-4 left-4 z-50 w-[260px] bg-white rounded-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:z-20 border border-gray-100 shadow-sm overflow-y-auto
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* User card */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-[var(--mint)] to-white">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg font-bold text-[var(--forest)]">
              <i className="fa-solid fa-shield"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--forest)] truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-[var(--muted)]">Administrator</p>
            </div>
          </div>
        </div>


        {/* Nav items */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">Menu</p>
          {ADMIN_NAV_ITEMS.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href === '/admin' && pathname.startsWith('/admin') && pathname === '/admin');
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

        {/* Logout button */}
        <div className="px-4 py-3 border-t border-gray-100">
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen lg:ml-[276px] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
