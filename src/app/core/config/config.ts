/**
 * Configuration constants for file uploads, registration, and downloads.
 * This module defines key configuration values such as maximum file sizes, expiration times,
 * forbidden file types, password requirements, and email validation patterns.
 *
 * @see FILE_CONFIG
 * @see REGISTER_CONFIG
 * @see DOWNLOAD_CONFIG
 */

export const FILE_CONFIG = {
  /**
   * Maximum file size allowed for uploads (in bytes).
   * Default value: 1 GB (1 * 1024 * 1024 * 1024 bytes).
   */
  MAX_FILE_SIZE: 1 * 1024 * 1024 * 1024, // 1 GB
  
  /**
   * Default expiration time for shared file links (in days).
   * Default value: 7 days.
   */
  DEFAULT_LINK_EXPIRATION_DAYS: 7,
  
  /**
   * Available expiration options for shared file links (in days).
   * Keys represent the number of days, and values represent the human-readable label.
   */
  LINK_EXPIRATION_OPTIONS: {
    1: 'Une journée',
    2: 'Deux jours',
    3: 'Trois jours',
    4: 'Quatre jours',
    5: 'Cinq jours',
    6: 'Six jours',
    7: 'Une semaine'
  },
  
  /**
   * Forbidden file extensions for uploads.
   * Files with these extensions are not allowed to be uploaded.
   */
  FORBIDDEN_FILE_TYPES: ['exe', 'bat', 'cmd', 'sh', 'js'],
  
  /**
   * Minimum password length for file protection.
   * If a password is provided for a file, it must be at least 6 characters long.
   */
  PASSWORD_MIN_LENGTH: 6,
  
  /**
   * Password complexity regex pattern.
   * If a password is provided, it must contain at least one uppercase letter, one lowercase letter, and one digit.
   */
  PASSWORD_REGEX: /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/
};

export const REGISTER_CONFIG = {
  /**
   * Email validation regex pattern.
   * Ensures the email follows a standard format (e.g., user@example.com).
   */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  
  /**
   * Minimum password length for registration.
   * Passwords must be at least 8 characters long.
   */
  PASSWORD_MIN_LENGTH: 8,
  
  /**
   * Password complexity regex pattern for registration.
   * Passwords must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.
   */
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};

export const DOWNLOAD_CONFIG = {
  /**
   * Number of days before expiration to show a warning message.
   * Default value: 0 days (warning shown when the file is expired).
   */
  EXPIRATION_WARNING: 0 // days before expiration to show WARNING
};