import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <!-- Logo -->
        <a routerLink="/" class="nav-logo">
          <div class="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">Sistema<span class="logo-accent">NFe</span></span>
        </a>

        <!-- Nav Links -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="nav-link-active" [routerLinkActiveOptions]="{exact:true}" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9 21 9 15 12 15C15 15 15 21 15 21M9 21H15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Dashboard
          </a>
          <a routerLink="/estoque" routerLinkActive="nav-link-active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 12V16M10 14H14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
            Estoque
          </a>
          <a routerLink="/notas" routerLinkActive="nav-link-active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
            Notas Fiscais
          </a>
          <a routerLink="/emitir" routerLinkActive="nav-link-active" class="nav-link nav-link-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Emitir NF
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(10, 10, 15, 0.80);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-subtle);
    }
    .navbar-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      text-decoration: none;
      color: var(--text-primary);
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }
    .logo-text {
      font-family: var(--font-tight);
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .logo-accent { color: var(--accent-primary); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.875rem;
      border-radius: 8px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .nav-link:hover {
      background: var(--bg-elevated);
      color: var(--text-primary);
    }
    .nav-link-active {
      background: rgba(99, 102, 241, 0.15) !important;
      color: #a5b4fc !important;
    }
    .nav-link-cta {
      background: var(--accent-primary);
      color: white !important;
      margin-left: 0.5rem;
    }
    .nav-link-cta:hover {
      background: var(--accent-primary-hover) !important;
      color: white !important;
    }
    .nav-link-cta.nav-link-active {
      background: var(--accent-primary-hover) !important;
      color: white !important;
    }

    @media (max-width: 640px) {
      .nav-links { gap: 0; }
      .nav-link span, .nav-link svg + * { display: none; }
    }
  `]
})
export class NavbarComponent {}
