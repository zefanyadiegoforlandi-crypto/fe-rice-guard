'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CameraPage() {
  const router = useRouter();

  useEffect(() => {
    // Semua input method (galeri, drag-drop, kamera) ada di /scan
    // Redirect ke sana untuk alur yang sama menuju Model AI
    router.push('/scan');
  }, [router]);

  return null;
}
