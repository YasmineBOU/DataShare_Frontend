import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(private httpClient: HttpClient) { }

  uploadFile(file: File, md5: string): Observable<Object> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('md5', md5);
    console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
    console.log(`MD5 hash: '${md5}'`);
    return this.httpClient.post('/api/upload', formData);
  }
  
}
