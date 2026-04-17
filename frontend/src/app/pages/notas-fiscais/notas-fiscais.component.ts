import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { ToastService } from '../../services/toast.service';
import { NotaFiscal } from '../../models/models';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideFileText, 
  lucideRefreshCcw, 
  lucidePrinter, 
  lucideCheckCircle, 
  lucideClock, 
  lucideCalendar,
  lucideUser,
  lucideHash,
  lucideBot,
  lucideChevronDown,
  lucideSearch,
  lucideMoon,
  lucideSun,
  lucideEdit,
  lucidePlus,
  lucideTrash2,
  lucideSave,
  lucideX
} from '@ng-icons/lucide';
import { ThemeService } from '../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { EstoqueService } from '../../services/estoque.service';
import { Produto } from '../../models/models';
import { InvoiceCardComponent } from './components/invoice-card.component';
import { InvoiceEditModalComponent } from './components/invoice-edit-modal.component';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [
    ZardCardComponent, 
    ZardBadgeComponent, 
    ZardButtonComponent, 
    NgIcon, 
    FormsModule,
    InvoiceCardComponent,
    InvoiceEditModalComponent
  ],
  providers: [
    provideIcons({ 
      lucideRefreshCcw, 
      lucideSearch,
      lucideEdit
    })
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Notas Fiscais</h2>
          <p class="text-zinc-500">
            {{ notasAbertas() }} aberta(s) · {{ notasFechadas() }} fechada(s)
          </p>
        </div>
        <div class="flex items-center gap-3">
          <button
            z-button
            zType="outline"
            zSize="sm"
            (click)="loadNotas()"
          >
            <ng-icon name="lucideRefreshCcw" size="16" class="mr-2" [class.animate-spin]="loading()" />
            Atualizar
          </button>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
        <div class="flex flex-wrap gap-2">
          @for (tab of tabs; track tab.value) {
            <button
              z-button
              [zType]="activeFilter() === tab.value ? 'default' : 'outline'"
              zSize="sm"
              zShape="circle"
              (click)="activeFilter.set(tab.value)"
            >
              {{ tab.label }}
              <z-badge 
                class="ml-2 px-1.5 h-4 min-w-4 text-[10px]" 
                [zType]="activeFilter() === tab.value ? 'secondary' : 'outline'"
                zShape="pill"
              >
                {{ tab.value === 'all' ? notas().length : (tab.value === 'Aberta' ? notasAbertas() : notasFechadas()) }}
              </z-badge>
            </button>
          }
        </div>

        <div class="relative w-full md:w-80">
          <ng-icon name="lucideSearch" class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size="18" />
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar por NF ou cliente..."
            class="w-full h-10 pl-10 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <z-card class="h-40 animate-pulse bg-muted/50"></z-card>
          }
        </div>
      } @else if (filteredNotas().length === 0) {
        <z-card class="bg-zinc-50/50 dark:bg-zinc-900/50 py-16 text-center border-dashed">
          <div class="flex flex-col items-center">
            <div class="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
               <ng-icon name="lucideSearch" size="32" class="text-zinc-300" />
            </div>
            <h3 class="text-lg font-bold text-zinc-800 dark:text-zinc-200">Nenhuma nota encontrada</h3>
            <p class="text-sm text-zinc-500">Tente ajustar seus filtros ou termo de busca.</p>
          </div>
        </z-card>
      } @else {
        <div class="space-y-4">
          @for (nota of filteredNotas(); track nota.id) {
            <app-invoice-card 
              [nota]="nota"
              [isExpanded]="isExpanded(nota.id)"
              [isPrinting]="printing() === nota.id"
              (onPrint)="imprimirNota($event)"
              (onEdit)="editarNota($event)"
              (onToggleExpand)="toggleNota($event)"
            />
          } @empty {
            <z-card class="bg-zinc-50/50 dark:bg-zinc-900/50 py-16 text-center border-dashed">
              <div class="flex flex-col items-center">
                <div class="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                   <ng-icon name="lucideSearch" size="32" class="text-zinc-300" />
                </div>
                <h3 class="text-lg font-bold text-zinc-800 dark:text-zinc-200">Nenhuma nota encontrada</h3>
                <p class="text-sm text-zinc-500">Tente ajustar seus filtros ou termo de busca.</p>
              </div>
            </z-card>
          }
        </div>

        <!-- Modal de Edição -->
        @if (isModalOpen() && editingNota()) {
          <app-invoice-edit-modal
            [nota]="editingNota()!"
            [produtos]="produtos()"
            [loading]="loadingModal()"
            (onClose)="closeModal()"
            (onSave)="salvarEdicao($event)"
          />
        }
      }
    </div>
  `,
  styles: []
})
export class NotasFiscaisComponent implements OnInit {
  private faturamentoService = inject(FaturamentoService);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  notas = signal<NotaFiscal[]>([]);
  produtos = signal<Produto[]>([]);
  loading = signal(true);
  loadingModal = signal(false);
  isModalOpen = signal(false);
  editingNota = signal<NotaFiscal | null>(null);


  printing = signal<number | null>(null);
  activeFilter = signal<string>('all');
  expandedNotes = signal<Set<number>>(new Set());
  searchTerm = signal('');

  tabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Abertas', value: 'Aberta' },
    { label: 'Fechadas', value: 'Fechada' },
  ];

  notasAbertas = computed(() => this.notas().filter(n => n.status === 'Aberta').length);
  notasFechadas = computed(() => this.notas().filter(n => n.status === 'Fechada').length);
  filteredNotas = computed(() => {
    const f = this.activeFilter();
    const term = this.searchTerm().toLowerCase();
    
    let list = [...this.notas()];
    
    // Filtro de Status
    if (f !== 'all') {
      list = list.filter(n => n.status === f);
    }
    
    // Filtro de Busca
    if (term) {
      list = list.filter(n => {
        const numStr = n.numeroSequencial.toString();
        const formattedNum = numStr.padStart(4, '0');
        const clientName = n.nomeCliente.toLowerCase();
        
        // Se o termo for puramente numérico, buscamos apenas a nota exata ou o formato 0001
        const isNumeric = /^\d+$/.test(term);
        if (isNumeric) {
          return numStr === term || formattedNum === term;
        }
        
        // Caso contrário, busca por nome (parcial) ou número (exato/formatado)
        return clientName.includes(term) || numStr === term || formattedNum.includes(term);
      });
    }
    
    return list.reverse();
  });

  ngOnInit(): void { 
    this.loadNotas(); 
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.estoqueService.getProdutos().subscribe({
      next: (list) => this.produtos.set(list),
      error: () => this.toastService.error('Erro', 'Não foi possível carregar produtos.')
    });
  }

  salvarEdicao(dto: any): void {
    const nota = this.editingNota();
    if (!nota) return;

    this.loadingModal.set(true);
    this.faturamentoService.atualizarNota(nota.id, dto).subscribe({
      next: () => {
        this.toastService.success('Sucesso', 'Nota fiscal atualizada com sucesso!');
        this.closeModal();
        this.loadNotas();
      },
      error: (err) => this.toastService.error('Erro', err?.error?.message || 'Erro ao atualizar nota.'),
      complete: () => this.loadingModal.set(false)
    });
  }

  editarNota(nota: NotaFiscal): void {
    this.editingNota.set(nota);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingNota.set(null);
  }

  loadNotas(): void {
    this.loading.set(true);
    this.faturamentoService.getNotas().subscribe({
      next: (list) => { this.notas.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erro ao carregar notas', 'API de Faturamento indisponível na porta 5000.');
      }
    });
  }

  imprimirNota(nota: NotaFiscal): void {
    this.printing.set(nota.id);
    const key = (window as any).crypto.randomUUID();

    this.faturamentoService.imprimirNota(nota.id, key).subscribe({
      next: (res) => {
        this.notas.update(list =>
          list.map(n => n.id === nota.id ? { ...res.nota } : n)
        );
        this.printing.set(null);
        this.toastService.success(
          res.message || 'Nota Fiscal fechada com sucesso!',
          `NF-${nota.numeroSequencial.toString().padStart(4,'0')} foi processada.`
        );
      },
      error: (err) => {
        this.printing.set(null);
        const status = err?.status;
        
        if (status === 503) {
          this.toastService.error(
            'Falha na Comunicação',
            'O sistema tentou restabelecer a conexão com o Estoque automaticamente, mas o serviço ainda está offline. Tente novamente em instantes.'
          );
        } else if (status === 400) {
          const msg = err?.error?.message || err?.error?.detail || 'Não há estoque suficiente.';
          this.toastService.warning('Saldo Insuficiente', msg);
        } else {
          this.toastService.error('Erro Inesperado', 'Ocorreu uma falha no processamento.');
        }
      }
    });
  }

  toggleNota(id: number): void {
    const set = new Set(this.expandedNotes());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.expandedNotes.set(set);
  }

  isExpanded(id: number): boolean {
    return this.expandedNotes().has(id);
  }
}
