import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileListing } from './file-listing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FileInfo } from '../../core/models/file-info.model';

describe('FileListing', () => {
  let component: FileListing;
  let fixture: ComponentFixture<FileListing>;

  const mockFiles: FileInfo[] = [
    {
      id: 1,
      filename: 'file1.txt',
      fileSize: '1024',
      fileToken: 'token1',
      createdAt: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 86400000).toISOString(),
      hasPassword: false,
      isExpired: false
    },
    {
      id: 2,
      filename: 'file2.txt',
      fileSize: '2048',
      fileToken: 'token2',
      createdAt: new Date().toISOString(),
      expirationDate: new Date(Date.now() - 86400000).toISOString(),
      hasPassword: true,
      isExpired: true
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileListing],
      providers: [provideRouter([])],
    }).compileComponents();

    // Mock the alert function
    global.alert = jest.fn();

    fixture = TestBed.createComponent(FileListing);
    component = fixture.componentInstance;

    // Mock AuthService
    jest.spyOn(component['authService'], 'isAuthenticated').mockReturnValue(true);
    Object.defineProperty(component['authService'], 'currentEmail', { value: 'test@example.com', configurable: true });

    jest.spyOn(component['authService'], 'loadCurrentUser').mockReturnValue(of({ email: 'test@example.com', authenticated: true }));
    

    // Mock FileService
    jest.spyOn(component['fileService'], 'listFiles').mockReturnValue(of({ files: mockFiles, message: 'Files fetched successfully' }));

    // Mock Router
    jest.spyOn(component['router'], 'navigate').mockResolvedValue(true);

    await fixture.whenStable();
    await new Promise(resolve => queueMicrotask(resolve as () => void));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('showMessage', () => {
    it('should set message and type, and clear after duration', () => {
      jest.useFakeTimers();
      const timeDelay = 5000;
      
      component.showMessage('Test message', 'success', timeDelay);

      expect(component.message).toBe('Test message');
      expect(component.messageType).toBe('success');

      jest.advanceTimersByTime(timeDelay);
      expect(component.message).toBeNull();
      jest.useRealTimers();
    });

    it('should not clear message and type when duration is under the threshold fixed', () => {
      jest.useFakeTimers();
      const timeDelay = 5000;
      
      component.showMessage('Test message', 'success', timeDelay);

      expect(component.message).toBe('Test message');
      expect(component.messageType).toBe('success');

      jest.advanceTimersByTime(timeDelay - 1000);
      expect(component.message).toBe('Test message');
      expect(component.messageType).toBe('success');
      jest.useRealTimers();
    });
  });

  describe('ngOnInit', () => {

    afterEach(() => {
      Object.defineProperty(component['authService'], 'currentEmail', { 
        value: 'test@example.com', 
        configurable: true 
      });
    });
  
    it('should check authentication and navigate to login if not authenticated', () => {
      Object.defineProperty(component['authService'], 'currentEmail', { value: null, configurable: true });
      jest.spyOn(component['authService'], 'isAuthenticated').mockReturnValue(false);
      jest.spyOn(component['authService'], 'loadCurrentUser').mockReturnValue(of({ email: null, authenticated: false }));

      component.ngOnInit();

      expect(component['router'].navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should load files if authenticated and "filteredFiles" is set', () => {
      // ngOnInit is already called in beforeEach, so we just check the results

      expect(component.userFiles).toHaveLength(mockFiles.length);

      // By default, active filter is applied, so only the non-expired file should be in filteredFiles
      expect(component.filteredFiles).toHaveLength(1);
      expect(component.filteredFiles[0].filename).toBe(mockFiles[0].filename);
      // Set the active filter to 'all' to include all files in filteredFiles
      component.filterFiles('all');
      expect(component.filteredFiles).toHaveLength(mockFiles.length);
      expect(component.filteredFiles[0].filename).toBe(mockFiles[0].filename);
      expect(component.filteredFiles[1].filename).toBe(mockFiles[1].filename);

      // Set the active filter to 'expired' to include only expired files in filteredFiles
      component.filterFiles('expired');
      expect(component.filteredFiles).toHaveLength(1);
      expect(component.filteredFiles[0].filename).toBe(mockFiles[1].filename);
    });

    it('should show error message if fileService.listFiles returns an error', () => {
      jest.spyOn(component['fileService'], 'listFiles').mockReturnValue(throwError(() => ({ status: 500 })));
      const showMessageSpy = jest.spyOn(component, 'showMessage');

      component.ngOnInit();

      expect(showMessageSpy).toHaveBeenCalledWith('An error occurred while fetching files.', 'error');    
    });
  });

  describe('filterFiles', () => {
    it('should filter files based on the selected filter', () => {
      component.userFiles = mockFiles;

      component.filterFiles('active');
      expect(component.filteredFiles).toHaveLength(1);
      expect(component.filteredFiles[0].filename).toBe(mockFiles[0].filename);

      component.filterFiles('expired');
      expect(component.filteredFiles).toHaveLength(1);
      expect(component.filteredFiles[0].filename).toBe(mockFiles[1].filename);

      component.filterFiles('all');
      expect(component.filteredFiles).toHaveLength(mockFiles.length);
    });
  });

  describe('onDeleteFile', () => {
    let showMessage: jest.SpyInstance;
    const fileToDelete = mockFiles[0];

    
    beforeEach(() => {
      showMessage = jest.spyOn(component, 'showMessage');
    });

    it('should confirm deletion and call fileService.deleteFile if confirmed', () => {
      const confirmSpy = jest.spyOn(global, 'confirm').mockReturnValue(true);
      const deleteFileSpy = jest.spyOn(component['fileService'], 'deleteFile').mockReturnValue(of({}));
      // set filter to 'active' to have the file in filteredFiles
      component.filterFiles('all');

      component.onDeleteFile(fileToDelete);

      expect(confirmSpy).toHaveBeenCalledWith(`Are you sure you want to delete the file "${fileToDelete.filename}"?`);
      expect(deleteFileSpy).toHaveBeenCalledWith(fileToDelete.id);
      expect(component.userFiles).toHaveLength(1);
      expect(component.filteredFiles).toHaveLength(1);
      expect(showMessage).toHaveBeenCalledWith(`File "${fileToDelete.filename}" deleted successfully.`, 'success');
    });

    it('should not call fileService.deleteFile if deletion is not confirmed', () => {
      const confirmSpy = jest.spyOn(global, 'confirm').mockReturnValue(false);
      const deleteFileSpy = jest.spyOn(component['fileService'], 'deleteFile');
      // set filter to 'active' to have the file in filteredFiles
      component.filterFiles('all');

      component.onDeleteFile(fileToDelete);

      expect(confirmSpy).toHaveBeenCalledWith(`Are you sure you want to delete the file "${fileToDelete.filename}"?`);
      expect(deleteFileSpy).not.toHaveBeenCalled();
      expect(component.userFiles).toHaveLength(mockFiles.length);
    });

    it('should show error message if fileService.deleteFile returns an error', () => {
      jest.spyOn(global, 'confirm').mockReturnValue(true);
      jest.spyOn(component['fileService'], 'deleteFile').mockReturnValue(throwError(() => ({ status: 500 })));

      component.onDeleteFile(fileToDelete);

      expect(component.userFiles).toHaveLength(mockFiles.length);
      expect(showMessage).toHaveBeenCalledWith(`Error deleting file "${fileToDelete.filename}".`, 'error');
     });
   });

  describe('onViewFile', () => {
    it('should navigate to file download page with file token as query parameter', () => {
      const fileToView = mockFiles[0];

      component.onViewFile(fileToView);

      expect(component['router'].navigate).toHaveBeenCalledWith(
        ['/files/download'], 
        { queryParams: { fileToken: fileToView.fileToken } }
      );
    }); 
  }); 

  describe('closeMessage', () => {
    it('should clear message and messageType', () => {
      component.message = 'Test message';
      component.messageType = 'success';
      const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

      component.closeMessage();

      expect(component.message).toBeNull();
      expect(detectChangesSpy).toHaveBeenCalled();
    });
  });

  describe('closeMenuWhenClickingOutside', () => {
    it('should close menu when clicking outside', () => {
      component.menuOpen = 1; // Simulate menu open
      const event = new MouseEvent('click', { bubbles: true });
      const target = document.createElement('div'); // Simulate click outside
      Object.defineProperty(event, 'target', { value: target });

      component.closeMenuWhenClickingOutside(event);

      expect(component.menuOpen).toBeNull();
    });
  });

  describe('toggleMenu', () => {
    it('should toggle menu open and close', () => {
      component.toggleMenu(1);
      expect(component.menuOpen).toBe(1);

      component.toggleMenu(1);
      expect(component.menuOpen).toBeNull();
    });

    it('should open menu for different file id', () => {
      component.toggleMenu(1);
      expect(component.menuOpen).toBe(1);

      component.toggleMenu(2);
      expect(component.menuOpen).toBe(2);
    });  
  });
});
