export interface FileUploadModel {
  email?: string;
  file: File;
  filename: string;
  fileSize: number; 
  fileType: string;
  hash: string;
  filePassword: string;
  expirationDays: number;
}
    