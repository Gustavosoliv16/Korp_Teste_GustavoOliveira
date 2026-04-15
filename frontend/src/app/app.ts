import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarNavComponent } from './components/sidebar-nav/sidebar-nav.component';
import { LayoutImports } from '@/shared/components/layout';
import { ZardToastComponent } from '@/shared/components/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarNavComponent, ...LayoutImports, ZardToastComponent],
  template: `
    <z-layout zDirection="horizontal" class="min-h-screen">
      <app-sidebar-nav />
      <z-content class="bg-background !p-0">
        <z-header [zHeight]="56" class="sticky top-0 z-10 flex items-center gap-4 border-b bg-background/95 px-6 backdrop-blur">
          <h1 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sistema de NF-e</h1>
        </z-header>
        <main class="p-6 page-enter">
          <router-outlet />
        </main>
      </z-content>
    </z-layout>
    
    <z-toaster position="top-right" [richColors]="true" />
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class App {}
