import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  public authService = inject(AuthService);

  profileData = signal<any | null>(null);
  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit() {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.profileData.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        // Fallback to currentUser stored signal if GET fails
        this.profileData.set(this.authService.currentUser());
        this.loading.set(false);
      }
    });
  }
}
