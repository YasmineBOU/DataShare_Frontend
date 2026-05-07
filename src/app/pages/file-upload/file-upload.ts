import { Component, inject, OnInit } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FILE_CONFIG } from '../../core/config/config';
import { formatFileSize, computeFileChecksum } from '../../core/utils/file-utils';
import { CommonModule } from '@angular/common';
import { FileUploadModel } from '../../core/models/file-upload.model';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.scss',
})
export class FileUpload implements OnInit {
  private fileService = inject(FileService);
  fileUploadForm!: FormGroup;
  showForm: boolean = false;
  selectedFile: File | null = null;
  fileChecksum: string = '';
  getHumanReadableSize = formatFileSize;
  expirationOptions!: Map<number, string>;
  selectedExpiration: number = FILE_CONFIG.DEFAULT_LINK_EXPIRATION_DAYS;


  constructor(private formBuilder: FormBuilder) {
   
  }

  private buildForm() {
    console.log('📝 buildForm() appelé. Valeur de selectedExpiration :', this.selectedExpiration);
    if (this.fileUploadForm) {
      this.fileUploadForm.patchValue({
        password: '',
        expiration: this.selectedExpiration
      });
    } else {
      this.fileUploadForm = this.formBuilder.group({
        password: ['', Validators.minLength(FILE_CONFIG.PASSWORD_MIN_LENGTH)],
        expiration: [this.selectedExpiration, Validators.required]
      });
    }
  }

  ngOnInit() {
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
      console.log(`Checksum du fichier : ${this.fileChecksum}`);
    } catch (error) {
      console.error('Got error while computing checksum:', error);
      alert('Une erreur est survenue lors du calcul du checksum.');
      throw error; 
    }
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.showForm = true;
      this.selectedFile = fileInput.files[0];
      console.log(`Fichier sélectionné : ${this.selectedFile.name} (${this.getHumanReadableSize(this.selectedFile.size)}`);
      this.buildForm();
      
    }
  }

  resetSelectedFile() {
    this.selectedFile = null;
  }

  getFileFormData(): FormData {
    const formData = new FormData();

    formData.append('email', localStorage.getItem('userEmail') || '');
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
  console.log('Démarrage de l\'upload du fichier...');
  console.log('📝 Formulaire valide ?', this.fileUploadForm?.valid); // <-- Vérifie ici
  console.log('📝 Valeurs du formulaire :', this.fileUploadForm?.value); // <-- Vérifie ici
  console.log('📁 Fichier sélectionné ?', this.selectedFile);
    // Form validation and file upload check
    if (!this.fileUploadForm.valid || !this.selectedFile) {
      return;
    }
    // File size check
    if (this.selectedFile.size > FILE_CONFIG.MAX_FILE_SIZE){
      alert(`Le fichier est trop gros. Veuillez choisir un fichier de moins de ${this.getHumanReadableSize(FILE_CONFIG.MAX_FILE_SIZE)}.`);
      return;
    }
    try {
      // Calculate file checksum before uploading
      await this.calculateChecksum(); // remove async/await if no longer needed
      // Upload the file on the server
      this.fileService.uploadFile(this.getFileFormData()).subscribe({
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
    } catch (error) {
      alert('Une erreur est survenue lors du traitement du fichier. Veuillez réessayer.');
      console.error('File processing error:', error);
    }  
  }
}

