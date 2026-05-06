import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from "./pages/login/login";
import { Register } from "./pages/register/register";
import { Header } from "./pages/header/header"; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Login, Register, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('DataShare_Frontend');
}
