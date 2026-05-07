import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private httpClient: HttpClient) { }

  uploadFile(fileUploadFormData: FormData): Observable<Object> {
    console.log("File upload data:", fileUploadFormData);
    return this.httpClient.post('/api/files/upload', fileUploadFormData);
  }
  
}
