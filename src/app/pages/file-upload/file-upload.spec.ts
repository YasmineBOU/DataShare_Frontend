import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUpload } from './file-upload';
import { of, throwError } from 'rxjs';
import { computeFileChecksum } from '../../core/utils/file-utils';
import { FILE_CONFIG } from '../../core/config/config';
import { FormBuilder, FormGroup } from '@angular/forms';

describe('FileUpload', () => {
  let component: FileUpload;
  let fixture: ComponentFixture<FileUpload>;
  const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileUpload],
    }).compileComponents();


    // Spy on the alert function
    global.alert = jest.fn();

    fixture = TestBed.createComponent(FileUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form and expiration options', () => {
      component.ngOnInit();
      expect(component.fileUploadForm).toBeDefined();
      expect(component.expirationOptions).toBeInstanceOf(Map);
      expect(component.expirationOptions.size).toBeGreaterThan(1);
    });
    
    it('should set current user email from AuthService', () => {
      const mockEmail = 'johndoe@example.com';  
      let authServiceLoadCurrentUserSpy = jest.spyOn(component['authService'], 'loadCurrentUser').mockReturnValue(of({ authenticated: true, email: mockEmail }));

      component.ngOnInit();
      expect(authServiceLoadCurrentUserSpy).toHaveBeenCalled();
      expect(component.currentUserEmail).toBe(mockEmail);
    });

    it('should handle error when loading current user email', () => {
      let authServiceLoadCurrentUserSpy = jest.spyOn(component['authService'], 'loadCurrentUser').mockReturnValue(of({ authenticated: false, email: '' }));

      component.ngOnInit();
      expect(authServiceLoadCurrentUserSpy).toHaveBeenCalled();
      expect(component.currentUserEmail).toBe('');
    });
   });

   describe('calculateChecksum', () => {
      it('should calculate checksum for selected file', async () => {
        component.selectedFile = mockFile;
        await component.calculateChecksum();
        expect(component.fileChecksum).toBe(await computeFileChecksum(mockFile));
      });
   });

   describe('onFileSelected', () => {
      it('should set selected file and update form', () => {
        const mockEvent = {
          target: {
            files: [mockFile]
          }
        } as unknown as Event;

        component.onFileSelected(mockEvent);
        
        expect(component.selectedFile).toBe(mockFile);
        expect(component.fileUploadForm.get('password')?.value).toBe('');
        expect(component.fileUploadForm.get('expiration')?.value).toBe(component.selectedExpiration);
      });

      it('should refuse file larger than predefined max size', () => {
        const largeFile = new File(['a'], 'largefile.txt', { type: 'text/plain' });
        Object.defineProperty(
          largeFile, 'size', { value: FILE_CONFIG.MAX_FILE_SIZE + 1 });

        const mockEvent = {
          target: {
            files: [largeFile]
          }
        } as unknown as Event;

        component.onFileSelected(mockEvent);
        
        expect(component.selectedFile).toBeNull();
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('Le fichier est trop volumineux. Veuillez choisir un fichier de moins de ')
        );
      });

      it('should refuse file with forbidden extension', () => {
        const forbiddenFile = new File(['file content'], 'test.exe', { type: 'application/x-msdownload' });
        const mockEvent = {
          target: {
            files: [forbiddenFile]
          }
        } as unknown as Event;

        component.onFileSelected(mockEvent);
        
        expect(component.selectedFile).toBeNull();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining(' n\'est pas autorisé. Veuillez choisir un autre fichier.'));
      });
   });

   describe('resetSelectedFile', () => {
      it('should reset selected file and form', () => {
        component.selectedFile = mockFile;
        
        component.resetSelectedFile();
        
        expect(component.selectedFile).toBeNull();
      });
   });

   describe('getFileFormData', () => {
      it.each(['', 'johndoe@example.com'])('should return FormData with file and form values with email: "%s"', (email) => { 
        const mockPassword = 'testpassword';
        const mockExpiration = 7;
        const mockHash = 'mockhash123';
        component.currentUserEmail = email;
        component.fileChecksum = mockHash;

        const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
        component.selectedFile = mockFile;
        component.fileUploadForm = new FormGroup({
          password: new FormBuilder().control(mockPassword),
          expiration: new FormBuilder().control(mockExpiration)
        });

        const formData = component.getFileFormData();

        expect(formData.get('file')).toBe(mockFile);
        expect(formData.get('filename')).toBe(mockFile.name);
        expect(formData.get('fileSize')).toBe(mockFile.size.toString());
        expect(formData.get('fileType')).toBe(mockFile.type);
        expect(formData.get('hash')).toBe(mockHash);
        expect(formData.get('email')).toBe(email);
        expect(formData.get('filePassword')).toBe(mockPassword);
        expect(formData.get('expirationDays')).toBe(mockExpiration.toString());
      });
   });

   describe('onUpload', () => {
      it('should upload file and set download link on success', async () => {
        const mockFileToken = 'hdyYnb-65645';
        const mockResponse = { fileToken: mockFileToken };
        
        jest.spyOn(component, 'calculateChecksum').mockResolvedValue();
        const fileServiceUploadSpy = jest.spyOn(component['fileService'], 'uploadFile').mockReturnValue(of(mockResponse));
        
        component.selectedFile = mockFile;
        component.fileChecksum = 'mockhash123';
        component.fileUploadForm = new FormGroup({
          password: new FormBuilder().control('testpassword'),
          expiration: new FormBuilder().control(7)
        });

        const fileUploadFormResetSpy = jest.spyOn(component.fileUploadForm, 'reset');
        
        await component.onUpload();

        expect(fileServiceUploadSpy).toHaveBeenCalled();
        expect(global.alert).toHaveBeenCalledWith('Fichier uploadé avec succès !');
        expect(component.downloadLink).toBe(component.getDownloadURL(mockFileToken));
        expect(fileUploadFormResetSpy).toHaveBeenCalled(); 
      });

      describe('onUpload error handling', () => {
        const errorCases: [object, string][] = [
          [{ status: 413 }, 'Le fichier est trop volumineux. Vérifiez la limite de taille du serveur.'],
          [{ status: 0 }, 'Erreur réseau détectée. Vérifiez votre connexion et réessayez.'],
          [{ name: 'TimeoutError' }, "L'upload a expiré. Vérifiez votre connexion réseau et réessayez."],
          [{ status: 500 }, "Une erreur est survenue lors de l'upload du fichier."],
        ];

        beforeEach(() => {
          jest.spyOn(component, 'calculateChecksum').mockResolvedValue();
          component.selectedFile = mockFile;
          component.fileUploadForm = new FormGroup({
            password: new FormBuilder().control(''),
            expiration: new FormBuilder().control(7)
          });
        });

        it.each(errorCases)('should show correct message for error %o', async (error, expectedMessage) => {
          jest.spyOn(component['fileService'], 'uploadFile')
            .mockReturnValue(throwError(() => error));

          await component.onUpload();

          expect(global.alert).toHaveBeenCalledWith(expectedMessage);
        });
      });
   });

  describe('copyLinkToClipboard', () => {
    const downloadLink = 'http://example.com/download/hdyYnb-65645';

    beforeEach(() => {
      component.downloadLink = downloadLink;
    });

    it('should copy download link to clipboard', async () => {
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined)
      };
      Object.defineProperty(
        navigator, 
        'clipboard', 
        {
          value: mockClipboard,
          configurable: true
        }
      );
      
      await component.copyLinkToClipboard();

      expect(mockClipboard.writeText).toHaveBeenCalledWith(component.downloadLink);
    });

    it('should handle error when copying link to clipboard', async () => {
      const errorMessage = 'Clipboard error';
      const mockClipboard = {
        writeText: jest.fn().mockRejectedValue(new Error(errorMessage))
      };
      Object.defineProperty(
        navigator, 
        'clipboard', 
        {
          value: mockClipboard,
          configurable: true
        }
      );
      
      await component.copyLinkToClipboard();
      expect(mockClipboard.writeText).toHaveBeenCalledWith(component.downloadLink);
    });
  });  

  describe('getDownloadURL', () => {
    it('should return download URL for given file token', () => {
      const fileToken = 'hdyYnb-65645';
      const expectedURL = `${window.location.origin}/files/download?fileToken=${fileToken}`;
      const downloadURL = component.getDownloadURL(fileToken);
      expect(downloadURL).toBe(expectedURL);
    });
  });

});
