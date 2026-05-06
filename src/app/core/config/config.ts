export const APP_CONFIG = {
  // Maximum file size for uploads (in bytes) 
  MAX_FILE_SIZE: 1 * 1024 * 1024 * 1024, // 1 Go
  // Expiration time for shared links (in days)
  LINK_EXPIRATION_DAYS: 7
};


export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 octets';

  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
