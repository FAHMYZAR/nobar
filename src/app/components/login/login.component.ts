import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-brand-bg text-brand-text">
      <header class="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold tracking-wider">NOBAR</h1>
        <button class="bg-brand-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors">
          Register
        </button>
      </header>

      <main class="text-center flex flex-col items-center">
        <h2 class="text-6xl md:text-8xl font-extrabold tracking-tighter mb-4" style="background: linear-gradient(to right, #b39ddb, #8e24aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Watch Together.
        </h2>
        <p class="text-xl md:text-2xl text-brand-text-muted max-w-2xl mb-8">
          Experience your favorite videos with friends, in perfect sync. Real-time chat, video calls, and shared moments.
        </p>
        
        <form (ngSubmit)="onLogin()" class="w-full max-w-sm flex flex-col gap-4">
          <input
            [(ngModel)]="loginKey"
            name="loginKey"
            type="password"
            placeholder="Enter access key"
            class="w-full px-4 py-3 bg-brand-surface border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
          />
          @if (errorMessage()) {
            <p class="text-red-400 text-sm">{{ errorMessage() }}</p>
          }
          <button type="submit" class="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors text-lg">
            Enter NOBAR
          </button>
        </form>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginKey = 'pentil';
  errorMessage = signal<string>('');
  private authService = inject(AuthService);
  private router = inject(Router);

  onLogin() {
    this.errorMessage.set('');
    if (this.authService.login(this.loginKey)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Invalid access key. Please try again.');
    }
  }
}
