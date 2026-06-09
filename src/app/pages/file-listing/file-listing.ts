/**
 * Component responsible for listing and managing files uploaded by the authenticated user.
 * This component fetches files from the backend, applies filters, and provides actions for viewing and deleting files.
 * It also handles responsive behavior for mobile and desktop devices.
 *
 * @see FileService
 * @see AuthService
 * @see LoadingService
 * @see FileInfo
 * @see formatFileSize
 * @see getExpirationDaysMessage
 * @see getIconByExtension
 * @see isBrowser
 * @see isMobileDevice
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { FileInfo } from '../../core/models/file-info.model';
import { AuthService } from '../../core/service/auth.service';
import { FileService } from '../../core/service/file.service';
import { LoadingService } from '../../core/service/loading';
import { isBrowser, isMobileDevice } from '../../core/utils/common-utils';
import { formatFileSize, getExpirationDaysMessage, getIconByExtension } from '../../core/utils/file-utils';
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
  /**
   * The FileService used to interact with the backend API for file operations.
   */
  private fileService = inject(FileService);
  
  /**
   * The AuthService used to access authentication state and user email.
   */
  private authService = inject(AuthService);
  
  /**
   * The LoadingService used to track loading state and display a spinner.
   */
  private loadingService = inject(LoadingService);
  
  /**
   * The Router service used for navigation.
   */
  private router = inject(Router);
  
  /**
   * The ChangeDetectorRef service used to detect changes in the component.
   */
  private cdr = inject(ChangeDetectorRef);

  /**
   * List of all files uploaded by the user.
   */
  userFiles: FileInfo[] = [];
  
  /**
   * List of files filtered based on the active filter ('all', 'active', or 'expired').
   */
  filteredFiles: FileInfo[] = [];
 
  /**
   * The active filter applied to the file list ('all', 'active', or 'expired').
   */
  activeFilter: string = 'active'; // available filters: 'all', 'active', 'expired'
  
  /**
   * Flag indicating if the device is mobile.
   */
  isMobile!: boolean;

  /**
   * Message to display in the UI (e.g., success, error, or info messages).
   */
  message: string | null = null;
  
  /**
   * Type of the message ('success', 'error', or 'info').
   */
  messageType: string = 'info';
  
  /**
   * Timeout for automatically clearing the message after a delay.
   */
  private messageTimeout: any = null;
  
  /**
   * ID of the file whose menu is currently open. Used to track which file's menu is expanded.
   */
  menuOpen: number | null = null;
  
  /**
   * Observable that emits the current loading state for the spinner display.
   */
  isLoading$ = this.loadingService.isLoading$;

  /**
   * Displays a message in the UI with an optional type and duration.
   * The message is automatically cleared after the specified duration.
   *
   * @param text - The message text to display.
   * @param type - The type of message ('success', 'error', or 'info'). Default is 'info'.
   * @param durationMs - The duration in milliseconds before the message is automatically cleared. Default is 10000ms (10 seconds).
   */
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

  /**
   * Initializes the component and fetches files uploaded by the authenticated user.
   * Validates the user's authentication state and redirects to login if not authenticated.
   */
  ngOnInit(): void {
    if (!isBrowser()) {
      return;
    }
    this.isMobile = isMobileDevice(window.innerWidth);

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

  /**
   * Filters the list of files based on the specified filter ('all', 'active', or 'expired').
   *
   * @param filter - The filter to apply ('all', 'active', or 'expired').
   */
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

  /**
   * Deletes a file after confirming the action with the user.
   * Updates the file list and shows a success or error message.
   *
   * @param file - The file to delete.
   */
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

  /**
   * Navigates to the file download page for the specified file.
   *
   * @param file - The file to view/download.
   */
  onViewFile(file: FileInfo): void {
    this.router.navigate(
      ['/files/download'], 
      { 
        queryParams: { fileToken: file.fileToken } 
      }
    );
  }

  /**
   * Clears the currently displayed message manually.
   */
  closeMessage() {
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
      this.messageTimeout = null;
    }
    this.message = null;
    this.cdr.detectChanges();
  }


  /**
   * Host listener that closes the file menu when clicking outside of it.
   *
   * @param event - The mouse event triggered by the click.
   */
  @HostListener('document:click', ['$event'])
  closeMenuWhenClickingOutside(event: MouseEvent): void {
    if (this.menuOpen === null) {
      return;
    }

    this.menuOpen = null;
    this.cdr.detectChanges();
  }

  /**
   * Toggles the file menu open or closed.
   *
   * @param fileId - The ID of the file whose menu is to be toggled.
   */
  toggleMenu(fileId?: string | number | null) {
    const id = fileId == null ? null : Number(fileId);
    this.menuOpen = this.menuOpen === id ? null : id;
    this.cdr.detectChanges();
  }

}
