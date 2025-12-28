import { Component, ChangeDetectionStrategy, inject, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-brand-bg text-brand-text p-4 sm:p-6 lg:p-8">
      <header class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold tracking-wider">NOBAR</h1>
        <button (click)="authService.logout()" class="text-brand-text-muted hover:text-brand-primary transition-colors">
          <i data-lucide="log-out" class="w-6 h-6"></i>
        </button>
      </header>
      
      <main class="max-w-4xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <!-- Create Room -->
          <div class="bg-brand-surface p-6 rounded-xl border border-brand-secondary flex flex-col items-center text-center">
            <div class="mb-4 bg-brand-primary/20 p-4 rounded-full">
              <i data-lucide="plus-circle" class="w-10 h-10 text-brand-primary"></i>
            </div>
            <h2 class="text-2xl font-semibold mb-2">Create a New Room</h2>
            <p class="text-brand-text-muted mb-6">Start a new watch party and invite your friend.</p>
            <button (click)="createRoom()" class="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-80 transition-colors">
              Create Room
            </button>
          </div>

          <!-- Join Room -->
          <div class="bg-brand-surface p-6 rounded-xl border border-brand-secondary flex flex-col items-center text-center">
            <div class="mb-4 bg-brand-primary/20 p-4 rounded-full">
              <i data-lucide="arrow-right-circle" class="w-10 h-10 text-brand-primary"></i>
            </div>
            <h2 class="text-2xl font-semibold mb-2">Join a Room</h2>
            <p class="text-brand-text-muted mb-4">Enter a room ID to join an existing party.</p>
            <form (ngSubmit)="joinRoom(roomIdInput.value)" class="w-full flex gap-2">
              <input 
                #roomIdInput
                type="text" 
                placeholder="Enter Room ID"
                class="flex-grow px-4 py-3 bg-brand-bg border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow"
              >
              <button type="submit" class="bg-brand-primary text-white font-bold p-3 rounded-lg hover:bg-opacity-80 transition-colors">
                <i data-lucide="arrow-right" class="w-6 h-6"></i>
              </button>
            </form>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-4 text-brand-text-muted">Recent Rooms</h3>
          <div class="space-y-3">
            <!-- Mock recent rooms -->
            <div class="bg-brand-surface p-4 rounded-lg flex justify-between items-center border border-transparent hover:border-brand-secondary transition-colors">
              <div>
                <p class="font-semibold">Movie Night!</p>
                <p class="text-sm text-brand-text-muted">ID: a5b8c1</p>
              </div>
              <button [routerLink]="['/room', 'a5b8c1']" class="text-brand-primary font-semibold hover:underline">Rejoin</button>
            </div>
            <div class="bg-brand-surface p-4 rounded-lg flex justify-between items-center border border-transparent hover:border-brand-secondary transition-colors">
              <div>
                <p class="font-semibold">Anime Marathon</p>
                <p class="text-sm text-brand-text-muted">ID: d4e7f2</p>
              </div>
              <button [routerLink]="['/room', 'd4e7f2']" class="text-brand-primary font-semibold hover:underline">Rejoin</button>
            </div>
          </div>
        </div>
      </main>

      <!-- Mobile bottom nav -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-brand-secondary p-2 flex justify-around">
        <a href="#" class="flex flex-col items-center text-brand-primary p-2">
          <i data-lucide="tv-2" class="w-6 h-6 mb-1"></i>
          <span class="text-xs">NOBAR</span>
        </a>
        <a href="#" class="flex flex-col items-center text-brand-text-muted p-2 hover:text-brand-primary">
          <i data-lucide="user" class="w-6 h-6 mb-1"></i>
          <span class="text-xs">Profile</span>
        </a>
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  private router = inject(Router);
  authService = inject(AuthService);

  ngAfterViewInit() {
    (window as any)?.lucide?.createIcons();
  }
  
  createRoom() {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    this.router.navigate(['/room', newRoomId]);
  }

  joinRoom(roomId: string) {
    const trimmedRoomId = roomId.trim();
    if (trimmedRoomId) {
      this.router.navigate(['/room', trimmedRoomId]);
    }
  }
}
