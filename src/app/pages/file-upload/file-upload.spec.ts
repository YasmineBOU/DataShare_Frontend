import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileUpload } from './file-upload';
import { of } from 'rxjs';
import { computeFileChecksum } from '../../core/utils/file-utils';
import { FILE_CONFIG } from '../../core/config/config';

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

      it('should refuse file larger than max size', () => {
        Object.defineProperty(
          mockFile, 'size', { value: FILE_CONFIG.MAX_FILE_SIZE + 1 });

        const mockEvent = {
          target: {
            files: [mockFile]
          }
        } as unknown as Event;

        component.onFileSelected(mockEvent);
        
        expect(component.selectedFile).toBeNull();
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Le fichier est trop volumineux. Veuillez choisir un fichier de moins de '));
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

  //  describe('getFileFormData', () => {
  //     it('should return FormData with file and form values', () => {
  //       const mockFile = new File(['file content'], 'test.txt', { type: 'text/plain' });
  //       component.selectedFile = mockFile;
  //       component.fileUploadForm = new FormGroup({
  //         password: new FormBuilder().control('testpassword'),
  //         expiration: new FormBuilder().control(7)
  //       });
  //       const formData = component.getFileFormData();
  //       expect(formData.get('file')).toBe(mockFile);
  //       expect(formData.get('password')).toBe('testpassword');
  //       expect(formData.get('expiration')).toBe('7');
  //     });
  //  });  

  describe('getDownloadURL', () => {
    it('should return download URL for given file token', () => {
      const fileToken = 'hdyYnb-65645';
      const expectedURL = `${window.location.origin}/files/download?fileToken=${fileToken}`;
      const downloadURL = component.getDownloadURL(fileToken);
      expect(downloadURL).toBe(expectedURL);
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

});
