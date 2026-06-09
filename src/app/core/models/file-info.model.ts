/**
 * Represents the metadata of a file returned by the backend API.
 * This interface includes properties such as filename, size, token, and expiration date.
 * It also includes optional UI-specific properties for displaying file status and icons.
 */
export interface FileInfo {
  // Properties returned by the backend API
  /**
   * The unique identifier of the file.
   */
  id: number;
  
  /**
   * The name of the file.
   */
  filename: string;
  
  /**
   * The size of the file as a string (e.g., "1.5 MB").
   */
  fileSize: string;

  /**
   * The unique token for accessing the file.
   */
  fileToken: string;

  /**
   * The date when the file was created (as a string).
   */
  createdAt: string;

  /**
   * The expiration date of the file (as a string).
   */
  expirationDate: string; 
  
  /**
   * Indicates whether the file is password-protected.
   */
  hasPassword: boolean;

  // Optional properties for UI display
  
  /**
   * Indicates whether the file has expired.
   */
  isExpired?: boolean;
  /**
   * A message describing the expiration status of the file (e.g., "File expired on 2024-01-01").
   */
  expirationMsg?: string;

  /**
   * The URL of the icon associated with the file type.
   */
  fileIconUrl?: string;
}