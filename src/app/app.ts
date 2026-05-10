import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './pages/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('DataShare_Frontend');
}
