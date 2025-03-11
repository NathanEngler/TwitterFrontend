import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/user/{id}/profile';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Injiziere den AuthService
  ) {}

  getUserProfile(): Observable<any> {
    const userId = this.authService.getUserId(); // Hole die Benutzer-ID
    if (!userId) {
      throw new Error('User ID not found');
    }
    const url = `http://localhost:8080/api/user/${userId}/profile`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    return this.http.get<any>(url, { headers });
  }
  // Methode zum Löschen des Benutzerkontos
  deleteUser(userId: string): Observable<any> {
    const token = this.authService.getToken(); // Hole das Token aus dem AuthService
    if (!token) {
      throw new Error('Token not found');
    }

    // Setze die Header mit dem Token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // API-Aufruf zum Löschen des Kontos
    const url = `http://localhost:8080/api/user/delete/${userId}`; // Dynamische URL
    return this.http.delete(url, { headers });
  }
}
