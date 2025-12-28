import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  isLoggedIn = signal<boolean>(false);

  login(key: string): boolean {
    if (key === '123') {
      this.isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout() {
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }
}
