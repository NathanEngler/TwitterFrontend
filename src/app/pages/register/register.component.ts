import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerData = {
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Methode für das Absenden des Formulars
  onSubmit() {
    // Überprüfen, ob die Passwörter übereinstimmen
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    // API-Aufruf zur Registrierung
    this.http.post('http://localhost:8080/api/user/register', {
      firstname: this.registerData.firstname,
      lastname: this.registerData.lastname,
      email: this.registerData.email,
      username: this.registerData.username,
      password: this.registerData.password // Nur das (eine) Passwort senden (ist in jedem Fall dasgleiche wegen Überprüfung), da nicht password und confirmedpassword beide erwartet werden
    }).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.status === 400) {
          this.errorMessage = 'Username or email already exists.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
