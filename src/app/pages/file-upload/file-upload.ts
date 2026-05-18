import { Component, inject, OnInit } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { AuthService } from '../../core/service/auth.service';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FILE_CONFIG } from '../../core/config/config';
import { formatFileSize, computeFileChecksum, getIconByExtension } from '../../core/utils/file-utils';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/service/loading';
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
  
  private fileService = inject(FileService);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private loadingService = inject(LoadingService);

  isLoading$ = this.loadingService.isLoading$;
  
  fileUploadForm!: FormGroup;
  downloadLink: string = '';
  dwlLinkMessage: string = '';
  selectedFile: File | null = null;
  fileIcon: string = '';
  fileChecksum: string = '';
  getHumanReadableSize = formatFileSize;
  expirationOptions!: Map<number, string>;
  selectedExpiration: number = FILE_CONFIG.DEFAULT_LINK_EXPIRATION_DAYS;
  currentUserEmail: string = '';
  passwordMinLength = FILE_CONFIG.PASSWORD_MIN_LENGTH;


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

  async calculateChecksum() {
  
    try {
      this.fileChecksum = await computeFileChecksum(this.selectedFile!); 
    } catch (error) {
      console.error('Got error while computing checksum:', error);
      alert('Une erreur est survenue lors du calcul du checksum.');
      throw error; 
    }
  }

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

  resetSelectedFile() {
    this.selectedFile = null;
  }

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


  async onUpload() {
    // Form validation and file upload check
    if (!this.fileUploadForm.valid || !this.selectedFile) {
      return;
    }
    
    try {
      // Calculate file checksum before uploading
      await this.calculateChecksum(); 
      console.log('File checksum calculated:', this.fileChecksum);
      // Upload the file on the server
      this.fileService.uploadFile(this.getFileFormData()).subscribe({
        next: (response: any) => {
          alert('Fichier uploadé avec succès !');
          let expVal = this.expirationOptions.get(this.fileUploadForm.get('expiration')?.value);
          this.dwlLinkMessage = `Félicitations, ton fichier sera conservé chez nous pendant ${expVal?.toLocaleLowerCase()} !`;
          this.downloadLink = this.getDownloadURL(response.fileToken);
          console.log('download link:', this.downloadLink);
          this.fileUploadForm.reset();
        },
        error: (err) => {
          console.error('Upload error:', err);
          let errorMessage = 'Une erreur est survenue lors de l\'upload du fichier.';
          
          // Afficher des messages d'erreur spécifiques selon le type d'erreur
          if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
            errorMessage = 'L\'upload a expiré. Vérifiez votre connexion réseau et réessayez. (Pour les gros fichiers, l\'upload peut prendre 5-30 minutes selon votre connexion)';
          } else if (err.status === 413) {
            errorMessage = 'Le fichier est trop volumineux. Vérifiez la limite de taille du serveur.';
          } else if (err.status === 0 || err.statusText === 'Unknown Error') {
            errorMessage = 'Erreur réseau détectée. Vérifiez votre connexion et réessayez.';
          }
          
          alert(errorMessage);
        }
      });
    } catch (error) {
      console.error('File processing error:', error);
      alert('Une erreur est survenue lors du traitement du fichier. Veuillez réessayer.');
    }  
  }

  copyLinkToClipboard() {
    navigator.clipboard.writeText(this.downloadLink).then(() => {
    }).catch(err => {
      console.error('Error copying link :', err);
    });
  }

  getDownloadURL(fileToken : string): string {
    return `${window.location.origin}/files/download?fileToken=${fileToken}`;
  }
}

