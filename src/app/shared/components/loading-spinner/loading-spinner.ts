/**
 * Component responsible for displaying a loading spinner with an optional message.
 * This standalone component can be used throughout the application to indicate loading states.
 *
 * @see CommonModule
 */

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
  /**
   * The message displayed while the spinner is active.
   * Default value: "Chargement en cours...".
   */
  @Input() message: string = 'Chargement en cours...';
  
  /**
   * Flag to control the visibility of the spinner.
   * If set to `false`, the spinner will not be displayed.
   * Default value: `true`.
   */
  @Input() showSpinner: boolean = true;
}
