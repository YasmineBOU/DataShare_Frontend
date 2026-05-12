import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { AuthService } from '../../core/service/auth.service';
import { Router } from '@angular/router';
import { FileInfo } from '../../core/models/file-info.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-file-listing',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
  ],
  templateUrl: './file-listing.html',
  styleUrls: ['./file-listing.scss'],
})

export class FileListing implements OnInit {
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  // Local display state for the Material table.
  userFiles: FileInfo[] = [];
  filteredFiles: FileInfo[] = [];

  // Columns shown in the Material table.
  displayedColumns: string[] = ['filename', 'expirationDate', 'status', 'actions'];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Load the current authenticated user from the backend via HttpOnly cookie
    this.authService.loadCurrentUser().subscribe({
      next: (response) => {
        if (!response.authenticated || !response.email) {
          this.snackBar.open('User email not found. Please log in again.', 'Close', { duration: 3000 });
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
                const isExpired = new Date(file.expirationDate) < new Date();
                let expireMessage = '';
                if (isExpired) {
                  expireMessage = 'Expiré';
                } else {
                  const now = new Date();
                  const timeDiff = new Date(file.expirationDate).getTime() - now.getTime();
                  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  switch (daysLeft) {
                    case 0:
                      expireMessage = 'Expire aujourd\'hui';
                      break;
                    case 1:
                      expireMessage = 'Expire demain';
                      break;
                    default:
                      expireMessage = `Expire dans ${daysLeft} jour(s)`;
                      break;
                  }
                }
                return { ...file, isExpired, expireMessage };
              });

              // Initialize the table without any filter.
              this.filteredFiles = [...this.userFiles];
              this.cdr.detectChanges();
            });
          },
          error: err => {
            console.error('Error fetching files:', err);
            this.snackBar.open('An error occurred while fetching files.', 'Close', { duration: 3000 });
          }
        });
      },
      error: (err) => {
        console.error('Error loading current user:', err);
        this.snackBar.open('User email not found. Please log in again.', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      }
    });
  }

  filterFiles(filter: string): void {
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
        this.snackBar.open(`File "${file.filename}" deleted successfully.`, 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error deleting file:', err);
        this.snackBar.open(`Error deleting file "${file.filename}".`, 'Close', { duration: 3000 });
      }
    });
  }

  onViewFile(file: FileInfo): void {
    this.router.navigate(['/files', file.id]);
  }
}
