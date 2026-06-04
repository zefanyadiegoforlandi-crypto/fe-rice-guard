"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { detectionAPI } from '@/lib/detectionAPI';
import { notifyError, notifyWarning, notifySuccess } from '@/lib/notify';
import { formatToWIB } from '@/lib/timeUtils';
import AppShell from '@/components/AppShell';
import GuestShell from '@/components/GuestShell';

export default function ScanClient() {
  const { isLoggedIn, user, hydrated } = useAuth();
  const router = useRouter();
  
  // Redirect admin ke /admin
  useEffect(() => {
    if (!hydrated) return;
    if (isLoggedIn && user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isLoggedIn, hydrated, user, router]);

  const [dragActive, setDragActive] = useState(false);
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const allowedFormats = ['image/jpeg', 'image/png'];
      const fileExtension = droppedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedFormats.includes(droppedFile.type) && !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        notifyError('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        setError('Format file hanya boleh JPG, JPEG, atau PNG');
        return;
      }
      
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(droppedFile);
      setError('');
      setResult(null);
    }
  };

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const captureInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      streamRef.current = stream;
      setUseCamera(true);
      
      // Tunggu sampai video element siap
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => {
            notifyError(`Video play error: ${err.message}`);
          });
        }
      }, 100);
    } catch (err) {
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'Izin kamera ditolak. Aktifkan di pengaturan browser.' 
        : err.name === 'NotFoundError'
        ? 'Kamera tidak ditemukan di device ini.'
        : `Kamera error: ${err.message}`;
      notifyError(errorMsg);
      setError(errorMsg);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedFormats = ['image/jpeg', 'image/png'];
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!allowedFormats.includes(selectedFile.type) && !['jpg', 'jpeg', 'png'].includes(fileExtension)) {
        notifyError('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
        setError('Format file hanya boleh JPG, JPEG, atau PNG');
        return;
      }
      
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setUseCamera(false);
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const capturedFile = dataURLtoFile(dataUrl, `scan-${Date.now()}.png`);
    setPreview(dataUrl);
    setFile(capturedFile);
    setResult(null);
    stopCamera();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      notifyWarning('Pilih gambar terlebih dahulu');
      return;
    }
    if (!isOnline) {
      const msg = 'Anda sedang offline — sambungkan jaringan untuk melakukan deteksi.';
      setError(msg);
      notifyError(msg);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await detectionAPI.scan(file);
      setResult(data);
      
      notifySuccess('Deteksi selesai!');
    } catch (err) {
      const msg = err.message || 'Terjadi kesalahan saat deteksi';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = (cat) => {
    const c = cat?.toLowerCase();
    if (c === 'disease') return 'bg-red-50 text-red-600 border border-red-100';
    if (c === 'pest') return 'bg-amber-50 text-amber-600 border border-amber-100';
    if (c === 'healthy') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  };

  const severityColor = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'high' || s === 'severe') return 'text-red-600 bg-red-50';
    if (s === 'medium' || s === 'moderate') return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  const Shell = isLoggedIn ? AppShell : GuestShell;

  return (
    <Shell>
      <div className="max-w-3xl space-y-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-seedling mr-2 text-[var(--leaf)]" />
            Scan Tanaman Padi
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">Unggah atau ambil foto tanaman untuk analisis AI. Format: JPG/PNG, maks 10 MB.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <i className="fa-solid fa-circle-exclamation text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {!result ? (
          <form onSubmit={handleUpload} className="space-y-8">
            <div
              className={`bg-white rounded-2xl border-2 border-dashed transition-colors p-5 sm:p-8 text-center space-y-4 ${dragActive ? 'border-[var(--leaf)] bg-green-50' : 'border-gray-200 hover:border-[var(--leaf)]'}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{ cursor: 'pointer' }}
            >
              {useCamera ? (
                <div className="space-y-5 py-4">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    onLoadedMetadata={() => videoRef.current?.play?.()}
                    className="w-full rounded-xl bg-black object-cover max-h-[60vh]" 
                  />
                  <div className="flex gap-3">
                    <button type="button" onClick={handleCapture}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--leaf)] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3a9b5d] active:scale-[.97] transition">
                      <i className="fa-solid fa-camera" /> Ambil Foto
                    </button>
                    <button type="button" onClick={stopCamera}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[var(--charcoal)] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[.97] transition">
                      <i className="fa-solid fa-xmark" /> Batal
                    </button>
                  </div>
                </div>
              ) : preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="Preview" className="w-full max-h-96 mx-auto rounded-xl object-contain" />
                  <p className="text-xs text-[var(--muted)] truncate"><i className="fa-solid fa-image mr-1" />{file?.name}</p>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(76,181,114,0.1)' }}>
                    <i className="fa-solid fa-cloud-arrow-up text-2xl text-[var(--leaf)]" />
                  </div>
                  <p className="text-base font-semibold text-[var(--charcoal)] mb-1">Ambil atau unggah foto</p>
                  <p className="text-sm text-[var(--muted)]">JPG, PNG  maks 10 MB</p>
                </div>
              )}

              {!useCamera && (
                <>
                  <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFileChange} className="hidden" id="file-gallery" />
                  <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" capture="environment" onChange={handleFileChange} className="hidden" id="file-capture" ref={captureInputRef} />
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={startCamera}
                      className="inline-flex items-center justify-center gap-2 bg-[var(--leaf)] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3a9b5d] active:scale-[.97] transition">
                      <i className="fa-solid fa-camera" /> Kamera
                    </button>
                    <label htmlFor="file-gallery"
                      className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[var(--charcoal)] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 cursor-pointer active:scale-[.97] transition">
                      <i className="fa-solid fa-images" /> Galeri
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">atau drag & drop gambar ke area ini</p>
                </>
              )}
            </div>

            <button type="submit" disabled={!file || loading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white text-sm tracking-wide shadow-lg hover:shadow-xl active:scale-[.97] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
              {loading ? (
                <span className="inline-flex items-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Menganalisis...</span>
              ) : (
                <span className="inline-flex items-center gap-2"><i className="fa-solid fa-magnifying-glass" /> Mulai Scan</span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 pb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {(result.annotated_image_path || preview) && (
                <div className="w-full bg-gray-50 flex flex-col items-center justify-center p-4">
                  <img
                    src={result.annotated_image_path
                      ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${result.annotated_image_path}`
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
                {(() => {
                  const filteredDiseases = result.diseases?.filter(d => d.category?.toLowerCase() !== 'healthy') || [];
                  const diseaseCount = filteredDiseases.length;
                  return (
                    <>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                        <i className="fa-solid fa-virus text-[var(--leaf)]" />
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-[var(--forest)]">{diseaseCount}</span>
                          <span className="text-sm font-bold text-[var(--forest)]">Deteksi</span>
                        </div>
                      </div>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                    <i className="fa-solid fa-clock text-gray-400" />
                    <div>
                      <p className="text-[11px] text-[var(--muted)] leading-none mb-0.5">Waktu</p>
                      <p className="text-sm font-semibold text-[var(--charcoal)]">{formatToWIB(result.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[var(--forest)]"><i className="fa-solid fa-clipboard-check mr-1.5" />Hasil Deteksi</h3>
                  {filteredDiseases.length > 0 ? (
                    filteredDiseases.map((d, idx) => (
                      <div key={idx} className="rounded-xl border border-gray-100 p-4 space-y-3 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-[var(--charcoal)]">{d.disease_name}</h4>
                          <span className={`pill text-xs ${categoryColor(d.category)}`}>{d.category}</span>
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
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${severityColor(d.severity)}`}>{d.severity}</span>
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
                    ))
                  ) : (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-[var(--forest)]">
                        <i className="fa-solid fa-circle-check mr-2 text-emerald-500"></i>
                        Tanaman sehat! Tidak ada penyakit terdeteksi.
                      </p>
                    </div>
                  )}
                </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3 px-5 sm:px-6 pb-6 pt-2">
                <button onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-[var(--charcoal)] py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 active:scale-[.97] transition">
                  <i className="fa-solid fa-rotate-right" /> Scan Lagi
                </button>
                {!result.is_guest_scan && (
                  <Link href="/history"
                    className="inline-flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[.97] transition"
                    style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
                    <i className="fa-solid fa-clock-rotate-left" /> History
                  </Link>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
      </Shell>
    );
}
