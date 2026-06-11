import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { FileService, FileListResponse } from './file.service';
import { FileInfo } from '../models/file-info.model';
import { FileDownloadInfo } from '../models/file-download.model';

describe('FileService', () => {
  let service: FileService;
  let httpMock: HttpTestingController;

  // ─── Fixtures ──────────────────────────────────────────────────────────────

  const mockFileInfo: FileInfo = {
    id: 1,
    filename: 'test-file.pdf',
    fileSize: '1.5 MB',
    fileToken: 'abc123token',
    createdAt: '2026-01-01T00:00:00',
    expirationDate: '2026-12-31T00:00:00',
    hasPassword: false,
  };

  const mockFileListResponse: FileListResponse = {
    message: 'Files retrieved successfully',
    files: [mockFileInfo],
  };

  const mockFileDownloadInfo: FileDownloadInfo = {
    id: 1,
    filePassword: 'secret',
  };

  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service  = TestBed.inject(FileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('uploadFile', () => {
    it('should POST to /api/files/upload with the provided FormData', () => {
      const formData = new FormData();
      formData.append('file', new Blob(['content']), 'test.pdf');
      const mockResponse = { success: true };

      service.uploadFile(formData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/files/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });

    it('should return the server response as an Observable', () => {
      const formData = new FormData();
      const mockResponse = { fileId: 42, message: 'Upload successful' };

      service.uploadFile(formData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      httpMock.expectOne('/api/files/upload').flush(mockResponse);
    });
  });

  describe('getFileLink', () => {
    it('should POST to /api/files/download with the provided FileDownloadInfo', () => {
      const mockLinkResponse = { link: 'https://storage.example.com/file.pdf' };

      service.getFileLink(mockFileDownloadInfo).subscribe(response => {
        expect(response).toEqual(mockLinkResponse);
      });

      const req = httpMock.expectOne('/api/files/download');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockFileDownloadInfo);
      req.flush(mockLinkResponse);
    });

    it('should work when filePassword is empty', () => {
      const downloadInfoNoPassword: FileDownloadInfo = { id: 1, filePassword: '' };

      service.getFileLink(downloadInfoNoPassword).subscribe();

      const req = httpMock.expectOne('/api/files/download');
      expect(req.request.body).toEqual(downloadInfoNoPassword);
      req.flush({});
    });
  });

  describe('downloadFile', () => {
    it('should GET the file as a Blob from the provided URL', () => {
      const url = 'https://storage.example.com/file.pdf';
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });

      service.downloadFile(url).subscribe(blob => {
        expect(blob).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should pass the exact URL to the HTTP request', () => {
      const url = 'https://storage.example.com/subfolder/file.zip';

      service.downloadFile(url).subscribe();

      const req = httpMock.expectOne(url);
      expect(req.request.url).toBe(url);
      req.flush(new Blob());
    });
  });

  describe('listFiles', () => {
    it('should GET /api/files/list with email as query param', () => {
      const email = 'user@example.com';

      service.listFiles(email).subscribe(response => {
        expect(response).toEqual(mockFileListResponse);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/api/files/list' && r.params.get('email') === email
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockFileListResponse);
    });

    it('should return the files array in the response', () => {
      service.listFiles('user@example.com').subscribe(response => {
        expect(response.files).toHaveLength(1);
        expect(response.files[0]).toEqual(mockFileInfo);
      });

      httpMock.expectOne(r => r.url === '/api/files/list').flush(mockFileListResponse);
    });

    it('should return an empty files array when no files exist', () => {
      service.listFiles('empty@example.com').subscribe(response => {
        expect(response.files).toHaveLength(0);
      });

      httpMock
        .expectOne(r => r.url === '/api/files/list')
        .flush({ message: 'No files found', files: [] });
    });
  });

  describe('getFileInfo', () => {
    it('should GET /api/files/info with fileToken as query param', () => {
      const fileToken = 'abc123token';

      service.getFileInfo(fileToken).subscribe(response => {
        expect(response).toEqual(mockFileInfo);
      });

      const req = httpMock.expectOne(r =>
        r.url === '/api/files/info' && r.params.get('fileToken') === fileToken
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockFileInfo);
    });

    it('should pass the exact fileToken in query params', () => {
      const fileToken = 'unique-token-xyz';

      service.getFileInfo(fileToken).subscribe();

      const req = httpMock.expectOne(r => r.url === '/api/files/info');
      expect(req.request.params.get('fileToken')).toBe(fileToken);
      req.flush({});
    });
  });

  describe('deleteFile', () => {
    it('should DELETE /api/files/delete/:id with the correct file ID', () => {
      const fileId = 42;

      service.deleteFile(fileId).subscribe(response => {
        expect(response).toEqual({ message: 'File deleted' });
      });

      const req = httpMock.expectOne(`/api/files/delete/${fileId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ message: 'File deleted' });
    });

    it('should build the correct URL for different file IDs', () => {
      service.deleteFile(1).subscribe();
      httpMock.expectOne('/api/files/delete/1').flush({});

      service.deleteFile(999).subscribe();
      httpMock.expectOne('/api/files/delete/999').flush({});
    });
  });
});