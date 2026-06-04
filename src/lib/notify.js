import Swal from 'sweetalert2';

/* ── colour tokens (match CSS vars) ───────────────── */
const LEAF  = '#48bb78';
const FOREST = '#22543d';
const RED    = '#e53e3e';
const AMBER  = '#d69e2e';

/* ── reusable mixin for toast (top-right popup) ────── */
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

/* ═══════════════  PUBLIC API  ═══════════════ */

/** Green success toast */
export const notifySuccess = (text) =>
  Toast.fire({ icon: 'success', title: text });

/** Red error toast */
export const notifyError = (text) =>
  Toast.fire({ icon: 'error', title: text });

/** Amber warning toast */
export const notifyWarning = (text) =>
  Toast.fire({ icon: 'warning', title: text });

/** Blue info toast */
export const notifyInfo = (text) =>
  Toast.fire({ icon: 'info', title: text });

/**
 * Confirmation dialog — returns `true` if confirmed.
 * @param {{ title?: string, text?: string, confirmText?: string, icon?: string }} opts
 */
export const confirmAction = async ({
  title = 'Apakah Anda yakin?',
  text = '',
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  icon = 'warning',
  confirmColor = RED,
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: confirmColor,
    cancelButtonColor: '#a0aec0',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'rounded-xl',
      cancelButton: 'rounded-xl',
    },
  });
  return result.isConfirmed;
};

/**
 * Destructive "delete all" confirmation with a stronger visual.
 */
export const confirmDeleteAll = (count) =>
  confirmAction({
    title: 'Hapus Semua Riwayat?',
    text: `Semua ${count} riwayat deteksi beserta foto akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
    confirmText: 'Ya, hapus semua',
    icon: 'warning',
  });

/**
 * Single item delete confirmation.
 */
export const confirmDeleteOne = () =>
  confirmAction({
    title: 'Hapus riwayat ini?',
    text: 'Riwayat dan foto terkait akan dihapus permanen.',
    confirmText: 'Hapus',
    icon: 'warning',
  });
