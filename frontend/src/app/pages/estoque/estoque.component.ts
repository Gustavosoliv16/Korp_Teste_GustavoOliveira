import { Component, OnInit, inject, signal, viewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { Produto, CreateProdutoDto } from '../../models/models';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardTableImports } from '@/shared/components/table';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucidePackage, 
  lucidePlus, 
  lucideTrash2, 
  lucideSearch, 
  lucideAlertCircle,
  lucidePackagePlus,
  lucidePencil
} from '@ng-icons/lucide';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [
    FormsModule, 
    CurrencyPipe, 
    ZardCardComponent, 
    ...ZardTableImports, 
    ZardButtonComponent, 
    ZardInputDirective,
    ZardBadgeComponent,
    NgIcon
  ],
  providers: [
    provideIcons({ 
      lucidePackage, 
      lucidePlus, 
      lucideTrash2, 
      lucideSearch, 
      lucideAlertCircle,
      lucidePackagePlus,
      lucidePencil
    })
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Estoque</h2>
          <p class="text-muted-foreground">
            {{ produtos().length }} produto(s) cadastrado(s) no sistema.
          </p>
        </div>
        <button z-button (click)="openAddModal(content)">
          <ng-icon name="lucidePackagePlus" size="18" class="mr-2" />
          Novo Produto
        </button>
      </div>

      <!-- Main Table Card -->
      <z-card class="overflow-hidden">
        <table z-table>
          <thead z-table-header>
            <tr z-table-row>
              <th z-table-head class="w-[80px]">ID</th>
              <th z-table-head>Produto</th>
              <th z-table-head class="hidden md:table-cell">Descrição</th>
              <th z-table-head class="text-right">Preço</th>
              <th z-table-head class="text-center">Qtd. Estoque</th>
              <th z-table-head class="w-[80px] text-right">Ações</th>
            </tr>
          </thead>
          <tbody z-table-body>
            @if (loading()) {
              @for (i of [1,2,3,4,5]; track i) {
                <tr z-table-row>
                  <td z-table-cell><div class="h-4 w-8 animate-pulse rounded bg-muted"></div></td>
                  <td z-table-cell><div class="h-4 w-32 animate-pulse rounded bg-muted"></div></td>
                  <td z-table-cell class="hidden md:table-cell"><div class="h-4 w-48 animate-pulse rounded bg-muted"></div></td>
                  <td z-table-cell><div class="ml-auto h-4 w-20 animate-pulse rounded bg-muted"></div></td>
                  <td z-table-cell><div class="mx-auto h-6 w-12 animate-pulse rounded-full bg-muted"></div></td>
                  <td z-table-cell><div class="ml-auto h-8 w-8 animate-pulse rounded bg-muted"></div></td>
                </tr>
              }
            } @else if (produtos().length === 0) {
              <tr z-table-row>
                <td z-table-cell colspan="6" class="h-32 text-center text-muted-foreground">
                  Nenhum produto encontrado.
                </td>
              </tr>
            } @else {
              @for (produto of produtos(); track produto.id) {
                <tr z-table-row>
                  <td z-table-cell class="font-mono text-xs text-muted-foreground">#{{ produto.id }}</td>
                  <td z-table-cell class="font-medium">{{ produto.nome }}</td>
                  <td z-table-cell class="hidden md:table-cell text-muted-foreground italic text-sm">
                    {{ produto.descricao || '—' }}
                  </td>
                  <td z-table-cell class="text-right font-semibold">
                    {{ produto.preco | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </td>
                  <td z-table-cell class="text-center">
                    @if (produto.quantidadeEstoque === 0) {
                      <z-badge zType="destructive" zShape="pill" class="animate-pulse shadow-sm shadow-destructive/20 px-3">
                        <ng-icon name="lucideAlertCircle" size="14" class="mr-1" />
                        ESGOTADO
                      </z-badge>
                    } @else {
                      <z-badge [zType]="produto.quantidadeEstoque <= 5 ? 'destructive' : 'secondary'" zShape="pill">
                        {{ produto.quantidadeEstoque }} un.
                      </z-badge>
                    }
                  </td>
                  <td z-table-cell class="text-right">
                    <div class="flex justify-end gap-1">
                      <button 
                        z-button 
                        zType="ghost" 
                        zSize="sm" 
                        class="text-primary hover:bg-primary/10"
                        (click)="openEditModal(content, produto)"
                      >
                        <ng-icon name="lucidePencil" size="16" />
                      </button>
                      <button 
                        z-button 
                        zType="ghost" 
                        zSize="sm" 
                        class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        (click)="deleteProduto(produto)"
                        [zLoading]="deleting() === produto.id"
                      >
                        <ng-icon name="lucideTrash2" size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </z-card>
    </div>

    <!-- Modal Template for Adding Product -->
    <ng-template #content let-dialogRef="dialogRef">
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="nome">Nome do Produto</label>
          <input id="nome" z-input [(ngModel)]="form.nome" placeholder="Ex: Notebook Dell" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none" for="preco">Preço (R$)</label>
            <input id="preco" z-input type="number" [(ngModel)]="form.preco" placeholder="0.00" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none" for="qtd">Quantidade</label>
            <input 
              id="qtd" 
              z-input 
              type="number" 
              min="0" 
              (keydown)="preventInvalidChars($event)" 
              [(ngModel)]="form.quantidadeEstoque" 
              placeholder="0" 
            />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="descricao">Descrição</label>
          <textarea id="descricao" z-input [(ngModel)]="form.descricao" placeholder="Detalhes do produto..."></textarea>
        </div>
      </div>
      
      <div card-footer class="flex justify-end gap-2 pt-4">
        <button z-button zType="outline" (click)="dialogRef.close()">Cancelar</button>
        <button z-button (click)="salvarProduto(dialogRef)" [zLoading]="saving()">
          {{ editingId() ? 'Atualizar Produto' : 'Salvar Produto' }}
        </button>
      </div>
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

  form: CreateProdutoDto = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0 };

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
    this.editingId.set(null);
    this.form = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0 };
    this.dialogService.create({
      zTitle: 'Cadastrar Novo Produto',
      zDescription: 'Preencha as informações para adicionar um item ao estoque.',
      zContent: template,
      zWidth: '500px',
      zHideFooter: true
    });
  }

  openEditModal(template: TemplateRef<any>, produto: Produto): void {
    this.editingId.set(produto.id);
    this.form = { 
      nome: produto.nome, 
      descricao: produto.descricao || '', 
      preco: produto.preco, 
      quantidadeEstoque: produto.quantidadeEstoque 
    };
    this.dialogService.create({
      zTitle: 'Editar Produto',
      zDescription: `Editando informações do produto #${produto.id}.`,
      zContent: template,
      zWidth: '500px',
      zHideFooter: true
    });
  }

  salvarProduto(dialogRef: any): void {
    if (!this.form.nome || this.form.preco < 0 || this.form.quantidadeEstoque < 0) {
      this.toastService.warning('Campos inválidos', 'Preencha o nome corretamente e garanta que valores não sejam negativos.');
      return;
    }
    
    this.saving.set(true);
    const id = this.editingId();

    if (id) {
      // Update
      this.estoqueService.updateProduto(id, this.form).subscribe({
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
      this.estoqueService.createProduto(this.form).subscribe({
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
    this.form = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0 };
    this.editingId.set(null);
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

  preventInvalidChars(event: KeyboardEvent): void {
    // Permite apenas números (códigos de tecla para números do teclado e teclado numérico) e teclas de controle (backspace, setas, etc.)
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    if (
      !allowedKeys.includes(event.key) && 
      (event.key < '0' || event.key > '9')
    ) {
      event.preventDefault();
    }
  }
}
