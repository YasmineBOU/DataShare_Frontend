/**
 * Component responsible for handling file uploads.
 * This component allows users to upload files, set passwords, and choose expiration periods.
 * It performs file validation (size, extension) and computes file checksums for integrity verification.
 *
 * @see FileService
 * @see AuthService
 * @see LoadingService
 * @see formatFileSize
 * @see computeFileChecksum
 * @see getIconByExtension
 * @see FILE_CONFIG
 */

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

import { FILE_CONFIG } from '../../core/config/config';
import { AuthService } from '../../core/service/auth.service';
import { FileService } from '../../core/service/file.service';
import { LoadingService } from '../../core/service/loading';
import { formatFileSize, computeFileChecksum, getIconByExtension } from '../../core/utils/file-utils';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinner, 
    ReactiveFormsModule
  ],
  templateUrl: './file-upload.html',
  styleUrls: ['./file-upload.scss'],
})
export class FileUpload implements OnInit {
  
  /**
   * The FileService used to interact with the backend API for file uploads.
   */
  private fileService = inject(FileService);
  
  /**
   * The AuthService used to load the current authenticated user's email.
   */
  private authService = inject(AuthService);
  
  /**
   * The FormBuilder service used to create reactive forms.
   */
  private formBuilder = inject(FormBuilder);
  
  /**
   * The LoadingService used to track loading state and display a spinner.
   */
  private loadingService = inject(LoadingService);

  /**
   * Observable that emits the current loading state for the spinner display.
   */
  isLoading$ = this.loadingService.isLoading$;
  
  /**
   * Reactive form for handling file upload, password, and expiration period.
   */
  fileUploadForm!: FormGroup;
  
  /**
   * The download link generated after a successful file upload.
   */
  downloadLink: string = '';
  
  /**
   * Message to display after a successful file upload, indicating the expiration period.
   */
  dwlLinkMessage: string = '';
  
  /**
   * The file selected for upload.
   */
  selectedFile: File | null = null;
  
  /**
   * The icon associated with the selected file's extension.
   */
  fileIcon: string = '';
  
  /**
   * The checksum of the selected file for integrity verification.
   */
  fileChecksum: string = '';
  
  /**
   * Map of expiration options (in days) for the file link.
  */
  expirationOptions!: Map<number, string>;
  
  /**
   * The selected expiration period for the file link (in days).
   */
  selectedExpiration: number = FILE_CONFIG.DEFAULT_LINK_EXPIRATION_DAYS;
  
  /**
   * The email of the currently authenticated user.
   */
  currentUserEmail: string = '';
  
  /**
   * The minimum password length required for file protection.
   */
  passwordMinLength = FILE_CONFIG.PASSWORD_MIN_LENGTH;
  
  /**
   * Utility function to format file size in a human-readable format.
   */
  getHumanReadableSize = formatFileSize;

  /**
   * Builds or updates the reactive form for file upload.
   * Includes fields for password and expiration period.
   */
  private buildForm() {
    if (this.fileUploadForm) {
      this.fileUploadForm.patchValue({
        password: '',
        expiration: this.selectedExpiration
      });
    } else {
      this.fileUploadForm = this.formBuilder.group({
        password: [
          '', 
          [
            Validators.minLength(this.passwordMinLength), 
            Validators.pattern(FILE_CONFIG.PASSWORD_REGEX)
          ]
        ],
        expiration: [this.selectedExpiration, Validators.required]
      });
    }
  }

  /**
   * Initializes the component and loads the current authenticated user's email.
   * Also initializes the expiration options map.
   */
  ngOnInit() {
    // Load current authenticated user email from backend via HttpOnly cookie
    this.authService.loadCurrentUser().subscribe({
      next: (response) => {
        if (response.authenticated && response.email) {
          this.currentUserEmail = response.email;
        }
      },
      error: (err) => {
        console.error('Error loading current user:', err);
      }
    });

    this.expirationOptions = new Map(
      Object.entries(FILE_CONFIG.LINK_EXPIRATION_OPTIONS).map(
        ([key, value]) => [Number(key), value] as [number, string]
      )
    );
    this.selectedExpiration = FILE_CONFIG.DEFAULT_LINK_EXPIRATION_DAYS;

    this.buildForm();
  }

