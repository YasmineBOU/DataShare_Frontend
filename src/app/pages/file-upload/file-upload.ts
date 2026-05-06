import { Component, inject } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FILE_CONFIG, formatFileSize } from '../../core/config/config';
import CryptoJS from 'crypto-js';
import { FILE } from 'dns';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload {
  private fileService = inject(FileService);
  fileUploadForm: FormGroup;
  showForm: boolean = false;
  selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder) {
    this.fileUploadForm = this.formBuilder.group({
      password: ['', Validators.minLength(FILE_CONFIG.PASSWORD_MIN_LENGTH)],
      expiration: ['7 jours', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.showForm = true;
      this.selectedFile = fileInput.files[0];
      console.log(`Fichier sélectionné : ${this.selectedFile.name} (${formatFileSize(this.selectedFile.size)})`);

      this.sendFileOnServer();
    }
  }
  sendFileOnServer() {
    // Form validation and file upload check
    if (!this.fileUploadForm.valid || !this.selectedFile) {
      return;
    }
    // File size check
    if (this.selectedFile.size > FILE_CONFIG.MAX_FILE_SIZE){
      alert(`Le fichier est trop gros. Veuillez choisir un fichier de moins de ${formatFileSize(FILE_CONFIG.MAX_FILE_SIZE)}.`);
      return;
    }
    // Upload the file on the server
    this.fileService.uploadFile(
      this.selectedFile, 
      CryptoJS.MD5(this.selectedFile)
    ).subscribe({
      next: (response) => {
        alert('Fichier uploadé avec succès !');
        this.fileUploadForm.reset();
        this.selectedFile = null;
        this.showForm = false;
      },
      error: (err) => {
        alert('Une erreur est survenue lors de l\'upload du fichier. Veuillez réessayer plus tard.');
        console.error('Upload error:', err);
      }
    });
    
  }


}

