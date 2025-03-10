import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = { identifier: '', password: '' };
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.http.post<{ token: string }>('http://localhost:8080/api/auth/login', this.loginData)
      .subscribe({
        next: (response) => {
          this.authService.setToken(response.token); // JWT speichern
          this.router.navigate(['/profile']); // Weiterleiten zur Profilseite
        },
        error: (err) => {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      });
  }
}