  /**
   * Computes the checksum of the selected file using the BLAKE3 algorithm.
   *
   * @throws Error if the file is not selected or if an error occurs during checksum computation.
   */
  async calculateChecksum() {
  
    try {
      this.fileChecksum = await computeFileChecksum(this.selectedFile!); 
    } catch (error) {
      console.error('Got error while computing checksum:', error);
      alert('Une erreur est survenue lors du calcul du checksum.');
      throw error; 
    }
  }

  /**
   * Handles file selection from the file input.
   * Validates the file size and extension, and updates the selected file and its icon.
   *
   * @param event - The event triggered by file selection.
   */
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      let file = fileInput.files[0];

      // File size check
      if (file.size > FILE_CONFIG.MAX_FILE_SIZE){
        alert(`Le fichier est trop volumineux. Veuillez choisir un fichier de moins de ${this.getHumanReadableSize(FILE_CONFIG.MAX_FILE_SIZE)}.`);
        return;
      }
      // File extensions check
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      if (FILE_CONFIG.FORBIDDEN_FILE_TYPES.includes(fileExt)) {
        alert(`Le type de fichier .${fileExt} n'est pas autorisé. Veuillez choisir un autre fichier.`);
        return;
      }
      
      this.selectedFile = file;
      this.fileIcon = getIconByExtension(this.selectedFile.name);
      this.buildForm();
      
    }
  }

  /**
   * Resets the selected file and related form data.
   */
  resetSelectedFile() {
    this.selectedFile = null;
  }

  /**
   * Constructs a FormData object containing all the necessary data for file upload.
   *
   * @returns A FormData object ready to be sent to the backend.
   */
  getFileFormData(): FormData {
    const formData = new FormData();

    formData.append('email', this.currentUserEmail);
    formData.append('file', this.selectedFile!);
    formData.append('filename', this.selectedFile!.name);
    formData.append('fileSize', this.selectedFile!.size.toString());
    formData.append('fileType', this.selectedFile!.type);
    formData.append('hash', this.fileChecksum);
    formData.append('filePassword', this.fileUploadForm.get('password')?.value || '');
    formData.append('expirationDays', this.fileUploadForm.get('expiration')?.value || '');

    return formData;
  }


  /**
   * Handles the file upload process.
   * Validates the form, computes the file checksum, and sends the file to the backend.
   * Displays the download link after a successful upload.
   *
   * @returns A promise that resolves when the upload is complete.
   */
  async onUpload() {
    if (!this.fileUploadForm.valid || !this.selectedFile) {
      return;
    }

    try {
      await this.calculateChecksum();
      
      const response = await firstValueFrom(
        this.fileService.uploadFile(this.getFileFormData())
      ) as { fileToken: string };;

      alert('Fichier uploadé avec succès !');
      const expVal = this.expirationOptions.get(this.fileUploadForm.get('expiration')?.value);
      this.dwlLinkMessage = `Félicitations, ton fichier sera conservé chez nous pendant ${expVal?.toLocaleLowerCase()} !`;
      this.downloadLink = this.getDownloadURL(response.fileToken);
      this.fileUploadForm.reset();

    } catch (err: any) {
      console.error('Upload error:', err);
      let errorMessage = 'Une erreur est survenue lors de l\'upload du fichier.';

      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        errorMessage = 'L\'upload a expiré. Vérifiez votre connexion réseau et réessayez.';
      } else if (err.status === 413) {
        errorMessage = 'Le fichier est trop volumineux. Vérifiez la limite de taille du serveur.';
      } else if (err.status === 0 || err.statusText === 'Unknown Error') {
        errorMessage = 'Erreur réseau détectée. Vérifiez votre connexion et réessayez.';
      }

      alert(errorMessage);
    }
  }

  /**
   * Copies the download link to the clipboard.
   * Logs an error if the clipboard operation fails.
   */
  copyLinkToClipboard() {
    navigator.clipboard.writeText(this.downloadLink).then(() => {
    }).catch(err => {
      console.error('Error copying link :', err);
    });
  }

  /**
   * Generates a download URL for the file using its token.
   *
   * @param fileToken - The token of the file.
   * @returns A string representing the download URL.
   */
  getDownloadURL(fileToken : string): string {
    return `${window.location.origin}/files/download?fileToken=${fileToken}`;
  }
}

