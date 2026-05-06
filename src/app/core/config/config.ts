export const FILE_CONFIG = {
  // Maximum file size for uploads (in bytes) 
  MAX_FILE_SIZE: 1 * 1024 * 1024 * 1024, // 1 Go
  // Default expiration time for shared links (in days)
  LINK_EXPIRATION_DAYS: 7,
  // Forbidden file types (e.g., .exe, .bat)
  FORBIDDEN_FILE_TYPES: ['exe', 'bat', 'cmd', 'sh', 'js'],
  // Minimum password length for file protection if provided
  PASSWORD_MIN_LENGTH: 6
};

export const REGISTER_CONFIG = {
  // Minimum password length
  PASSWORD_MIN_LENGTH: 8
};

export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 octets';

  const k = 1024;
  const sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
