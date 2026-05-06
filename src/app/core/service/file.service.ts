import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { FileUploadModel } from '../models/file-upload.model';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private httpClient: HttpClient) { }

  uploadFile(fileUploadData: FileUploadModel): Observable<Object> {
    console.log("File upload data:", fileUploadData);
    return this.httpClient.post('/api/upload', fileUploadData);
  }
  
}
