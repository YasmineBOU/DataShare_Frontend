import { Observable, of } from "rxjs";
import { FileDownloadInfo } from "../models/file-download.model";

export class FileMockService {

  uploadFile(formData: FormData): Observable<Object> {
    console.log("Mock uploadFile called with:", formData);
    return Observable.of({ message: "File uploaded successfully" });
  }

  getFileLink(fileDownloadInfo: FileDownloadInfo): Observable<Object> {
    console.log("Mock getFileLink called with:", fileDownloadInfo);
    return Observable.of({ url: "hdyYnb-65645" });
  }

  downloadFile(url: string): Observable<Blob> {
    console.log("Mock downloadFile called with URL:", url);
    const blob = new Blob(["Mock file content"], { type: "text/plain" });
    return Observable.of(blob);
  }

  listFiles(email: string): Observable<{ message: string; files: any[] }> {
    console.log("Mock listFiles called with email:", email);
    return Observable.of({
      message: "Files retrieved successfully",
      files: [
        { 
          id: 1, 
          filename: "file1.txt", 
          fileSize: 1234, 
          fileToken: "hdyYnb-65645", 
          createdAt: "2024-01-01T12:00:00Z", 
          expirationDate: "2024-01-31T12:00:00Z", 
          hasPassword: false 
        },

        { 
          id: 2, 
          filename: "file2.txt", 
          fileSize: 5678, 
          fileToken: "hdyYnb-65646", 
          createdAt: "2024-01-01T12:00:00Z", 
          expirationDate: "2024-01-31T12:00:00Z", 
          hasPassword: false 
        }
      ]
    });
  }

  getFileInfo(fileToken: string): Observable<Object> {
    console.log("Mock getFileInfo called with fileToken:", fileToken);
    return Observable.of({
      id: 1,
      filename: "file1.txt",
      fileSize: 1234,
      fileToken: "hdyYnb-65645",
      createdAt: "2024-01-01T12:00:00Z",
      expirationDate: "2024-01-31T12:00:00Z",
      hasPassword: false
    });
  }

  deleteFile(fileId: number): Observable<Object> {
    console.log("Mock deleteFile called with fileId:", fileId);
    return Observable.of({ message: "File deleted successfully" });
  }

}