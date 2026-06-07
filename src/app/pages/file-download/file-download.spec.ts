import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileDownload } from './file-download';
import { provideRouter } from '@angular/router';
import { FileInfo } from '../../core/models/file-info.model';
import { of, throwError } from 'rxjs';

describe('FileDownload', () => {
  let component: FileDownload;
  let fixture: ComponentFixture<FileDownload>;

  const mockFileToken = 'test-token';
  
  const mockFileInfo: FileInfo = {
    id: 1,
    filename: 'test.txt',
    fileSize: '1KB',
    fileToken: mockFileToken,
    createdAt: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 86400000).toISOString(),
    hasPassword: false,
    isExpired: false
  };

  let routerNavigateSpy: jest.SpyInstance; 
  let getFileInfoSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileDownload],
      providers: [provideRouter([])],
    }).compileComponents();

    // Spy on the alert function
    global.alert = jest.fn();
    fixture = TestBed.createComponent(FileDownload);
    component = fixture.componentInstance;

    // Mock the route and fileService dependencies
    jest.spyOn(component['route'].snapshot.queryParamMap, 'get').mockReturnValue(mockFileToken);
    getFileInfoSpy = jest.spyOn(component['fileService'], 'getFileInfo').mockReturnValue(of(mockFileInfo));
    routerNavigateSpy = jest.spyOn(component['router'], 'navigateByUrl').mockResolvedValue(true);

    await fixture.whenStable();
    await new Promise(resolve => queueMicrotask(resolve as () => void));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {

    it('should initialize file token from route parameters', () => {
      expect(component.fileToken).toBe(mockFileToken);
    });

    it('should navigate to home if no file token is provided', () => {
      jest.spyOn(component['route'].snapshot.queryParamMap, 'get').mockReturnValue(null);
      const routerNavigateSpy = jest.spyOn(component['router'], 'navigateByUrl');
      component.ngOnInit();
      expect(routerNavigateSpy).toHaveBeenCalledWith('/');
    });

    it('should navigate to home if getFileInfo fails', async () => {
      jest.spyOn(component['fileService'], 'getFileInfo').mockReturnValue(throwError(() => ({ status: 500 })));

      component.ngOnInit();
      await new Promise(resolve => queueMicrotask(resolve as () => void));

      expect(routerNavigateSpy).toHaveBeenCalledWith('/');
    });

    it('should call fileService.getFileInfo with file token', async () => {

      expect(getFileInfoSpy).toHaveBeenCalledTimes(1);
      expect(getFileInfoSpy).toHaveBeenCalledWith(mockFileToken);
    });

    it('should set file info and process file on successful getFileInfo', async () => {
      const processFileSpy = jest.spyOn(component, 'processFile');

      component.ngOnInit();
      await new Promise(resolve => queueMicrotask(resolve as () => void));

      expect(component.file).toEqual(mockFileInfo);
      expect(processFileSpy).toHaveBeenCalled();
    });
  });

  describe('processFile', () => {

    it('should set "fileId" from file', () => {
      component.processFile();
      
      expect(component.fileId).toBe(mockFileInfo.id);
    });

    it('should set expMsgType to "safe" for non-expired file', () => {
      component.file = { 
        ...mockFileInfo,
        isExpired: false,
        expirationDate: new Date(Date.now() + 86400000).toISOString() // date future
      };
      component.processFile();
      
      expect(component.expMsgType).toBe('safe');
    });

    it('should set expMsgType to "overdue" for expired file', () => {
      component.file = { 
        ...mockFileInfo,
        isExpired: false,
        expirationDate: new Date(Date.now() - 86400000).toISOString() // date past
      };
      
      component.processFile();
      
      expect(component.expMsgType).toBe('overdue');
    });
  });

   describe('onDownload', () => {

    it('should not proceed with download if no password form is available', () => {
      component.fileDownloadForm = null;
      component.file = { ...mockFileInfo, hasPassword: true, isExpired: false };
      const downloadFileSpy = jest.spyOn(component, 'downloadFile');

      component.onDownload();

      expect(downloadFileSpy).not.toHaveBeenCalled();
    });

    it('should not proceed with download if password is required but not provided', () => {
      component.fileDownloadForm = component['formBuilder'].group({
        password: ['']
      });
      component.file = { ...mockFileInfo, hasPassword: true, isExpired: false };
      const downloadFileSpy = jest.spyOn(component, 'downloadFile');

      component.onDownload();

      expect(downloadFileSpy).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('Ce fichier est protégé par un mot de passe. Veuillez le saisir pour pouvoir le télécharger.');
    });

    it('should call downloadFile if file link is available', () => {
      const fileLink = 'http://example.com/file';
      const downloadFileSpy = jest.spyOn(component, 'downloadFile');
      jest.spyOn(component['fileService'], 'getFileLink').mockReturnValue(of({fileLink: fileLink}));

      component.onDownload();

      expect(downloadFileSpy).toHaveBeenCalled();
      expect(component.fileLink).toBe(fileLink);
    });

    describe('onDownload error handling', () => {

      const errorCases = [
        { status: 401, expectedMessage: 'Mot de passe incorrect. Veuillez réessayer.' },
        { status: 404, expectedMessage: 'Le fichier n\'a pas été trouvé.' },
        { status: 410, expectedMessage: 'Le fichier a expiré.' },
        { status: 500, expectedMessage: 'Une erreur est survenue lors du téléchargement du fichier. Veuillez réessayer plus tard.' }
      ];

      it.each(errorCases)('should alert user with specific message for error %o', (error) => {
        jest.spyOn(component['fileService'], 'getFileLink').mockReturnValue(throwError(() => ({ status: error.status })));

        component.onDownload();

        expect(global.alert).toHaveBeenCalledWith(error.expectedMessage);
      });
    });
  });

  describe('downloadFile', () => {  
    const mockUrl = 'http://example.com/file';

    it('should alert user if file link is not available', () => {
      component.fileLink = '';
      
      component.downloadFile();
      expect(global.alert).toHaveBeenCalledWith('Le lien de téléchargement n\'est pas disponible pour ce fichier.');
    });

    it('should call fileService.downloadFile with correct URL', () => {
      component.fileLink = mockUrl;
      const downloadFileSpy = jest.spyOn(component['fileService'], 'downloadFile').mockReturnValue(of(new Blob()));
      
      component.downloadFile();

      expect(downloadFileSpy).toHaveBeenCalledWith(mockUrl);
    });

    it('should alert user if fileService.downloadFile returns an error', () => {
      component.fileLink = mockUrl;
      jest.spyOn(component['fileService'], 'downloadFile').mockReturnValue(throwError(() => ({ status: 500 })));
      
      component.downloadFile();

      expect(global.alert).toHaveBeenCalledWith('Une erreur est survenue lors du téléchargement du fichier.');
    });

    it('should download file if fileService.downloadFile is successful', () => {
      component.fileLink = mockUrl;
      const mockBlob = new Blob(['file content'], { type: 'text/plain' });
      global.URL.createObjectURL = jest.fn();
      global.URL.revokeObjectURL = jest.fn();
      jest.useFakeTimers();

      jest.spyOn(component['fileService'], 'downloadFile').mockReturnValue(of(mockBlob));
      const createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue(`blob:${mockUrl}/file`);
      const revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL');
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');

      component.downloadFile();
      jest.advanceTimersByTime(1000);
      
      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith(`blob:${mockUrl}/file`);

      jest.useRealTimers();
    });
  });
});
