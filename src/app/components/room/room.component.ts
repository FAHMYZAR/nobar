import { Component, ChangeDetectionStrategy, inject, signal, ElementRef, ViewChild, AfterViewInit, OnDestroy, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

type Message = {
  id: number;
  user: 'You' | 'Friend';
  text: string;
  timestamp: string;
};

@Component({
  selector: 'app-room',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="h-screen w-screen bg-brand-bg text-brand-text flex flex-col p-2 md:p-3 lg:p-4">
      <!-- Header -->
      <header class="flex-shrink-0 flex justify-between items-center mb-2 md:mb-3">
        <a routerLink="/dashboard" class="flex items-center gap-2 text-brand-text-muted hover:text-brand-primary transition-colors">
          <i data-lucide="arrow-left" class="w-5 h-5"></i>
          <span class="font-bold text-lg hidden sm:inline">NOBAR</span>
        </a>
        <div class="text-center">
          <p class="text-sm text-brand-text-muted">ROOM ID</p>
          <p class="font-mono bg-brand-surface px-3 py-1 rounded-md text-sm tracking-widest">{{ roomId() }}</p>
        </div>
        <button (click)="toggleChat()" class="p-2 rounded-full hover:bg-brand-surface transition-colors md:hidden">
            <i data-lucide="message-square" class="w-6 h-6"></i>
        </button>
      </header>
      
      <!-- Main Content Grid -->
      <main class="flex-grow grid grid-cols-12 grid-rows-12 gap-2 md:gap-3 lg:gap-4 h-full min-h-0">
        <!-- Main Video Area -->
        <div 
          class="relative bg-brand-surface rounded-xl flex items-center justify-center col-span-12 row-span-5"
          [class.md:col-span-8]="isChatVisible()"
          [class.md:col-span-12]="!isChatVisible()"
        >
          @if (!videoUrl() && !embedUrl()) {
            <div class="text-center p-4">
              <h2 class="text-xl font-semibold mb-2">Welcome, Host!</h2>
              <p class="text-brand-text-muted mb-4">Paste a video URL to start the party.</p>
              <p class="text-xs text-brand-text-muted mb-4">Supports: YouTube, Vimeo, Dailymotion, Twitch, or direct video files (.mp4, .webm)</p>
              <form (submit)="loadVideo($event)" class="flex gap-2">
                <input #videoUrlInput type="text" placeholder="https://youtube.com/watch?v=..." class="w-full px-3 py-2 bg-brand-bg border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow">
                <button type="submit" class="bg-brand-primary text-white font-bold p-2 rounded-lg hover:bg-opacity-80 transition-colors">
                  <i data-lucide="play" class="w-6 h-6"></i>
                </button>
              </form>
            </div>
          } @else if (isEmbeddedVideo()) {
            <iframe 
              [src]="embedUrl()" 
              class="w-full h-full rounded-xl" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          } @else {
            <video #mainVideo class="w-full h-full object-contain rounded-xl" [src]="videoUrl()" controls></video>
          }
        </div>
        
        <!-- Controls / Actions -->
        <div 
          class="bg-brand-surface rounded-xl col-span-12 row-span-3 md:row-span-7 md:row-start-6"
          [class.md:col-span-4]="isChatVisible()"
          [class.md:col-span-6]="!isChatVisible()"
        >
            <div class="p-4 h-full flex flex-col justify-between">
                <div>
                    <h3 class="font-bold text-lg mb-4">Controls</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <button (click)="toggleCamera()" 
                            [class]="'flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors ' + (isCameraOn() ? 'bg-green-500/20 text-green-400' : 'bg-brand-secondary hover:bg-brand-primary/50')">
                            <i [attr.data-lucide]="isCameraOn() ? 'video' : 'video-off'" class="w-8 h-8"></i>
                            <span class="font-semibold">{{ isCameraOn() ? 'Camera On' : 'Camera Off' }}</span>
                        </button>
                        <button (click)="toggleMic()" 
                            [class]="'flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-colors ' + (isMicOn() ? 'bg-green-500/20 text-green-400' : 'bg-brand-secondary hover:bg-brand-primary/50')">
                            <i [attr.data-lucide]="isMicOn() ? 'mic' : 'mic-off'" class="w-8 h-8"></i>
                            <span class="font-semibold">{{ isMicOn() ? 'Mic On' : 'Mic Off' }}</span>
                        </button>
                    </div>
                </div>
                 <div class="text-xs text-brand-text-muted">
                    <p>Syncing is simulated. In a real app, the host's play/pause/seek actions would be sent to other users via a server.</p>
                </div>
            </div>
        </div>

        <!-- Camera Area -->
        <div 
          class="bg-brand-surface rounded-xl col-span-12 row-span-4 md:row-span-7 md:row-start-6"
          [class.md:col-span-4]="isChatVisible()"
          [class.md:col-start-5]="isChatVisible()"
          [class.md:col-span-6]="!isChatVisible()"
          [class.md:col-start-7]="!isChatVisible()"
        >
          <div class="p-2 h-full grid grid-cols-1 grid-rows-2 gap-2">
              <div class="bg-brand-bg rounded-lg relative overflow-hidden flex items-center justify-center">
                <video #userVideo class="w-full h-full object-cover" [muted]="true" autoplay playsinline></video>
                @if (!isCameraOn()) {
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                        <i data-lucide="user" class="w-12 h-12 text-brand-secondary"></i>
                        <span class="font-semibold mt-2">You</span>
                    </div>
                }
              </div>
              <div class="bg-brand-bg rounded-lg relative flex items-center justify-center">
                 <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <i data-lucide="user" class="w-12 h-12 text-brand-secondary"></i>
                    <span class="font-semibold mt-2">Friend</span>
                </div>
              </div>
          </div>
        </div>
        
        <!-- Chat Panel -->
        <div 
          class="bg-brand-surface rounded-xl flex-col h-full col-span-12 md:col-span-4 md:col-start-9 md:row-span-12"
          [class.hidden]="!isChatVisible()"
          [class.flex]="isChatVisible()"
        >
          <div class="p-4 border-b border-brand-secondary flex-shrink-0 flex justify-between items-center">
            <h3 class="font-bold text-lg">Chat</h3>
            <button (click)="toggleChat()" class="p-1 rounded-full hover:bg-brand-bg transition-colors md:hidden">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div #chatContainer class="flex-grow p-4 space-y-4 overflow-y-auto">
            @for (msg of messages(); track msg.id) {
              <div [class]="'flex items-end gap-2 ' + (msg.user === 'You' ? 'flex-row-reverse' : '')">
                <div [class]="'max-w-xs lg:max-w-md p-3 rounded-lg ' + (msg.user === 'You' ? 'bg-brand-primary text-white' : 'bg-brand-secondary text-brand-text')">
                  <p>{{ msg.text }}</p>
                  <p class="text-xs opacity-70 mt-1 text-right">{{ msg.timestamp }}</p>
                </div>
              </div>
            }
          </div>
          <div class="p-4 border-t border-brand-secondary flex-shrink-0">
            <form (submit)="sendMessage($event)" class="flex gap-2">
              <input #messageInput type="text" placeholder="Type a message..." class="w-full px-3 py-2 bg-brand-bg border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-shadow">
              <button type="submit" class="bg-brand-primary text-white font-bold p-2 rounded-lg hover:bg-opacity-80 transition-colors">
                <i data-lucide="send" class="w-6 h-6"></i>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomComponent implements AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  roomId = signal<string>('');
  
  isChatVisible = signal<boolean>(true);

  isCameraOn = signal(false);
  isMicOn = signal(false);
  videoUrl = signal('');
  private rawEmbedUrl = signal('');
  embedUrl = computed(() => {
    const url = this.rawEmbedUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
  isEmbeddedVideo = signal(false);
  localStream: MediaStream | null = null;
  @ViewChild('userVideo') userVideo!: ElementRef<HTMLVideoElement>;
  
  messages = signal<Message[]>([
      { id: 1, user: 'Friend', text: 'Hey! Ready for the movie?', timestamp: '10:30 PM' },
      { id: 2, user: 'You', text: 'Yeah! Just getting set up. What are we watching?', timestamp: '10:31 PM' },
      { id: 3, user: 'Friend', text: 'Found this cool indie sci-fi. Pasting the link now.', timestamp: '10:31 PM' }
  ]);
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('chatContainer') chatContainer!: ElementRef<HTMLDivElement>;
  
  constructor() {
    this.roomId.set(this.route.snapshot.paramMap.get('id') || 'error');
    if (typeof window !== 'undefined') {
        this.isChatVisible.set(window.innerWidth >= 768);
    }
  }

  ngAfterViewInit() {
    (window as any)?.lucide?.createIcons();
  }

  ngOnDestroy() {
    this.stopMediaTracks();
  }

  toggleChat() {
    this.isChatVisible.update(visible => !visible);
    setTimeout(() => (window as any)?.lucide?.createIcons(), 0);
  }

  loadVideo(event: Event) {
    event.preventDefault();
    const input = (event.target as HTMLFormElement).querySelector('input');
    if (input && input.value) {
        const url = input.value.trim();
        const embedInfo = this.getEmbedUrl(url);
        
        if (embedInfo.isEmbedded) {
          this.rawEmbedUrl.set(embedInfo.url);
          this.isEmbeddedVideo.set(true);
          this.videoUrl.set('');
        } else {
          this.videoUrl.set(url);
          this.isEmbeddedVideo.set(false);
          this.rawEmbedUrl.set('');
        }
    }
  }

  private getEmbedUrl(url: string): { url: string; isEmbedded: boolean } {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        url: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&controls=1`,
        isEmbedded: true
      };
    }

    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
        isEmbedded: true
      };
    }

    // Dailymotion
    const dailymotionRegex = /dailymotion\.com\/video\/([^_]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    if (dailymotionMatch) {
      return {
        url: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
        isEmbedded: true
      };
    }

    // Twitch
    const twitchRegex = /twitch\.tv\/videos\/(\d+)/;
    const twitchMatch = url.match(twitchRegex);
    if (twitchMatch) {
      return {
        url: `https://player.twitch.tv/?video=${twitchMatch[1]}&parent=${window.location.hostname}`,
        isEmbedded: true
      };
    }

    // Direct video file or unsupported - fallback to video tag
    return { url, isEmbedded: false };
  }

  toggleCamera() {
    this.isCameraOn.update(on => !on);
    this.updateMediaStream();
    setTimeout(() => (window as any)?.lucide?.createIcons(), 0);
  }

  toggleMic() {
    this.isMicOn.update(on => !on);
    this.updateMediaStream();
    setTimeout(() => (window as any)?.lucide?.createIcons(), 0);
  }

  private async updateMediaStream() {
    this.stopMediaTracks();

    const video = this.isCameraOn();
    const audio = this.isMicOn();

    if (!video && !audio) {
      return;
    }

    try {
      const constraints = { video, audio };
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.userVideo.nativeElement.srcObject = this.localStream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      // Reset toggles if permission is denied
      if (video) this.isCameraOn.set(false);
      if (audio) this.isMicOn.set(false);
      setTimeout(() => (window as any)?.lucide?.createIcons(), 0);
    }
  }

  private stopMediaTracks() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      if (this.userVideo?.nativeElement) {
        this.userVideo.nativeElement.srcObject = null;
      }
    }
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const inputEl = this.messageInput.nativeElement;
    const text = inputEl.value.trim();
    if (text) {
      const newMessage: Message = {
        id: this.messages().length + 1,
        user: 'You',
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      this.messages.update(msgs => [...msgs, newMessage]);
      inputEl.value = '';
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }
}
