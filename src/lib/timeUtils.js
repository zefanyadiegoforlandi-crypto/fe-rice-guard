/**
 * Format datetime to Indonesia timezone (UTC+7 / WIB)
 * @param {string | Date} dateString - ISO 8601 datetime string atau Date object
 * @returns {string} Formatted datetime "Hari, TGL Bulan TAHUN pukul HH.MM"
 */
export function formatToWIB(dateString) {
  if (!dateString) return '-';

  try {
    // Parse ISO 8601 string (UTC)
    const utcDate = new Date(dateString);
    
    // Konversi ke WIB (UTC+7)
    const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
    
    // Format: Hari, TGL Bulan TAHUN pukul HH.MM
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    
    const formatter = new Intl.DateTimeFormat('id-ID', options);
    const formatted = formatter.format(wibDate);
    
    // Replace "pukul" dari format default dengan yang konsisten
    return formatted.replace(' pukul ', ' pukul ');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}

/**
 * Format datetime ke format pendek (TGL Bulan, HH.MM)
 * @param {string | Date} dateString - ISO 8601 datetime string atau Date object
 * @returns {string} Formatted datetime "TGL Bulan, HH.MM"
 */
export function formatToWIBShort(dateString) {
  if (!dateString) return '-';

  try {
    const utcDate = new Date(dateString);
    const wibDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
    
    const day = wibDate.getDate();
    const monthName = wibDate.toLocaleString('id-ID', { month: 'short' });
    const hours = String(wibDate.getHours()).padStart(2, '0');
    const minutes = String(wibDate.getMinutes()).padStart(2, '0');
    
    return `${day} ${monthName}, ${hours}.${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}
