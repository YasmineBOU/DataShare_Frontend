import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileInfo } from '../models/file-info.model';
import { FileDownload } from '../models/file-download.model';

export interface FileListResponse {
  message: string;
  files: FileInfo[];
}


@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private httpClient: HttpClient) { }

  uploadFile(fileUploadFormData: FormData): Observable<Object> {
    console.log("File upload data:", fileUploadFormData);
    return this.httpClient.post('/api/files/upload', fileUploadFormData);
  }

  downloadFile(fileDownloadInfo: FileDownload): Observable<Object> {
    return this.httpClient.post('/api/files/download', fileDownloadInfo);
  }

  listFiles(email: string): Observable<FileListResponse> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.get<FileListResponse>('/api/files/list', { params });
  }

  deleteFile(fileId: number): Observable<Object> {
    return this.httpClient.delete(`/api/files/delete/${fileId}`);
  }

}
