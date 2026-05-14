export const FILE_CONFIG = {
  // Maximum file size for uploads (in bytes) 
  MAX_FILE_SIZE: 1 * 1024 * 1024 * 1024, // 1 Go
  // Default expiration time for shared links (in days)
  DEFAULT_LINK_EXPIRATION_DAYS: 7,
  // Available expiration options for shared links (in days)
  LINK_EXPIRATION_OPTIONS: {
    1: 'Une journée',
    2: 'Deux jours',
    3: 'Trois jours',
    4: 'Quatre jours',
    5: 'Cinq jours',
    6: 'Six jours',
    7: 'Une semaine'
  },
  // Forbidden file types (e.g., .exe, .bat)
  FORBIDDEN_FILE_TYPES: ['exe', 'bat', 'cmd', 'sh', 'js'],
  // Minimum password length for file protection if provided
  PASSWORD_MIN_LENGTH: 6
};

export const REGISTER_CONFIG = {
  // Minimum password length
  PASSWORD_MIN_LENGTH: 8
};

export const DOWNLOAD_CONFIG = {
  EXPIRATION_WARNING: 0 // days before expiration to show WARNING
};