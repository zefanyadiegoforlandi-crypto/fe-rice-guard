'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminShell from '@/components/AdminShell';
import { notifyError, notifySuccess, notifyWarning } from '@/lib/notify';
import { adminAPI } from '@/lib/adminAPI';
import { formatToWIB, formatToWIBShort } from '@/lib/timeUtils';
import PaginationEllipsis from '@/components/PaginationEllipsis';
import SweetAlert2 from 'sweetalert2/dist/sweetalert2.js';
import 'sweetalert2/dist/sweetalert2.min.css';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

export default function AdminGuestScansClient() {
  const router = useRouter();
  const { user, isLoggedIn, hydrated } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [diseaseFilter, setDiseaseFilter] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push('/admin-login');
    } else if (hydrated && isLoggedIn && user?.role !== 'admin') {
      notifyWarning('Hanya admin yang bisa akses halaman ini');
      router.push('/dashboard');
    }
  }, [hydrated, isLoggedIn, user, router]);

  // Fetch guest scans
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      fetchGuestScans();
    }
  }, [isLoggedIn, user?.role, page, sortBy, sortOrder, diseaseFilter]);

  const fetchGuestScans = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGuestScans({
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
        disease: diseaseFilter.trim() || undefined,
      });
      setScans(response.data.items || []);
      setTotalItems(response.data.total || 0);
      setPage(response.data.page || page);
      setTotalPages(response.data.total_pages || 0);
    } catch (err) {
      notifyError('Gagal mengambil data guest scans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (detection) => {
    setSelectedDetection(detection);
    setShowDetailModal(true);
  };

  const handleDeleteDetection = async (id) => {
    const result = await SweetAlert2.fire({
      title: 'Hapus Scan?',
      text: 'Gambar dan data deteksi akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--forest)',
      cancelButtonColor: '#999',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await adminAPI.deleteDetection(id);
        notifySuccess('Scan berhasil dihapus');
        setShowDetailModal(false);
        fetchGuestScans(); // Refresh list
      } catch (err) {
        notifyError(err.response?.data?.detail || 'Gagal menghapus scan');
      }
    }
  };

  return (
    <AdminShell>
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-globe mr-2" style={{ color: 'var(--forest)' }} />
            Guest Scans
          </h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
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
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
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
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
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
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--forest)]"
              >
                <option value="desc">Terbaru / Z-A</option>
                <option value="asc">Terlama / A-Z</option>
              </select>
            </label>
            </div>
          </div>
        </div>

        {/* Guest Scans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[var(--forest)] animate-bounce"></div>
              <span className="text-[var(--muted)]">Memuat data...</span>
            </div>
          </div>
        ) : scans.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-gray-100 bg-gray-50">
            <div className="mb-4">
              <i className="fa-solid fa-inbox text-4xl text-[var(--muted)]"></i>
            </div>
            <p className="text-[var(--muted)] font-medium">Belum ada guest scans</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scans.map((detection) => (
              <div
                key={detection.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-4 cursor-pointer"
                onClick={() => handleViewDetail(detection)}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  {detection.image_path && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={`${API_BASE}${detection.image_path}`}
                        alt="Scan"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2212%22%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--charcoal)] truncate">
                      {detection.image_name || 'Scan Tanpa Nama'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                      <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                        <i className="fa-solid fa-calendar text-xs"></i>
                        {formatToWIBShort(detection.created_at)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-[var(--forest)]">
                        <i className="fa-solid fa-virus text-xs"></i>
                        {detection.disease_count || 0} deteksi
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDetection(detection.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                    <div className="text-[var(--muted)]">
                      <i className="fa-solid fa-chevron-right"></i>
                    </div>
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

      {/* Detail Modal */}
      {showDetailModal && selectedDetection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg text-[var(--charcoal)]">Detail Guest Scan</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[var(--muted)] hover:text-[var(--charcoal)] text-xl"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Nama */}
              <div>
                <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">
                  Nama Scan
                </label>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-[var(--charcoal)]">{selectedDetection.image_name || 'Scan Tanpa Nama'}</p>
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-[var(--muted)] font-semibold uppercase">Tanggal</p>
                  <p className="text-sm font-bold text-[var(--charcoal)] mt-1">
                    {formatToWIB(selectedDetection.created_at)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-[var(--muted)] font-semibold uppercase">Deteksi</p>
                  <p className="text-sm font-bold text-[var(--forest)] mt-1">
                    {selectedDetection.disease_count || 0} penyakit
                  </p>
                </div>
              </div>

              {/* Image with bounding box */}
              {(selectedDetection.annotated_image_path || selectedDetection.image_path) && (
                <div>
                  <img
                    src={`${API_BASE}${selectedDetection.annotated_image_path || selectedDetection.image_path}`}
                    alt="Annotated"
                    className="w-full rounded-xl border border-gray-100"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Diseases */}
              {selectedDetection.diseases && selectedDetection.diseases.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-[var(--charcoal)] mb-3">Hasil Deteksi</p>
                  <div className="space-y-3">
                    {selectedDetection.diseases.map((disease, idx) => (
                      <div key={idx} className="p-4 border border-gray-100 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-[var(--charcoal)]">{disease.disease_name}</p>
                            <p className="text-xs text-[var(--muted)] mt-0.5">{disease.category}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600">
                            <i className="fa-solid fa-chart-pie"></i>
                            {Math.round(disease.confidence * 100)}%
                          </span>
                        </div>
                        {disease.severity && (
                          <p className="text-xs font-semibold text-[var(--muted)] mb-2">
                            Tingkat Keparahan: <span className="text-[var(--charcoal)]">{disease.severity}</span>
                          </p>
                        )}
                        {disease.recommendations && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs font-semibold text-[var(--forest)] mb-1">Rekomendasi:</p>
                            <ul className="text-xs text-[var(--charcoal)] space-y-1">
                              {disease.recommendations.split('|').map((rec, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-[var(--leaf)]">•</span>
                                  <span>{rec.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleDeleteDetection(selectedDetection.id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl font-semibold hover:bg-red-100 transition"
                >
                  <i className="fa-solid fa-trash mr-2"></i>
                  Hapus
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--leaf)] text-white rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
