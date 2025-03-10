import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor() {}

  // JWT speichern
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // JWT abrufen
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Überprüfen, ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  // JWT entfernen; führt zu Logout
  logout(): void {
    localStorage.removeItem('token');
  }
  // User ID aus Token herbekommen
  getUserId(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.sub; // .sub weil bei Erstellung des Tokens ID als subject festgelegt (im JwtTokenProvider)
    }
    return null;
  }
}
