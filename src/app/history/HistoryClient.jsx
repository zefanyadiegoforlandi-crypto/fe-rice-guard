'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { detectionAPI } from '@/lib/detectionAPI';
import { notifySuccess, notifyError, confirmDeleteOne, confirmDeleteAll } from '@/lib/notify';
import { formatToWIB, formatToWIBShort } from '@/lib/timeUtils';
import AppShell from '@/components/AppShell';
import PaginationEllipsis from '@/components/PaginationEllipsis';
import Swal from 'sweetalert2';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
/*  Detail Modal  */
function DetailModal({ detection, onClose, onDelete, onRename, deleting }) {
  if (!detection) return null;

  const categoryColor = (cat) => {
    const c = cat?.toLowerCase();
    if (c === 'disease') return 'bg-red-50 text-red-600 border-red-100';
    if (c === 'pest') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  const severityColor = (sev) => {
    const s = sev?.toLowerCase();
    if (s === 'high' || s === 'severe') return 'text-red-600 bg-red-50';
    if (s === 'medium' || s === 'moderate') return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };
  console.log("annotated_image_path:", detection.annotated_image_path)
console.log("image_path:", detection.image_path)
console.log("Full URL:", `${API_BASE}${detection.annotated_image_path}`)
console.log("API_BASE:", API_BASE)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header image — prefer annotated image with bounding boxes */}
        {(detection.annotated_image_path || detection.image_path) && (
          <div className="relative w-full h-56 sm:h-72 bg-gray-50 rounded-t-2xl overflow-hidden flex flex-col items-center justify-center">
            <img
              src={`${API_BASE}${detection.annotated_image_path || detection.image_path}`}
              alt="Scan"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback ke gambar original jika annotated gagal
                if (detection.annotated_image_path && e.target.src.includes('_annotated')) {
                  e.target.src = `${API_BASE}${detection.image_path}`;
                } else {
                  e.target.src = ''; e.target.alt = 'Gambar tidak tersedia';
                }
              }}
            />
            {detection.annotated_image_path && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                <i className="fa-solid fa-vector-square mr-1"></i>Bounding Box
              </div>
            )}
            <button onClick={onClose}
              className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition shadow-sm">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* Image name / label */}
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-extrabold text-[var(--charcoal)] truncate flex-1">
              <i className="fa-solid fa-tag mr-2 text-[var(--leaf)]"></i>
              {detection.image_name || `Gambar #${detection.id}`}
            </h2>
            <button onClick={() => onRename(detection)}
              className="flex-shrink-0 text-xs font-semibold text-[var(--leaf)] hover:text-[var(--forest)] border border-[var(--leaf)] px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
              <i className="fa-solid fa-pen mr-1"></i>Ubah Nama
            </button>
          </div>

          {/* Info row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <i className="fa-solid fa-calendar text-[var(--leaf)] text-xs"></i>
              <span className="text-sm font-medium text-[var(--charcoal)]">
                {formatToWIB(detection.created_at)}
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm font-bold text-[var(--forest)]">
              <i className="fa-solid fa-virus text-xs"></i>
              {(() => {
                const filtered = detection.diseases?.filter(d => d.category?.toLowerCase() !== 'healthy') || [];
                return filtered.length;
              })()} Deteksi
            </span>
          </div>

          {/* Each disease card */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[var(--forest)]">
              <i className="fa-solid fa-clipboard-check mr-1.5"></i>Hasil Deteksi
            </h3>
            {(() => {
              const filteredDiseases = detection.diseases?.filter(d => d.category?.toLowerCase() !== 'healthy') || [];
              return filteredDiseases.length > 0 ? (
                filteredDiseases.map((d, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 p-4 space-y-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-[var(--charcoal)]">{d.disease_name}</h4>
                  <span className={`pill text-xs border ${categoryColor(d.category)}`}>{d.category}</span>
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
                    <p className="text-xs font-semibold text-[var(--forest)]">
                      <i className="fa-solid fa-lightbulb mr-1 text-amber-500"></i>Cara Penanganan
                    </p>
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
              );
            })()}
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--muted)] hover:bg-gray-50 transition-colors">
              Tutup
            </button>
            <button onClick={() => onDelete(detection.id)} disabled={deleting === detection.id}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
              <i className="fa-solid fa-trash-can mr-1.5"></i>
              {deleting === detection.id ? 'Menghapus...' : 'Hapus History'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/*  Main Component  */
export default function HistoryClient() {
  const router = useRouter();
  const { isLoggedIn, hydrated, user } = useAuth();
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [diseaseFilter, setDiseaseFilter] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [isLoggedIn, hydrated, user?.role, router]);

  const fetchHistory = async (targetPage = page, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data } = await detectionAPI.getHistory({
        page: targetPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        disease: diseaseFilter.trim() || undefined,
      });
      setDetections(data?.items ?? []);
      setTotalItems(data?.total ?? 0);
      setPage(data?.page ?? targetPage);
      setTotalPages(data?.total_pages ?? 0);
    } catch (err) {
      notifyError('Gagal memuat history deteksi');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated || !isLoggedIn || user?.role === 'admin') return;
    fetchHistory(page);
  }, [hydrated, isLoggedIn, user?.role, page, perPage, sortBy, sortOrder, diseaseFilter]);

  const handleDeleteOne = async (id) => {
    const ok = await confirmDeleteOne();
    if (!ok) return;
    setDeleting(id);
    try {
      await detectionAPI.deleteOne(id);
      await fetchHistory(page, false);
      if (selected?.id === id) setSelected(null);
      notifySuccess('History berhasil dihapus');
    } catch {
      notifyError('Gagal menghapus history');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    const ok = await confirmDeleteAll(totalItems);
    if (!ok) return;
    setDeleting('all');
    try {
      await detectionAPI.deleteAll();
      setDetections([]);
      setTotalItems(0);
      setTotalPages(0);
      setPage(1);
      notifySuccess('Semua history berhasil dihapus');
    } catch {
      notifyError('Gagal menghapus semua history');
    } finally {
      setDeleting(null);
    }
  };

  const handleRename = async (detection) => {
    const { value: newName } = await Swal.fire({
      title: 'Ubah Nama Gambar',
      input: 'text',
      inputLabel: 'Masukkan nama/label untuk gambar ini',
      inputValue: detection.image_name || '',
      inputPlaceholder: 'Contoh: Sawah Blok A, Tanaman Utara...',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#48bb78',
      inputValidator: (value) => {
        if (!value || !value.trim()) return 'Nama tidak boleh kosong';
      },
    });
    if (!newName) return;
    try {
      await detectionAPI.renameDetection(detection.id, newName.trim());
      await fetchHistory(page, false);
      if (selected?.id === detection.id) {
        setSelected((prev) => (prev ? { ...prev, image_name: newName.trim() } : prev));
      }
      notifySuccess('Nama berhasil diubah');
    } catch {
      notifyError('Gagal mengubah nama');
    }
  };

  const categoryColor = (cat) => {
    const c = cat?.toLowerCase();
    if (c === 'disease') return 'bg-red-50 text-red-600 border border-red-100';
    if (c === 'pest') return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  };

  // Guard: Jangan render sampai hydration selesai dan user terverifikasi login
  if (!hydrated || !isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-28 h-28 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <>
      <AppShell>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--charcoal)] tracking-tight">
                <i className="fa-solid fa-clock-rotate-left mr-2 text-[var(--leaf)]" />
                History Deteksi
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">Lihat hasil scan terdahulu beserta cara penanganan.</p>
            </div>
            {/* <Link href="/scan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:shadow-lg active:scale-[.97] transition"
              style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
              <i className="fa-solid fa-plus text-xs" /> Scan baru
            </Link> */}
          </div>

          {/* Content card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-gray-100 space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-[var(--muted)]">Filter penyakit</span>
                    <input
                      type="text"
                      value={diseaseFilter}
                      onChange={(e) => {
                        setPage(1);
                        setDiseaseFilter(e.target.value);
                      }}
                      placeholder="Cari Brown_Spot"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--leaf)]"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-[var(--muted)]">Urutkan</span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setPage(1);
                        setSortBy(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] bg-white"
                    >
                      <option value="date">Tanggal</option>
                      <option value="name">Nama</option>
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="block text-xs font-semibold text-[var(--muted)]">Arah</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setPage(1);
                        setSortOrder(e.target.value);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--leaf)] bg-white"
                    >
                      <option value="desc">Terbaru / Z-A</option>
                      <option value="asc">Terlama / A-Z</option>
                    </select>
                  </label>
                </div>

                {totalItems > 0 && (
                  <button onClick={handleDeleteAll} disabled={deleting === 'all'}
                    className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-semibold disabled:opacity-50 transition-colors self-start lg:self-auto">
                    <i className="fa-solid fa-trash-can text-xs"></i>
                    {deleting === 'all' ? 'Menghapus...' : 'Hapus Semua'}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-[var(--muted)]">
                <p>
                  <span className="font-semibold text-[var(--charcoal)]">{totalItems}</span> hasil scan
                </p>
               
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {detections.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(76,181,114,0.1)' }}>
                    <i className="fa-solid fa-inbox text-2xl text-[var(--leaf)]" />
                  </div>
                  <p className="text-base font-semibold text-[var(--charcoal)] mb-1">Belum ada history</p>
                  <p className="text-sm text-[var(--muted)] mb-6">Mulai scan pertama Anda untuk melihat history di sini.</p>
                  <Link href="/scan"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm hover:shadow-lg active:scale-[.97] transition"
                    style={{ background: 'linear-gradient(135deg, var(--leaf) 0%, #3a9b5d 100%)' }}>
                    <i className="fa-solid fa-camera" /> Mulai scan pertama
                  </Link>
                </div>
              ) : (
                /* Detection list */
                <div className="space-y-3">
                  {detections.map((detection) => (
                    <div key={detection.id}
                      className={`rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm p-3 sm:p-4 transition cursor-pointer ${deleting === detection.id ? 'opacity-50' : ''}`}
                      onClick={() => setSelected(detection)}>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Thumbnail — prefer annotated image */}
                        {(detection.annotated_image_path || detection.image_path) && (
                          <div className="w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                            <img src={`${API_BASE}${detection.annotated_image_path || detection.image_path}`} alt="Scan"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (detection.annotated_image_path && e.target.src.includes('_annotated')) {
                                  e.target.src = `${API_BASE}${detection.image_path}`;
                                } else {
                                  e.target.style.display = 'none';
                                }
                              }} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-2.5">
                          {/* Name */}
                          <p className="text-sm font-bold text-[var(--charcoal)] truncate">
                            <i className="fa-solid fa-tag mr-1.5 text-[var(--leaf)] text-xs"></i>
                            {detection.image_name || `Gambar #${detection.id}`}
                          </p>

                          {/* Disease pills */}
                          <div className="flex flex-wrap gap-1.5">
                            {detection.diseases?.filter(d => d.category?.toLowerCase() !== 'healthy').map((d, idx) => (
                              <span key={idx} className={`pill text-[11px] py-0.5 ${categoryColor(d.category)}`}>
                                {d.disease_name}  {(d.confidence * 100).toFixed(0)}%
                              </span>
                            ))}
                          </div>

                          {/* Meta row */}
                          <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                            <span className="inline-flex items-center gap-1 font-bold text-[var(--forest)]">
                              <i className="fa-solid fa-virus"></i>
                              {(() => {
                                const filtered = detection.diseases?.filter(d => d.category?.toLowerCase() !== 'healthy') || [];
                                return filtered.length;
                              })()} Deteksi
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <i className="fa-solid fa-calendar"></i>
                              {formatToWIBShort(detection.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col sm:justify-center items-center gap-2 flex-shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); handleRename(detection); }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--leaf)] hover:text-[var(--forest)] px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap">
                            <i className="fa-solid fa-pen text-[10px]"></i>Ubah Nama
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteOne(detection.id); }}
                            disabled={deleting === detection.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 whitespace-nowrap">
                            <i className="fa-solid fa-trash-can text-[10px]"></i>Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex justify-center">
                      <PaginationEllipsis
                        currentPage={page}
                        totalPages={totalPages || 1}
                        onPageChange={setPage}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>

      {/* Detail Modal */}
      <DetailModal
        detection={selected}
        onClose={() => setSelected(null)}
        onDelete={handleDeleteOne}
        onRename={handleRename}
        deleting={deleting}
      />
    </>
  );
}
