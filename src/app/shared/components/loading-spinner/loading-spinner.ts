import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loading-spinner.html',
  styleUrls: ['./loading-spinner.scss'],
})
export class LoadingSpinner {
  @Input() message: string = 'Chargement en cours...';
  @Input() showSpinner: boolean = true;
}
