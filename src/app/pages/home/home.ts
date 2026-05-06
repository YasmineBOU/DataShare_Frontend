// home.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { APP_CONFIG, formatFileSize } from '../../core/config/config';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  selectedFile: File | null = null;
  showForm: boolean = false;
  uploadForm: FormGroup;
  private userService = inject(UserService);

  constructor(private formBuilder: FormBuilder) {
    this.uploadForm = this.formBuilder.group({
      title: ['', Validators.required],
      password: [''],
      expiration: ['', Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné :', this.selectedFile.name);
      this.showForm = true; 
    }
  }

  onSubmit() {
    // Form validation and file upload check
    if ( !this.uploadForm.valid || ! this.selectedFile) {
      return;
    }

    // File size check
    if (this.selectedFile.size > APP_CONFIG.MAX_FILE_SIZE) {
      alert(`Le fichier est trop gros. Veuillez choisir un fichier de moins de ${formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}.`);
      return;
    }

    // Upload the file on the server
    console.log('Fichier :', this.selectedFile.name);
    console.log('Formulaire :', this.uploadForm.value);

    this.userService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        alert('Fichier uploadé avec succès !');
        this.uploadForm.reset();
        this.selectedFile = null;
        this.showForm = false;
      },
      error: (err) => {
        alert('Erreur lors de l\'upload du fichier. Veuillez réessayer.');
        console.error('Upload error:', err);
      }
    });
    
  }
}
