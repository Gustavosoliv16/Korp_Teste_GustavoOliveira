import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { Produto, CreateProdutoDto } from '../../models/models';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page-enter" style="padding: 2rem; max-width: 1280px; margin: 0 auto;">

      <!-- Header -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0 0 0.25rem;">Controle de</p>
          <h1 style="font-family: var(--font-tight); font-size: 1.75rem; font-weight: 800; letter-spacing: -0.04em; margin: 0;">Estoque de Produtos</h1>
          <p style="color: var(--text-secondary); margin: 0.375rem 0 0; font-size: 0.875rem;">
            {{ produtos().length }} produto(s) cadastrado(s)
          </p>
        </div>
        <button id="btn-add-produto" class="btn-primary" (click)="showForm.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          Novo Produto
        </button>
      </div>

      <!-- Add Product Form -->
      @if (showForm()) {
        <div class="glass-card" style="padding: 1.5rem; margin-bottom: 1.5rem; border-color: rgba(99,102,241,0.25);">
          <h2 style="font-size: 1rem; font-weight: 600; margin: 0 0 1.25rem; color: var(--text-primary);">
            Cadastrar Novo Produto
          </h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="field-group">
              <label class="field-label" for="nome">Nome do Produto *</label>
              <input id="nome" class="field-input" type="text" [(ngModel)]="form.nome" placeholder="Ex: Notebook Dell Inspiron 15" />
            </div>
            <div class="field-group">
              <label class="field-label" for="preco">Preço Unitário (R$) *</label>
              <input id="preco" class="field-input" type="number" [(ngModel)]="form.preco" placeholder="0,00" min="0" step="0.01" />
            </div>
            <div class="field-group" style="grid-column: 1 / -1;">
              <label class="field-label" for="descricao">Descrição</label>
              <input id="descricao" class="field-input" type="text" [(ngModel)]="form.descricao" placeholder="Descrição detalhada do produto..." />
            </div>
            <div class="field-group">
              <label class="field-label" for="qtd">Quantidade em Estoque *</label>
              <input id="qtd" class="field-input" type="number" [(ngModel)]="form.quantidadeEstoque" placeholder="0" min="0" />
            </div>
          </div>
          <div style="display: flex; gap: 0.75rem; margin-top: 1.25rem; justify-content: flex-end;">
            <button class="btn-ghost" (click)="cancelForm()">Cancelar</button>
            <button id="btn-salvar-produto" class="btn-primary" [disabled]="saving()" (click)="salvarProduto()">
              @if (saving()) {
                <span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
                Salvando...
              } @else {
                Salvar Produto
              }
            </button>
          </div>
        </div>
      }

      <!-- Products Table -->
      @if (loading()) {
        <div style="display: flex; align-items: center; justify-content: center; height: 260px;">
          <div style="text-align: center;">
            <div class="spinner" style="width: 40px; height: 40px; border-width: 3px; margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Carregando produtos...</p>
          </div>
        </div>
      } @else if (produtos().length === 0) {
        <div class="glass-card" style="padding: 4rem 2rem; text-align: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity: 0.25; margin: 0 auto 1rem; display: block;"><path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="1.5"/><path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" stroke-width="1.5"/></svg>
          <p style="color: var(--text-muted); font-size: 1rem; margin: 0 0 1rem;">Nenhum produto cadastrado.</p>
          <button class="btn-primary" (click)="showForm.set(true)">Cadastrar primeiro produto</button>
        </div>
      } @else {
        <div class="glass-card" style="overflow: hidden; padding: 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="width: 60px;">ID</th>
                <th>Produto</th>
                <th>Descrição</th>
                <th style="text-align: right;">Preço Unit.</th>
                <th style="text-align: center;">Estoque</th>
                <th style="width: 80px;"></th>
              </tr>
            </thead>
            <tbody>
              @for (produto of produtos(); track produto.id) {
                <tr class="table-row">
                  <td>
                    <span style="font-family: monospace; font-size: 0.8125rem; color: var(--text-muted);">#{{ produto.id }}</span>
                  </td>
                  <td>
                    <span style="font-weight: 600; font-size: 0.9375rem;">{{ produto.nome }}</span>
                  </td>
                  <td>
                    <span style="color: var(--text-secondary); font-size: 0.875rem;">{{ produto.descricao || '—' }}</span>
                  </td>
                  <td style="text-align: right;">
                    <span style="font-weight: 600; font-family: var(--font-tight);">
                      {{ produto.preco | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <span
                      class="badge"
                      [style]="produto.quantidadeEstoque <= 5 ? 'background: rgba(239,68,68,0.15); color: #fca5a5; border-color: rgba(239,68,68,0.25);' : 'background: rgba(16,185,129,0.15); color: #34d399; border-color: rgba(16,185,129,0.25);'"
                    >
                      {{ produto.quantidadeEstoque }} un.
                    </span>
                  </td>
                  <td>
                    <button
                      [id]="'btn-delete-' + produto.id"
                      class="btn-icon-danger"
                      (click)="deleteProduto(produto)"
                      [disabled]="deleting() === produto.id"
                      title="Excluir produto"
                    >
                      @if (deleting() === produto.id) {
                        <span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
                      } @else {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      }
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .btn-primary {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--accent-primary); color: white;
      border: none; border-radius: 10px; padding: 0.625rem 1.125rem;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn-primary:hover:not(:disabled) { background: var(--accent-primary-hover); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn-ghost {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: transparent; color: var(--text-secondary);
      border: 1px solid var(--border-default); border-radius: 10px;
      padding: 0.625rem 1.125rem; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-ghost:hover { background: var(--bg-elevated); color: var(--text-primary); }

    .btn-icon-danger {
      background: transparent; border: none; cursor: pointer;
      color: var(--text-muted); padding: 0.375rem;
      border-radius: 6px; transition: all 0.2s; display: flex; align-items: center;
    }
    .btn-icon-danger:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: #fca5a5; }
    .btn-icon-danger:disabled { opacity: 0.5; cursor: not-allowed; }

    .field-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .field-label { font-size: 0.8125rem; font-weight: 500; color: var(--text-secondary); }
    .field-input {
      background: var(--bg-elevated); border: 1px solid var(--border-default);
      border-radius: 8px; padding: 0.625rem 0.875rem;
      color: var(--text-primary); font-size: 0.875rem; font-family: inherit;
      transition: border-color 0.2s; outline: none; width: 100%; box-sizing: border-box;
    }
    .field-input:focus { border-color: var(--accent-primary); }
    .field-input::placeholder { color: var(--text-muted); }

    .data-table th {
      padding: 0.875rem 1.25rem; text-align: left;
      font-size: 0.75rem; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.06em;
      background: var(--bg-elevated); border-bottom: 1px solid var(--border-subtle);
    }
    .data-table td { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-subtle); }
    .table-row { transition: background 0.15s; }
    .table-row:hover td { background: var(--bg-elevated); }
    .table-row:last-child td { border-bottom: none; }
  `]
})
export class EstoqueComponent implements OnInit {
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);

  produtos = signal<Produto[]>([]);
  loading = signal(true);
  saving = signal(false);
  deleting = signal<number | null>(null);
  showForm = signal(false);

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
        this.toastService.error('Erro ao carregar produtos', 'Verifique se a API de Estoque está ativa na porta 5001.');
      }
    });
  }

  salvarProduto(): void {
    if (!this.form.nome || this.form.preco <= 0) {
      this.toastService.warning('Campos obrigatórios', 'Preencha o nome e o preço do produto.');
      return;
    }
    this.saving.set(true);
    this.estoqueService.createProduto(this.form).subscribe({
      next: (novo) => {
        this.produtos.update(list => [...list, novo]);
        this.toastService.success('Produto criado!', `"${novo.nome}" adicionado ao estoque.`);
        this.cancelForm();
        this.saving.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error('Erro ao criar produto', 'Verifique os dados e tente novamente.');
      }
    });
  }

  deleteProduto(produto: Produto): void {
    if (!confirm(`Deseja excluir "${produto.nome}"?`)) return;
    this.deleting.set(produto.id);
    this.estoqueService.deleteProduto(produto.id).subscribe({
      next: () => {
        this.produtos.update(list => list.filter(p => p.id !== produto.id));
        this.toastService.success('Produto excluído', `"${produto.nome}" removido do estoque.`);
        this.deleting.set(null);
      },
      error: () => {
        this.deleting.set(null);
        this.toastService.error('Erro ao excluir', 'Não foi possível remover o produto.');
      }
    });
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.form = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0 };
  }
}
