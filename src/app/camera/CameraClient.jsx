'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { detectionAPI } from '@/lib/detectionAPI';

export default function CameraClient() {
  const router = useRouter();
  const { isLoggedIn, hydrated } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!hydrated) return;
    openCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [hydrated]);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(`Kamera: ${err.message}`);
    }
  };

  const captureAndUpload = async () => {
    try {
      setError('');
      setLoading(true);

      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);

      // Convert canvas to File langsung (no toDataURL middle layer)
      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Set preview
          const reader = new FileReader();
          reader.onload = (e) => setPreview(e.target.result);
          reader.readAsDataURL(blob);

          // Upload pakai sama method seperti gallery
          const { data } = await detectionAPI.scan(file);
          setResult(data);
        } catch (err) {
          setError(`Upload: ${err.message}`);
          setLoading(false);
        }
      }, 'image/jpeg', 0.9);
    } catch (err) {
      setError(`Capture: ${err.message}`);
      setLoading(false);
    }
  };

  const handleRetake = async () => {
    setPreview(null);
    setResult(null);
    setError('');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    await openCamera();
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-[var(--mint)] pt-16 md:pt-20 pb-4 md:pb-8">
      <div className="container mx-auto px-3 md:px-4 max-w-2xl">
        <Link
          href={isLoggedIn ? "/dashboard" : "/scan"}
          className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 mb-4 md:mb-5 rounded-xl
                     bg-white/80 backdrop-blur border border-white/60 shadow-sm
                     text-sm md:text-base font-medium text-[var(--forest)]
                     hover:bg-white hover:shadow-md hover:border-[var(--mint-soft)]
                     active:scale-[0.97] transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>

        <div className="card-soft p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#2b2b2b] mb-4 md:mb-6">Scan Kamera</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded mb-3 md:mb-4 text-sm md:text-base">
              {error}
            </div>
          )}

          {!result ? (
            <>
              {!preview ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={captureAndUpload}
                    disabled={loading}
                    className="w-full bg-[#c07a00] text-white py-3 md:py-4 rounded-full font-semibold text-sm md:text-base hover:bg-[#a86600] disabled:opacity-60 active:scale-95 transition"
                  >
                    {loading ? 'Memproses...' : 'Ambil Foto'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-auto" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <button
                      onClick={handleRetake}
                      className="bg-white border border-[#f1e5d3] text-[#2b2b2b] py-2.5 md:py-3 rounded-full font-semibold text-xs md:text-sm hover:bg-[var(--mint-soft)] active:scale-95 transition"
                    >
                      Ulangi
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {(result.annotated_image_path || preview) && (
                  <div className="w-full bg-gray-50 flex flex-col items-center justify-center p-4">
                    <img
                      src={result.annotated_image_path
                        ? `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '')}${result.annotated_image_path}`
                        : preview
                      }
                      alt="Hasil Deteksi"
                      className="max-h-72 rounded-xl object-contain"
                    />
                    {result.annotated_image_path && (
                      <p className="text-xs text-[var(--muted)] mt-2">
                        <i className="fa-solid fa-vector-square mr-1" />
                        Gambar dengan bounding box deteksi
                      </p>
                    )}
                  </div>
                )}
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                      <i className="fa-solid fa-virus text-[var(--leaf)]" />
                      <div>
                        <p className="text-[11px] text-[var(--muted)] leading-none mb-0.5">Deteksi</p>
                        <p className="text-lg font-extrabold text-[var(--forest)]">{result.disease_count ?? result.diseases?.length ?? 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                      <i className="fa-solid fa-clock text-gray-400" />
                      <div>
                        <p className="text-[11px] text-[var(--muted)] leading-none mb-0.5">Waktu</p>
                        <p className="text-sm font-semibold text-[var(--charcoal)]">{result.created_at ? new Date(result.created_at).toLocaleString('id-ID') : '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-[var(--forest)]"><i className="fa-solid fa-clipboard-check mr-1.5" />Hasil Deteksi</h3>
                    {result.diseases?.map((d, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-100 p-4 space-y-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-[var(--charcoal)]">{d.disease_name}</h4>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">{d.category}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--muted)]">Keyakinan:</span>
                            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                              <div className="h-full rounded-full bg-[var(--leaf)] transition-all" style={{ width: `${(d.confidence * 100).toFixed(0)}%` }} />
                            </div>
                            <span className="text-sm font-bold text-[var(--forest)]">{(d.confidence * 100).toFixed(1)}%</span>
                          </div>
                          {d.severity && d.severity !== 'None' && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{d.severity}</span>
                          )}
                        </div>
                        {d.recommendations && (
                          <div className="pt-2 border-t border-gray-50 space-y-1.5">
                            <p className="text-xs font-semibold text-[var(--forest)]"><i className="fa-solid fa-lightbulb mr-1 text-amber-500" />Cara Penanganan</p>
                            {d.recommendations.split(' | ').map((rec, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                <span className="text-[var(--leaf)] mt-0.5 flex-shrink-0">&#10003;</span>
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleRetake}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[var(--charcoal)] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[.97] transition">
                  <i className="fa-solid fa-rotate-right" /> Ulangi
                </button>
                <button onClick={() => window.location.href = '/'}
                  className="inline-flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[.97] transition"
                  style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
                  <i className="fa-solid fa-home" /> Beranda
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
