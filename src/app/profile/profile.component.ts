import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [
    FormsModule, CommonModule
  ],
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  userProfile: any = {};
  isEditModalOpen: boolean = false;
  isImageUploadOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  modalTitle: string = '';
  modalInputType: string = 'text';
  newValue: string = '';
  oldPassword: string = '';
  confirmedPassword: string = '';
  currentEditingField: string | null = null;
  errorMessage: string = '';
  selectedFile: File | null = null;
  modalType: 'text' | 'password' = 'text';

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private http: HttpClient,
    //private cdr: ChangeDetectorRef

) {}


  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe({
      next: (data) => {
        this.userProfile = data;
        //console.log('User Profile Data:', this.userProfile); // Debugging

        if (this.userProfile.profilePictureUrl && !this.userProfile.profilePictureUrl.startsWith('http')) {
          this.userProfile.profilePictureUrl = `http://localhost:8080/api/user${this.userProfile.profilePictureUrl}`;
        }
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
      }
    });
  }

  openEditModal(field: string, currentValue: string): void {
    if (field) {
      this.currentEditingField = field;
      this.modalTitle = `Edit ${field} `;
      this.newValue = currentValue;
      this.oldPassword = ''; // Setze das alte Passwort zurück
      this.confirmedPassword = '';

      // Setze den Modal-Typ basierend auf dem Feld
      this.modalType = field === 'password' ? 'password' : 'text';

      // Setze den Input-Typ basierend auf dem Feld
      this.modalInputType = field === 'password' ? 'password' : 'text';

      this.isEditModalOpen = true;
    } else {
      console.error('Field is undefined');
      this.errorMessage = 'Fehler: Feld nicht gefunden.';
    }
  }
  //Methode um die Änderungen auch wirklich zu übernehmen
  saveChanges(): void {
    if (this.currentEditingField && this.newValue) {
      // Überprüfe, ob es sich um eine Passwort-Änderung handelt
      if (this.currentEditingField === 'password') {
        // Überprüfungen
        if (this.newValue.length < 8) {
          this.errorMessage = 'Your password has to have atleast 8 digits';
          return;
        }
        if (this.newValue !== this.confirmedPassword) {
          this.errorMessage = 'Please make sure that your new password is the same as the confirmed one';
          return;
        }
      }

      const userId = this.userProfile.id;
      if (!userId) {
        console.error('User ID is undefined');
        this.errorMessage = 'Fehler: Benutzer-ID nicht gefunden.';
        return;
      }

      // Sichergehen, dass die richtige URL angesprochen wird
      const baseUrl = 'http://localhost:8080/api';
      const endpoint = `${baseUrl}/user/${userId}/new${this.currentEditingField}`;

      const payload = this.currentEditingField === 'password'
        ? { oldPassword: this.oldPassword, newPassword: this.newValue }
        : { [this.currentEditingField]: this.newValue };

      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      this.http.put(endpoint, payload, { headers }).subscribe({
        next: (response) => {
          // Überprüfe, ob currentEditingField nicht null ist
          if (this.currentEditingField) {
            // Aktualisiere die lokalen Daten
            this.userProfile[this.currentEditingField] = this.newValue;
          }
          this.showSuccessMessage(`${this.currentEditingField} erfolgreich geändert!`);
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating field:', err);
          this.errorMessage = 'Fehler beim Speichern: ' + (err.error?.message || err.message);
        }
      });
    }
  }
  showSuccessMessage(message: string): void {
    alert(message);
  }
  closeModal(): void {
    this.isEditModalOpen = false;
    this.errorMessage = '';
  }

  openImageUpload(): void {
    this.isImageUploadOpen = true;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  uploadProfilePicture(): void {
    if (this.selectedFile) {
      const userId = this.userProfile.id;
      if (!userId) {
        console.error('User ID is undefined');
        this.errorMessage = 'Fehler: Benutzer-ID nicht gefunden.';
        return;
      }
      const baseUrl = 'http://localhost:8080/api';
      const endpoint = `${baseUrl}/user/${userId}/upload-profile-picture`;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.put(endpoint, formData, { headers }).subscribe({
        next: (response: any) => {
          console.log('Response:', response); // Debugging

          if (response.profilepictureUrl) {
            // Konstruiere die vollständige Bild-URL
            const fullImageUrl = response.profilepictureUrl.startsWith('http')
              ? response.profilepictureUrl
              : `http://localhost:8080${response.profilepictureUrl}`;

            // Füge einen Timestamp als Query-Parameter hinzu (zu Unterscheidung damit Bild immer sofort
            // aktualisiert wird und nicht erst durch manuellen Refresh
            const timestamp = new Date().getTime();
            const imageUrlWithTimestamp = `${fullImageUrl}?${timestamp}`;

            this.userProfile.profilePictureUrl = imageUrlWithTimestamp;

            //this.reloadImage(imageUrlWithTimestamp);

            this.showSuccessMessage('Profile picture uploaded successfully!');

            this.closeImageUpload();
          } else {
            this.errorMessage = 'Ungültige Antwort vom Server.';
          }
        },
        error: (err) => {
          console.error('Error uploading profile picture:', err);
          this.errorMessage = 'Fehler beim Hochladen: ' + (err.error?.message || err.message);
        }
      });
    } else {
      this.errorMessage = 'Bitte wähle ein Bild aus.';
    }
  }

  closeImageUpload(): void {
    this.isImageUploadOpen = false;
    this.selectedFile = null;
    this.errorMessage = '';
  }

  // Methode zum Öffnen des Lösch-Modals
  openDeleteModal() {
    this.isDeleteModalOpen = true;
  }

  // Methode zum Schließen des Lösch-Modals
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  // Methode zum Löschen des Kontos
  deleteAccount() {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        console.log('Response from backend:', response); // Debugging: Zeige die Antwort an

        // Überprüfe, ob die Löschung erfolgreich war
        if (response && response.status === '200') {
          this.authService.logout();
          this.router.navigate(['/register']);
        } else {
          alert('Unexpected response: ' + JSON.stringify(response));
        }
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        if (err.status === 401) {
          alert('Unauthorized: Please log in again.');
        } else if (err.error) {
          alert('Error: ' + err.error);
        } else {
          alert('An error occurred while deleting your account. Please try again.');
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
