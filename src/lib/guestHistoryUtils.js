// Guest history management using localStorage
// Menyimpan history scan guest lokal di device

const STORAGE_KEY = 'guest_scan_history';

export const guestHistoryUtils = {
  /**
   * Simpan scan result ke history
   */
  addScan(scanResult) {
    try {
      const history = this.getHistory();
      const newEntry = {
        id: Date.now(), // Simple unique ID based on timestamp
        ...scanResult,
        savedAt: new Date().toISOString(),
      };
      history.unshift(newEntry); // Add to beginning (newest first)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      return newEntry;
    } catch (error) {
      console.error('Error saving scan to history:', error);
      return null;
    }
  },

  /**
   * Ambil seluruh history
   */
  getHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  },

  /**
   * Ambil scan detail berdasarkan ID
   */
  getScanById(id) {
    const history = this.getHistory();
    return history.find(item => item.id === id);
  },

  /**
   * Hapus scan dari history
   */
  deleteScan(id) {
    try {
      const history = this.getHistory();
      const filtered = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting scan:', error);
      return false;
    }
  },

  /**
   * Hapus semua history
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      return false;
    }
  },

  /**
   * Update nama scan
   */
  updateScanName(id, newName) {
    try {
      const history = this.getHistory();
      const index = history.findIndex(item => item.id === id);
      if (index !== -1) {
        history[index].image_name = newName;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating scan name:', error);
      return false;
    }
  },

  /**
   * Count total scans
   */
  getTotalScans() {
    return this.getHistory().length;
  },
};
