'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/utils/authUtils';
import { authAPI } from '@/lib/authAPI';
import { notifySuccess } from '@/lib/notify';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  // Initialize as null to avoid hydration mismatch (cookies not available on server)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate auth state from cookies after mount (client only)
  useEffect(() => {
    setIsLoggedIn(authUtils.isLoggedIn());
    setUser(authUtils.getUser());
    setHydrated(true);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      authUtils.setToken(data.access_token);
      authUtils.setUser(data.user);
      setIsLoggedIn(true);
      setUser(data.user);
      
      // Redirect berdasarkan role
      const redirectPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
      notifySuccess(`Selamat datang, ${data.user.name}!`);
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Gagal masuk';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const register = useCallback(async (email, name, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register({ email, name, password });
      // authUtils.setToken(data.access_token);
      // authUtils.setUser(data.user);
      // setIsLoggedIn(true);
      // setUser(data.user);
      
      // Redirect berdasarkan role (default user role untuk register)
      // const redirectPath = data.user.role === 'admin' ? '/admin' : '/dashboard';
      notifySuccess('Akun berhasil dibuat. Silakan masuk.');
      router.push('/login');
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Pendaftaran gagal';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updateName = useCallback(async (newName) => {
    try {
      const { data } = await authAPI.updateName(newName);
      setUser((prev) => {
        const updatedUser = { ...prev, name: data.name };
        authUtils.setUser(updatedUser);
        return updatedUser;
      });
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Gagal mengubah nama';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    // Ambil user role sebelum logout() membersihkan cookies
    const currentUser = authUtils.getUser();
    const redirectPath = currentUser?.role === 'admin' ? '/admin-login' : '/login';
    
    authUtils.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.push(redirectPath);
  }, [router]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, hydrated, login, register, updateName, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
