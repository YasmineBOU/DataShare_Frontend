import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileInfo } from '../../core/models/file-info.model';
import { FileService } from '../../core/service/file.service';
import { formatFileSize, getExpirationDaysMessage, getIconByExtension, getIconByStatus } from '../../core/utils/file-utils';
import { DOWNLOAD_CONFIG } from '../../core/config/config';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileDownloadInfo } from '../../core/models/file-download.model';

@Component({
  selector: 'app-file-download',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './file-download.html',
  styleUrls: ['./file-download.scss'],
})
export class FileDownload {

  private fileService = inject(FileService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  fileDownloadForm: FormGroup | null = null;
  fileId: number = 0;
  fileToken: string = "";
  file: FileInfo = {} as FileInfo;
  expMsgType = 'safe'; // 'safe' | 'warning' | 'overdue'
  expMsgIcon: string = '';
  fileLink: string = '';

 private buildForm() {
  if (this.file.isExpired) {
    this.fileDownloadForm = null;
    return;
  }

  const passwordValidators = this.file.hasPassword ? [Validators.required] : [];
  this.fileDownloadForm = this.formBuilder.group({
    password: ['', passwordValidators]
  });
}
  ngOnInit() {  
    this.fileToken = this.route.snapshot.queryParamMap.get('fileToken') ?? "";
    if (!this.fileToken) {
      console.warn('No file token provided in route parameters.');
      this.router.navigateByUrl('/');
      return;
    }

    queueMicrotask(() => {
      this.file = {} as FileInfo; // Reset file info before loading new data
      this.fileService.getFileInfo(this.fileToken).subscribe({
        next: (response) => {
          this.file = response as FileInfo;
          this.processFile();
          this.buildForm();
          this.cdr.detectChanges();

        },
        error: (err) => {
          console.error('Error loading file info:', err);
          this.router.navigateByUrl('/');
        }
      });
    });
  }

  processFile() {
    // Set file Id
    this.fileId = this.file.id;
    // Get file icon based on extension
    this.file.fileIconUrl = getIconByExtension(this.file.filename);
    // Format file size for human display
    if (isNaN(Number(this.file.fileSize))) {
      console.warn('File size is not a valid number:', this.file.fileSize);
      this.file.fileSize = '';
    }
    else {
      this.file.fileSize = formatFileSize(Number(this.file.fileSize));
    }
    // Determine if file is expired and compute expiration message
    this.file.isExpired = new Date(this.file.expirationDate) < new Date();
    if (this.file.isExpired) {
      this.file.expirationMsg = 'Ce fichier n\'est plus disponible au téléchargement car il a expiré.';
      this.expMsgType = 'overdue';
    } else {
      const [expMsg, daysLeft] = getExpirationDaysMessage(this.file.expirationDate);
      this.file.expirationMsg = `Ce fichier expirera ${expMsg}.`;
      if (daysLeft <= DOWNLOAD_CONFIG.EXPIRATION_WARNING) {
        this.expMsgType = 'warning';
      } 
    }
    // Get expiration status icon
    this.expMsgIcon = getIconByStatus(this.expMsgType);
  }

  onDownload() {
    let filePassword = '';
    if (this.file.hasPassword) {
      if (!this.fileDownloadForm) {
        console.error('Download form is not initialized for a password-protected file.');
        return;
      }
      if (!this.fileDownloadForm.get('password')?.value) {
        alert('Ce fichier est protégé par un mot de passe. Veuillez le saisir pour pouvoir le télécharger.');
        return;
      } else {
        filePassword = this.fileDownloadForm.get('password')?.value;
      }
    } 
    
    const fileDownloadInfo: FileDownloadInfo = {
      id: this.fileId,
      filePassword: filePassword
    };
    this.fileService.getFileLink(fileDownloadInfo).subscribe({
      next: (response: any) => {
        this.fileLink = response.fileLink;
        this.downloadFile();
      },
      error: (err) => {
        let alertMsg = 'Une erreur est survenue lors du téléchargement du fichier. Veuillez réessayer plus tard.';
        switch (err.status) {
          case 401:
            console.error('Incorrect password. ' + err);
            alertMsg = 'Mot de passe incorrect. Veuillez réessayer.';
            break;
          case 404:
            console.error('File not found. ' + err);
            alertMsg = 'Le fichier n\'a pas été trouvé.';
            break;
          case 410:
            console.error('File has expired. ' + err);
            alertMsg = 'Le fichier a expiré.';
            break;
          case 500:
            console.error('Server error. ' + err);
            break;
          default:
            console.error('Error downloading file:', err);
            break;
        }
        alert(alertMsg);
      }
    });
  }

  downloadFile() {
    if (!this.fileLink) {
      alert('Le lien de téléchargement n\'est pas disponible pour ce fichier.');
      console.error('File link is not available for download.');
      return;
    }

    this.fileService.downloadFile(this.fileLink).subscribe({
      next: (blob) => {
        if (!blob || blob.size === 0) {
          alert('Le fichier est vide ou impossible à télécharger.');
          console.error('Empty or invalid file blob received.');
          return;
        }

        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.file.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Revoke the object URL after a short delay to allow the download to start
        setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
        }, 1000);
      },
      error: (err) => {
        alert('Une erreur est survenue lors du téléchargement du fichier.');
        console.error('Error downloading file:', err);
      }
    });
  }

}
