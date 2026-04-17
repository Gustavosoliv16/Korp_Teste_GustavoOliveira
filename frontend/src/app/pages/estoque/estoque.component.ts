import { Component, OnInit, inject, signal, TemplateRef, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { Produto, CreateProdutoDto } from '../../models/models';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardTableComponent, ZardTableHeaderComponent, ZardTableBodyComponent, ZardTableHeadComponent } from '@/shared/components/table/table.component';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucidePackage, 
  lucidePlus, 
  lucideTrash2, 
  lucideSearch, 
  lucideAlertCircle,
  lucidePackagePlus,
  lucidePencil,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';

import { ProductFormModalComponent } from './components/product-form-modal.component';
import { ProductTableRowComponent } from './components/product-table-row.component';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    ZardCardComponent, 
    ZardTableComponent,
    ZardTableHeaderComponent,
    ZardTableBodyComponent,
    ZardTableHeadComponent,
    ZardButtonComponent, 
    NgIcon,
    ProductFormModalComponent,
    ProductTableRowComponent
  ],
  providers: [
    provideIcons({ 
      lucidePackage, 
      lucidePlus, 
      lucideTrash2, 
      lucideSearch, 
      lucideAlertCircle, 
      lucidePackagePlus, 
      lucidePencil,
      lucideChevronLeft,
      lucideChevronRight
    })
  ],
  template: `
    <div class="space-y-6">
      <!-- Search and Actions -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm shadow-sm transition-all">
        <div class="relative w-full md:w-96 group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
            <ng-icon name="lucideSearch" size="18" />
          </div>
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (ngModelChange)="currentPage.set(1)"
            placeholder="Pesquisar por descrição ou código..."
            class="w-full h-11 pl-10 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
          />
        </div>
        
        <button z-button (click)="openAddModal(content)" class="w-full md:w-auto shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
          <ng-icon name="lucidePackagePlus" size="18" class="mr-2" />
          Novo Produto
        </button>
      </div>

      <!-- Main Table Card -->
      <z-card class="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-xl">
        <table z-table>
          <thead z-table-header>
            <tr z-table-row>
              <th z-table-head class="w-[80px]">Código</th>
              <th z-table-head>Descrição</th>
              <th z-table-head class="hidden md:table-cell">Detalhes</th>
              <th z-table-head class="text-right">Preço</th>
              <th z-table-head class="text-center">Saldo</th>
              <th z-table-head class="w-[80px] text-right">Ações</th>
            </tr>
          </thead>
          <tbody z-table-body>
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr z-table-row>
                  <td z-table-cell><div class="h-4 w-8 animate-pulse rounded bg-muted/50"></div></td>
                  <td z-table-cell><div class="h-4 w-32 animate-pulse rounded bg-muted/50"></div></td>
                  <td z-table-cell class="hidden md:table-cell"><div class="h-4 w-48 animate-pulse rounded bg-muted/50"></div></td>
                  <td z-table-cell><div class="ml-auto h-4 w-20 animate-pulse rounded bg-muted/50"></div></td>
                  <td z-table-cell><div class="mx-auto h-6 w-12 animate-pulse rounded-full bg-muted/50"></div></td>
                  <td z-table-cell><div class="ml-auto h-8 w-8 animate-pulse rounded bg-muted/50"></div></td>
                </tr>
              }
            } @else if (pagedProdutos().length === 0) {
              <tr z-table-row>
                <td z-table-cell colspan="6" class="h-48 text-center">
                  <div class="flex flex-col items-center justify-center opacity-40 py-8">
                    <ng-icon name="lucideSearch" size="48" class="mb-2" />
                    <p class="text-lg font-bold text-zinc-500">Nenhum produto encontrado</p>
                    <p class="text-sm text-zinc-400">Tente ajustar o termo de pesquisa ou filtros.</p>
                  </div>
                </td>
              </tr>
            } @else {
              @for (produto of pagedProdutos(); track produto.id) {
                <tr app-product-table-row
                    [produto]="produto"
                    [isDeleting]="deleting() === produto.id"
                    (onEdit)="openEditModal(content, $event)"
                    (onDelete)="deleteProduto($event)"
                    class="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                </tr>
              }
            }
          </tbody>
        </table>

        <!-- Pagination Footer -->
        @if (totalPages() > 1) {
          <div class="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/40">
            <p class="text-xs text-zinc-500 font-medium">
              Exibindo <span class="text-zinc-900 dark:text-zinc-100 font-bold">{{ (currentPage() - 1) * pageSize + 1 }}-{{ Math.min(currentPage() * pageSize, filteredProdutos().length) }}</span> 
              de <span class="text-zinc-900 dark:text-zinc-100 font-bold">{{ filteredProdutos().length }}</span> produtos
            </p>
            
            <div class="flex items-center gap-1">
              <button 
                z-button 
                zType="outline" 
                zSize="sm" 
                [disabled]="currentPage() === 1"
                (click)="currentPage.set(currentPage() - 1)"
                class="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                <ng-icon name="lucideChevronLeft" size="20" />
              </button>
              
              <div class="flex items-center gap-1 mx-4">
                <span class="text-sm font-black text-primary">{{ currentPage() }}</span>
                <span class="text-xs text-zinc-400 italic">/ {{ totalPages() }}</span>
              </div>

              <button 
                z-button 
                zType="outline" 
                zSize="sm" 
                [disabled]="currentPage() === totalPages()"
                (click)="currentPage.set(currentPage() + 1)"
                class="h-9 w-9 p-0 rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                <ng-icon name="lucideChevronRight" size="20" />
              </button>
            </div>
          </div>
        }
      </z-card>
    </div>

    <!-- Modal Template using the new component -->
    <ng-template #content let-dialogRef="dialogRef">
      <app-product-form-modal 
        [produto]="editingProduto()" 
        [saving]="saving()" 
        (onSave)="salvarProduto($event, dialogRef)" 
        (onCancel)="dialogRef.close()"
      />
    </ng-template>
  `
})
export class EstoqueComponent implements OnInit {
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);
  private dialogService = inject(ZardDialogService);

  produtos = signal<Produto[]>([]);
  loading = signal(true);
  saving = signal(false);
  deleting = signal<number | null>(null);
  editingId = signal<number | null>(null);

  // Search & Pagination Signals
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = 15;
  Math = Math; // Para usar no template

  filteredProdutos = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.produtos();
    
    return this.produtos().filter(p => 
      p.nome.toLowerCase().includes(query) || 
      (p.descricao && p.descricao.toLowerCase().includes(query))
    );
  });

  pagedProdutos = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProdutos().slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredProdutos().length / this.pageSize);
  });

  editingProduto = signal<Produto | null>(null);

  ngOnInit(): void {
    this.loadProdutos();
  }

  loadProdutos(): void {
    this.loading.set(true);
    this.estoqueService.getProdutos().subscribe({
      next: (list) => { this.produtos.set(list); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Erro ao carregar produtos', 'API de Estoque indisponível na porta 5001.');
      }
    });
  }

  openAddModal(template: TemplateRef<any>): void {
    this.editingProduto.set(null);
    this.dialogService.create({
      zTitle: 'Cadastrar Novo Produto',
      zDescription: 'Preencha as informações para adicionar um item ao estoque.',
      zContent: template,
      zWidth: '500px',
      zHideFooter: true
    });
  }

  openEditModal(template: TemplateRef<any>, produto: Produto): void {
    this.editingProduto.set(produto);
    this.dialogService.create({
      zTitle: 'Editar Produto',
      zDescription: `Editando informações do produto #${produto.id}.`,
      zContent: template,
      zWidth: '500px',
      zHideFooter: true
    });
  }

  salvarProduto(form: CreateProdutoDto, dialogRef: any): void {
    this.saving.set(true);
    const id = this.editingProduto()?.id;

    if (id) {
      // Update
      this.estoqueService.updateProduto(id, form).subscribe({
        next: (atualizado) => {
          this.produtos.update(list => list.map(p => p.id === id ? atualizado : p));
          this.toastService.success('Produto atualizado!', `"${atualizado.nome}" foi alterado.`);
          this.finishSave(dialogRef);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Erro ao atualizar produto');
        }
      });
    } else {
      // Create
      this.estoqueService.createProduto(form).subscribe({
        next: (novo) => {
          this.produtos.update(list => [...list, novo]);
          this.toastService.success('Produto criado!', `"${novo.nome}" adicionado.`);
          this.finishSave(dialogRef);
        },
        error: () => {
          this.saving.set(false);
          this.toastService.error('Erro ao criar produto');
        }
      });
    }
  }

  private finishSave(dialogRef: any): void {
    this.editingProduto.set(null);
    this.saving.set(false);
    dialogRef.close();
  }

  deleteProduto(produto: Produto): void {
    if (!confirm(`Deseja excluir "${produto.nome}"?`)) return;
    this.deleting.set(produto.id);
    this.estoqueService.deleteProduto(produto.id).subscribe({
      next: () => {
        this.produtos.update(list => list.filter(p => p.id !== produto.id));
        this.toastService.success('Produto excluído', `"${produto.nome}" removido.`);
        this.deleting.set(null);
      },
      error: () => {
        this.deleting.set(null);
        this.toastService.error('Erro ao excluir');
      }
    });
  }
}
