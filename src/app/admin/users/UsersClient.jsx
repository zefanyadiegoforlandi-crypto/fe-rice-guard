'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import AdminShell from '@/components/AdminShell';
import { notifyError, notifySuccess, notifyWarning } from '@/lib/notify';
import { formatToWIB, formatToWIBShort } from '@/lib/timeUtils';
import { adminAPI } from '@/lib/adminAPI';
import PaginationEllipsis from '@/components/PaginationEllipsis';
import SweetAlert2 from 'sweetalert2/dist/sweetalert2.js';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function AdminUsersClient() {
  const router = useRouter();
  const { user, isLoggedIn, hydrated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortOrder] = useState('asc');

  // Check if user is admin
  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.push('/login');
    } else if (hydrated && isLoggedIn && user?.role !== 'admin') {
      notifyWarning('Hanya admin yang bisa akses halaman ini');
      router.push('/dashboard');
    }
  }, [hydrated, isLoggedIn, user, router]);

  // Fetch all users
  useEffect(() => {
    if (isLoggedIn && user?.role === 'admin') {
      fetchUsers();
    }
  }, [isLoggedIn, user?.role, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers({
        page,
        per_page: perPage,
        sort_order: sortOrder,
      });
      setUsers(response.data.items || []);
      setTotalItems(response.data.total || 0);
      setPage(response.data.page || page);
      setTotalPages(response.data.total_pages || 0);
    } catch (err) {
      notifyError('Gagal mengambil data user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminAPI.getUserDetail(userId);
      setSelectedUser(response.data);
      setShowDetail(true);
    } catch (err) {
      notifyError('Gagal mengambil detail user');
    }
  };

  const handleEditClick = (userId, currentName) => {
    setEditUserId(userId);
    setEditName(currentName);
    setShowEditModal(true);
  };

  const handlePasswordClick = (userId) => {
    setPasswordUserId(userId);
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      notifyWarning('Nama tidak boleh kosong');
      return;
    }

    try {
      await adminAPI.updateUser(editUserId, { name: editName.trim() });
      notifySuccess('User berhasil diupdate');
      setShowEditModal(false);
      setEditUserId(null);
      setEditName('');
      fetchUsers();
      // Refresh detail jika masih terbuka
      if (selectedUser) {
        const response = await adminAPI.getUserDetail(selectedUser.id);
        setSelectedUser(response.data);
      }
    } catch (err) {
      notifyError(err.response?.data?.detail || 'Gagal mengupdate user');
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      notifyWarning('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      notifyWarning('Konfirmasi password tidak sama');
      return;
    }

    try {
      await adminAPI.updateUserPassword(passwordUserId, { new_password: newPassword.trim() });
      notifySuccess('Password user berhasil diupdate');
      setShowPasswordModal(false);
      setPasswordUserId(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      notifyError(err.response?.data?.detail || 'Gagal mengupdate password');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Yakin ingin menghapus user ${userEmail}? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      await adminAPI.deleteUser(userId);
      notifySuccess('User berhasil dihapus');
      fetchUsers();
      setShowDetail(false);
      setSelectedUser(null);
    } catch (err) {
      notifyError(err.response?.data?.detail || 'Gagal menghapus user');
    }
  };

  const handleViewDetection = (detection, userId) => {
    setSelectedDetection({
      ...detection,
      user_id: userId
    });
    setShowDetectionModal(true);
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
        setShowDetectionModal(false);
        // Refresh user detail jika masih dibuka
        if (selectedUser) {
          const response = await adminAPI.getUserDetail(selectedUser.id);
          setSelectedUser(response.data);
        }
      } catch (err) {
        notifyError(err.response?.data?.detail || 'Gagal menghapus scan');
      }
    }
  };

  if (!hydrated || !isLoggedIn || user?.role !== 'admin') {
    return null;
  }

  return (
    <AdminShell>
      <div className="max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--charcoal)] tracking-tight">
            <i className="fa-solid fa-users mr-2 text-[var(--forest)]" />
            Manajemen Users
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">Kelola semua pengguna terdaftar di sistem</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-600 animate-bounce"></div>
              <span className="text-[var(--muted)]">Memuat data user...</span>
            </div>
          </div>
        )}

        {/* Users Table */}
        {!loading && users.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--forest)] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nama</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Terdaftar</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, idx) => (
                    <tr key={u.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-[var(--forest)]/10 text-[var(--forest)]'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewUser(u.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--forest)] text-white text-sm font-medium hover:bg-opacity-80 transition"
                        >
                          <i className="fa-solid fa-eye text-xs"></i>
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 space-y-3">
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

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
            <i className="fa-solid fa-users text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Tidak ada user terdaftar</p>
          </div>
        )}

        {/* User Detail Modal */}
        {showDetail && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--charcoal)]">{selectedUser.name}</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
                  <p className="text-sm"><span className="font-semibold text-[var(--charcoal)]">Email:</span> <span className="text-gray-600">{selectedUser.email}</span></p>
                  <p className="text-sm"><span className="font-semibold text-[var(--charcoal)]">Nama:</span> <span className="text-gray-600">{selectedUser.name}</span></p>
                    <p className="text-sm"><span className="font-semibold text-[var(--charcoal)]">Role:</span> <span className={`text-xs font-semibold px-2 py-1 rounded-full ${selectedUser.role === 'admin' ? 'bg-[var(--forest)]/10 text-[var(--forest)]' : 'bg-green-100 text-green-800'}`}>{selectedUser.role}</span></p>
                  <p className="text-sm"><span className="font-semibold text-[var(--charcoal)]">Terdaftar:</span> <span className="text-gray-600">{new Date(selectedUser.created_at).toLocaleDateString('id-ID')}</span></p>
                  <p className="text-sm"><span className="font-semibold text-[var(--charcoal)]">Total Scan:</span> <span className="text-gray-600 font-bold">{selectedUser.total_detections}</span></p>
                </div>

                {/* Detection History */}
                <div>
                  <h3 className="font-semibold text-[var(--charcoal)] mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-history text-[var(--forest)]"></i>
                    Riwayat Scan
                  </h3>
                  {selectedUser.detections.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedUser.detections.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => handleViewDetection(d, selectedUser.id)}
                          className="w-full text-left bg-white rounded-lg p-4 border border-gray-200 hover:border-[var(--forest)] hover:bg-green-50 transition cursor-pointer"
                        >
                          <p className="text-sm font-medium text-[var(--charcoal)]">
                            <i className="fa-solid fa-image mr-2 text-gray-400"></i>
                            {d.image_name || d.image_filename}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <i className="fa-solid fa-calendar mr-1"></i>
                            {formatToWIB(d.created_at)}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {d.diseases.map((disease, idx) => (
                              <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                {disease.disease_name} ({(disease.confidence * 100).toFixed(1)}%)
                              </span>
                            ))}
                            {d.diseases.length === 0 && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                Tanaman Sehat
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      <i className="fa-solid fa-inbox text-2xl text-gray-300 mb-2 block"></i>
                      Belum ada history scan
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditClick(selectedUser.id, selectedUser.name)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    Edit Nama
                  </button>
                  <button
                    onClick={() => handlePasswordClick(selectedUser.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-key"></i>
                    Ubah Password
                  </button>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 text-sm font-semibold hover:bg-gray-300 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--charcoal)]">Edit Nama User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">Nama Baru</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    placeholder="Nama user"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--forest)] text-white font-semibold hover:bg-opacity-80 transition"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-[var(--charcoal)]">Ubah Password User</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Minimal 6 karakter"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--charcoal)] mb-2">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ulangi password baru"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSavePassword}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--forest)] text-white font-semibold hover:bg-opacity-80 transition"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detection Detail Modal */}
        {showDetectionModal && selectedDetection && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header image */}
              {(selectedDetection.annotated_image_path || selectedDetection.image_path) && (
                <div className="relative w-full h-56 sm:h-72 bg-gray-50 rounded-t-2xl overflow-hidden flex items-center justify-center">
                  <img
                    src={`${API_BASE}${selectedDetection.annotated_image_path || selectedDetection.image_path}`}
                    alt={selectedDetection.image_name || selectedDetection.image_filename}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback ke gambar original jika annotated gagal
                      if (selectedDetection.annotated_image_path && e.target.src.includes('_annotated')) {
                        e.target.src = `${API_BASE}${selectedDetection.image_path}`;
                      } else {
                        e.target.src = '';
                        e.target.alt = 'Gambar tidak tersedia';
                      }
                    }}
                  />
                  {selectedDetection.annotated_image_path && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                      <i className="fa-solid fa-vector-square mr-1"></i>Bounding Box
                    </div>
                  )}
                  <button
                    onClick={() => setShowDetectionModal(false)}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-500 hover:bg-white hover:text-gray-800 transition shadow-sm"
                  >
                    <i className="fa-solid fa-xmark text-sm"></i>
                  </button>
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-5">
                {/* Image name */}
                <div>
                  <h2 className="text-lg font-extrabold text-[var(--charcoal)] truncate">
                    <i className="fa-solid fa-tag mr-2 text-[var(--leaf)]"></i>
                    {selectedDetection.image_name || selectedDetection.image_filename}
                  </h2>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <i className="fa-solid fa-calendar text-[var(--leaf)] text-xs"></i>
                    <span className="text-sm font-medium text-[var(--charcoal)]">
                      {formatToWIB(selectedDetection.created_at)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm font-bold text-[var(--forest)]">
                    <i className="fa-solid fa-virus text-xs"></i>
                    {selectedDetection.disease_count || selectedDetection.diseases?.length || 0} deteksi
                  </span>
                </div>

                {/* Disease results */}
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[var(--forest)]">
                    <i className="fa-solid fa-clipboard-check mr-1.5"></i>Hasil Deteksi
                  </h3>
                  {selectedDetection.diseases && selectedDetection.diseases.length > 0 ? (
                    selectedDetection.diseases.map((disease, idx) => {
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

                      return (
                        <div key={idx} className="rounded-xl border border-gray-100 p-4 space-y-3 hover:shadow-sm transition-shadow">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-bold text-[var(--charcoal)]">{disease.disease_name}</h4>
                            <span className={`pill text-xs border ${categoryColor(disease.category)}`}>{disease.category || 'Penyakit'}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[var(--muted)]">Keyakinan:</span>
                              <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[var(--leaf)] transition-all"
                                  style={{ width: `${(disease.confidence * 100).toFixed(0)}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-[var(--forest)]">{(disease.confidence * 100).toFixed(1)}%</span>
                            </div>
                            {disease.severity && disease.severity !== 'None' && (
                              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${severityColor(disease.severity)}`}>
                                {disease.severity}
                              </span>
                            )}
                          </div>

                          {disease.recommendations && (
                            <div className="pt-2 border-t border-gray-50 space-y-1.5">
                              <p className="text-xs font-semibold text-[var(--forest)]">
                                <i className="fa-solid fa-lightbulb mr-1 text-amber-500"></i>Cara Penanganan
                              </p>
                              {disease.recommendations.split(' | ').map((rec, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                  <span className="text-[var(--leaf)] mt-0.5 flex-shrink-0">&#10003;</span>
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-emerald-100 p-4 bg-emerald-50">
                      <p className="text-emerald-900 font-semibold">
                        <i className="fa-solid fa-check-circle mr-2"></i>
                        Tanaman Sehat
                      </p>
                      <p className="text-xs text-emerald-700 mt-1">Tidak terdeteksi penyakit pada tanaman ini</p>
                    </div>
                  )}
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleDeleteDetection(selectedDetection.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    <i className="fa-solid fa-trash mr-2"></i>
                    Hapus
                  </button>
                  <button
                    onClick={() => setShowDetectionModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--muted)] hover:bg-gray-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
