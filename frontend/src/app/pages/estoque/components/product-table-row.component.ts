import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideAlertCircle, 
  lucidePencil, 
  lucideTrash2 
} from '@ng-icons/lucide';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardTableImports } from '@/shared/components/table';
import { Produto } from '../../../models/models';

@Component({
  selector: '[app-product-table-row]',
  standalone: true,
  imports: [
    CommonModule, 
    CurrencyPipe, 
    ZardBadgeComponent, 
    ZardButtonComponent, 
    ...ZardTableImports, 
    NgIcon
  ],
  providers: [
    provideIcons({ lucideAlertCircle, lucidePencil, lucideTrash2 })
  ],
  host: {
    'class': 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group'
  },
  template: `
    <td z-table-cell class="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">#{{ produto.id }}</td>
    <td z-table-cell class="font-bold text-zinc-900 dark:text-zinc-100">{{ produto.nome }}</td>
    <td z-table-cell class="hidden md:table-cell text-muted-foreground italic text-sm">
      {{ produto.descricao || '—' }}
    </td>
    <td z-table-cell class="text-right font-black text-zinc-900 dark:text-zinc-100 italic">
      {{ produto.preco | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
    </td>
    <td z-table-cell class="text-center">
      @if (produto.quantidadeEstoque === 0) {
        <z-badge zType="destructive" zShape="pill" class="animate-pulse shadow-sm shadow-destructive/20 px-3 font-bold">
          <ng-icon name="lucideAlertCircle" size="14" class="mr-1" />
          ESGOTADO
        </z-badge>
      } @else {
        <z-badge [zType]="produto.quantidadeEstoque <= 5 ? 'destructive' : 'secondary'" zShape="pill" class="font-bold">
          {{ produto.quantidadeEstoque }} un.
        </z-badge>
      }
    </td>
    <td z-table-cell class="text-right">
      <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          z-button 
          zType="ghost" 
          zSize="sm" 
          class="text-primary hover:bg-primary/20"
          (click)="onEdit.emit(produto)"
        >
          <ng-icon name="lucidePencil" size="16" />
        </button>
        <button 
          z-button 
          zType="ghost" 
          zSize="sm" 
          class="text-destructive hover:bg-destructive/20"
          (click)="onDelete.emit(produto)"
          [zLoading]="isDeleting"
        >
          <ng-icon name="lucideTrash2" size="16" />
        </button>
      </div>
    </td>
  `
})
export class ProductTableRowComponent {
  @Input({ required: true }) produto!: Produto;
  @Input() isDeleting = false;

  @Output() onEdit = new EventEmitter<Produto>();
  @Output() onDelete = new EventEmitter<Produto>();
}
