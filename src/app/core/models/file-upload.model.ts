/**
 * Represents the data required to upload a file.
 * This interface includes file metadata, user association, and security settings.
 */
export interface FileUploadModel {
  /**
   * The email of the user uploading the file (optional).
   */
  email?: string;
  
  /**
   * The file to upload.
   */
  file: File;
  
  /**
   * The filename.
   */
  filename: string;
  
  /**
   * The filename.
   */
  fileSize: number; 
  
  /**
   * The type of the file (e.g., "image/png", "application/pdf").
   */
  fileType: string;
  
  /**
   * The hash of the file for integrity verification.
   */
  hash: string;
  
  /**
   * The password to protect the file (optional).
   */
  filePassword: string;
  
  /**
   * The number of days until the file expires.
   */
  expirationDays: number;
}
    