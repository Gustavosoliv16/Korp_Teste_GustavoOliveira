import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutImports } from '@/shared/components/layout';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideLayoutDashboard, 
  lucidePackage, 
  lucideFileText, 
  lucidePlusCircle,
  lucideReceipt
} from '@ng-icons/lucide';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ...LayoutImports, NgIcon],
  providers: [
    provideIcons({ 
      lucideLayoutDashboard, 
      lucidePackage, 
      lucideFileText, 
      lucidePlusCircle,
      lucideReceipt
    })
  ],
  template: `
    <z-sidebar class="border-r bg-sidebar" [zWidth]="240">
      <div class="p-6">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ng-icon name="lucideReceipt" size="20" />
          </div>
          <span>Sistema<span class="text-primary">NFe</span></span>
        </a>
      </div>

      <z-sidebar-group>
        <z-sidebar-group-label>Menu Principal</z-sidebar-group-label>
        
        <nav class="flex flex-col gap-1 p-2">
          <a routerLink="/" 
             routerLinkActive="bg-accent text-accent-foreground" 
             [routerLinkActiveOptions]="{exact:true}"
             class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <ng-icon name="lucideLayoutDashboard" size="18" />
            Dashboard
          </a>
          
          <a routerLink="/estoque" 
             routerLinkActive="bg-accent text-accent-foreground"
             class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <ng-icon name="lucidePackage" size="18" />
            Estoque
          </a>
          
          <a routerLink="/notas" 
             routerLinkActive="bg-accent text-accent-foreground"
             class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            <ng-icon name="lucideFileText" size="18" />
            Notas Fiscais
          </a>
        </nav>
      </z-sidebar-group>

      <z-sidebar-group class="mt-auto p-4">
        <a routerLink="/emitir" 
           class="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
          <ng-icon name="lucidePlusCircle" size="18" />
          Emitir Nova NF
        </a>
      </z-sidebar-group>
    </z-sidebar>
  `
})
export class SidebarNavComponent {}
