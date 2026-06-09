/**
 * Service responsible for handling file operations such as upload, download, listing, retrieval, and deletion.
 * This service interacts with the backend API to manage file storage and retrieval.
 * It includes methods for uploading files, retrieving download links, downloading files, listing user files,
 * and deleting files.
 *
 * @see FileInfo
 * @see FileDownloadInfo
 * @see HttpClient
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { FileInfo } from '../models/file-info.model';
import { FileDownloadInfo } from '../models/file-download.model';

/**
 * Interface representing the response structure for file listing operations.
 * This interface includes a message and a list of files associated with a user's email.
 */
export interface FileListResponse {
  /**
   * A message describing the result of the file listing operation.
   */
  message: string;
  
  /**
   * List of files associated with the user's email.
   */
  files: FileInfo[];
}


@Injectable({
  providedIn: 'root'
})
export class FileService {
  /**
   * Constructs a new FileService with the injected HttpClient.
   * @param httpClient - The HttpClient used to make HTTP requests.
   */
  constructor(private httpClient: HttpClient) { }

  /**
   * Uploads a file to the server.
   * This method sends the file data as a FormData object to the backend.
   *
   * @param fileUploadFormData - The FormData object containing the file to upload.
   * @returns An {@link Observable} of type `Object` representing the upload response.
   */
  uploadFile(fileUploadFormData: FormData): Observable<Object> {
    console.log("File upload data:", fileUploadFormData);
    return this.httpClient.post('/api/files/upload', fileUploadFormData);
  }

  /**
   * Retrieves a download link for a file.
   * This method sends a request to the backend with the file ID and password (if applicable).
   *
   * @param fileDownloadInfo - The {@link FileDownloadInfo} object containing the file ID and password.
   * @returns An {@link Observable} of type `Object` representing the download link response.
   */
  getFileLink(fileDownloadInfo: FileDownloadInfo): Observable<Object> {
    console.log("File download info:", fileDownloadInfo);
    return this.httpClient.post('/api/files/download', fileDownloadInfo);
  }

  /**
   * Downloads a file from the server as a Blob.
   * This method is used to fetch the file content from the provided URL.
   *
   * @param url - The URL of the file to download.
   * @returns An {@link Observable} of type `Blob` representing the file content.
   */
  downloadFile(url: string): Observable<Blob> {
    return this.httpClient.get(url, { responseType: 'blob' });
  }

  /**
   * Lists files associated with a user's email.
   * This method sends a request to the backend with the user's email as a query parameter.
   *
   * @param email - The email of the user whose files are to be listed.
   * @returns An {@link Observable} of type {@link FileListResponse} containing the list of files.
   */
  listFiles(email: string): Observable<FileListResponse> {
    const params = new HttpParams().set('email', email);
    return this.httpClient.get<FileListResponse>('/api/files/list', { params });
  }

  /**
   * Retrieves file metadata by its token.
   * This method sends a request to the backend with the file token as a query parameter.
   *
   * @param fileToken - The unique token identifying the file.
   * @returns An {@link Observable} of type `Object` containing the file metadata.
   */
  getFileInfo(fileToken: string): Observable<Object> {
    const params = new HttpParams().set('fileToken', fileToken);
    return this.httpClient.get<FileListResponse>('/api/files/info', { params });
  }

  /**
   * Deletes a file from the server.
   * This method sends a request to the backend to delete the file associated with the provided ID.
   *
   * @param fileId - The unique ID of the file to delete.
   * @returns An {@link Observable} of type `Object` representing the deletion response.
   */
  deleteFile(fileId: number): Observable<Object> {
    return this.httpClient.delete(`/api/files/delete/${fileId}`);
  }

}
