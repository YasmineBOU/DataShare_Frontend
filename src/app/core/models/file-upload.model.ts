export interface FileUploadModel {
  email?: string;
  file: File;
  filename: string;
  fileSize: number; 
  fileType: string;
  hash: string;
  password: string;
  expirationDays: number;
}
    