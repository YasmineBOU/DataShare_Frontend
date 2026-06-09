
/**
 * Represents the information required to download a file.
 * This interface encapsulates the file ID and password (if applicable).
 */
export interface FileDownloadInfo {
  /**
   * The unique identifier of the file.
   */
  id: number;
  /**
   * The password to access the file (if it is password-protected).
   */
  filePassword: string;
}