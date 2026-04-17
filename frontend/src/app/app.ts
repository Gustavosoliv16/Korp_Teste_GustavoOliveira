import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';
import { LayoutImports } from '@/shared/components/layout';
import { ZardToastComponent } from '@/shared/components/toast';
import { ThemeService } from './services/theme.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSun, lucideMoon } from '@ng-icons/lucide';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarNavComponent, ...LayoutImports, ZardToastComponent, NgIcon],
  providers: [provideIcons({ lucideSun, lucideMoon })],
  template: `
    <z-layout zDirection="horizontal" class="min-h-screen relative">
      <app-sidebar-nav />
      <z-content class="bg-background !p-0">
        <z-header [zHeight]="56" class="sticky top-0 z-10 flex items-center border-b bg-background/95 px-6 backdrop-blur">
          <h1 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sistema de NF-e</h1>
        </z-header>
        <main class="p-6 page-enter">
          <router-outlet />
        </main>
      </z-content>
      
      <!-- Botão de Tema Flutuante (Fora do Header) -->
      <button 
        class="fixed top-3 right-6 z-50 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted transition-colors shadow-sm"
        (click)="theme.toggleDarkMode()"
        [title]="theme.isDarkMode() ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'"
      >
        <ng-icon [name]="theme.isDarkMode() ? 'lucideSun' : 'lucideMoon'" size="18" class="text-foreground" />
      </button>
    </z-layout>
    
    <z-toaster position="top-right" [richColors]="true" />
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class App {
  theme = inject(ThemeService);
}
