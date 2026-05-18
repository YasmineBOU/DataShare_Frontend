import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { AuthService } from '../../core/service/auth.service';
import { Router } from '@angular/router';
import { FileInfo } from '../../core/models/file-info.model';
import { CommonModule } from '@angular/common';
import { formatFileSize, getExpirationDaysMessage, getIconByExtension } from '../../core/utils/file-utils';
import { isBrowser, isMobileDevice } from '../../core/utils/common-utils';
import { LoadingService } from '../../core/service/loading';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-file-listing',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinner
  ],
  templateUrl: './file-listing.html',
})

export class FileListing implements OnInit {
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Local display state for the Material table.
  userFiles: FileInfo[] = [];
  filteredFiles: FileInfo[] = [];
  activeFilter: string = 'active'; // available filters: 'all', 'active', 'expired'
  isMobile!: boolean;
  message: string | null = null;
  messageType: string = 'info';
  private messageTimeout: any = null;
  // Track which file's menu is open (store file id) to keep menus per-file
  menuOpen: number | null = null;
  // Expose loading state to template for spinner display
  isLoading$ = this.loadingService.isLoading$;

  showMessage(text: string, type: 'success' | 'error' | 'info' = 'info', durationMs: number = 10000) {
    this.message = text;
    this.messageType = type;
    this.cdr.detectChanges();

    // Clear previous timeout if present so repeated messages reset the timer
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }

    this.messageTimeout = setTimeout(() => {
      this.message = null;
      this.cdr.detectChanges();
      this.messageTimeout = null;
    }, durationMs);
  }

  ngOnInit(): void {
    if (!isBrowser()) {
      return;
    }
    this.isMobile = isMobileDevice(window.innerWidth);
    console.log("isMobileDevice:", this.isMobile, "window.innerWidth:", window.innerWidth);

    // Use the current user state from AuthService (loaded once at app startup)
    // instead of calling loadCurrentUser again
    const response = { authenticated: this.authService.isAuthenticated(), email: this.authService.currentEmail };
    
    if (!response.authenticated || !response.email) {
      this.showMessage('User email not found. Please log in again.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    const email = response.email;
    this.fileService.listFiles(email).subscribe({
      next: (fileResponse) => {
        const files = fileResponse.files ?? [];
        queueMicrotask(() => {
          // Add UI-only computed fields without changing the backend model.
          this.userFiles = files.map(file => {
            // Format file size for display
            file.fileSize = formatFileSize(Number(file.fileSize));
            const isExpired = new Date(file.expirationDate) < new Date();
            // Determine file icon based on extension
            let fileIconUrl = getIconByExtension(file.filename);
            // 
            let expirationMsg = '';
            if (isExpired) {
              expirationMsg = 'Ce fichier a expiré, il n\'est plus stocké chez nous';
            } else {
              expirationMsg = `Expire ${getExpirationDaysMessage(file.expirationDate)[0]}`;
            }
            return { ...file, isExpired, expirationMsg, fileIconUrl };
          });

          this.filterFiles(this.activeFilter); // Apply initial filter to populate filteredFiles
          this.cdr.detectChanges();
        });
      },
      error: err => {
        console.error('Error fetching files:', err);
        this.showMessage('An error occurred while fetching files.', 'error');
      }
    });
  }

  filterFiles(filter: string): void {
    this.activeFilter = filter;
    switch (filter) {
      case 'expired':
        this.filteredFiles = this.userFiles.filter(f => new Date(f.expirationDate) < new Date());
        break;
      case 'active':
        this.filteredFiles = this.userFiles.filter(f => new Date(f.expirationDate) >= new Date());
        break;
      default:
        this.filteredFiles = [...this.userFiles];
        break;
    }
  }

  onDeleteFile(file: FileInfo): void {
    const confirmed = confirm(`Are you sure you want to delete the file "${file.filename}"?`);
    if (!confirmed) return;

    this.fileService.deleteFile(file.id).subscribe({
      next: () => {
        this.userFiles = this.userFiles.filter(f => f.id !== file.id);
        this.filteredFiles = this.filteredFiles.filter(f => f.id !== file.id);
        this.cdr.detectChanges();
        this.showMessage(`File "${file.filename}" deleted successfully.`, 'success');
      },
      error: err => {
        console.error('Error deleting file:', err);
        this.showMessage(`Error deleting file "${file.filename}".`, 'error');
      }
    });
  }

  onViewFile(file: FileInfo): void {
    console.log('Viewing file:', file.id, file.fileToken);
    this.router.navigate(
      ['/files/download'], 
      { 
        queryParams: { fileToken: file.fileToken } 
      }
    );
  }

  closeMessage() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.message = null;
    this.cdr.detectChanges();
  }


  @HostListener('document:click', ['$event'])
  closeMenuWhenClickingOutside(event: MouseEvent): void {
    if (this.menuOpen === null) {
      return;
    }

    this.menuOpen = null;
    this.cdr.detectChanges();
  }

  toggleMenu(fileId?: string | number | null) {
    const id = fileId == null ? null : Number(fileId);
    this.menuOpen = this.menuOpen === id ? null : id;
    this.cdr.detectChanges();
  }

}
