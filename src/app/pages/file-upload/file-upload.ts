import { Component, inject, OnInit } from '@angular/core';
import { FileService } from '../../core/service/file.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  expirationOptions! : Map<number, string>;
  selectedExpiration! : string;


  constructor(private formBuilder: FormBuilder) {
   
  }

  private buildForm() {
    console.log(`Selected expiration: ${this.selectedExpiration}`);
    this.fileUploadForm = this.formBuilder.group({
      password: ['', Validators.minLength(FILE_CONFIG.PASSWORD_MIN_LENGTH)],
      expiration: [this.selectedExpiration, Validators.required]
    });
  }

  ngOnInit() {
    this.expirationOptions = new Map(
      Object.entries(FILE_CONFIG.LINK_EXPIRATION_OPTIONS).map(
        ([key, value]) => [Number(key), value] as [number, string]
      )
    );
    this.selectedExpiration = this.expirationOptions.get(FILE_CONFIG.DEFAULT_LINK_EXPIRATION_DAYS) || '';

    this.buildForm();
  }

  async calculateChecksum() {
  
    try {
      this.fileChecksum = await computeFileChecksum(this.selectedFile!); 
      console.log(`Checksum (BLAKE3) du fichier : ${this.fileChecksum}`);
    } catch (error) {
      console.error('Erreur lors du calcul du checksum:', error);
      alert('Une erreur est survenue lors du calcul du checksum.');
      throw error; 
    }
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.showForm = true;
      this.selectedFile = fileInput.files[0];
      console.log(`Fichier sélectionné : ${this.selectedFile.name} (${this.getHumanReadableSize(this.selectedFile.size)})`);

    }
  }

  async onUpload() {
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
      const fileUploadData: FileUploadModel = {
        file: this.selectedFile,
        hash: this.fileChecksum,
        password: this.fileUploadForm.value.password,
        expirationDays: Number(this.fileUploadForm.value.expiration.split(' ')[0]) // Extract number of days from string
      };
      console.log('Données d\'upload :', fileUploadData);
      this.fileService.uploadFile(fileUploadData).subscribe({
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

