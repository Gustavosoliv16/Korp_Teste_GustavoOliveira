import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { Produto, CreateNotaFiscalDto } from '../../models/models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-emitir-nota',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="page-enter" style="padding: 2rem; max-width: 900px; margin: 0 auto;">

      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0 0 0.25rem;">Formulário de</p>
        <h1 style="font-family: var(--font-tight); font-size: 1.75rem; font-weight: 800; letter-spacing: -0.04em; margin: 0;">Emissão de Nota Fiscal</h1>
        <p style="color: var(--text-secondary); margin: 0.375rem 0 0; font-size: 0.875rem;">
          Preencha os dados do cliente e adicione os produtos da nota.
        </p>
      </div>

      <!-- Step 1: Cliente -->
      <div class="glass-card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div class="step-badge">1</div>
          <h2 style="font-size: 1rem; font-weight: 600; margin: 0;">Dados do Cliente</h2>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="field-group">
            <label class="field-label" for="nomeCliente">Nome do Cliente *</label>
            <input id="nomeCliente" class="field-input" type="text" [(ngModel)]="form.nomeCliente" placeholder="Nome completo ou razão social" />
          </div>
          <div class="field-group">
            <label class="field-label" for="cpfCnpj">CPF / CNPJ *</label>
            <input id="cpfCnpj" class="field-input" type="text" [(ngModel)]="form.cpfCnpjCliente" placeholder="000.000.000-00 ou 00.000.000/0001-00" />
          </div>
        </div>
      </div>

      <!-- Step 2: Adicionar Itens -->
      <div class="glass-card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div class="step-badge">2</div>
          <h2 style="font-size: 1rem; font-weight: 600; margin: 0;">Produtos da Nota</h2>
        </div>

        <!-- Add Item Row -->
        <div style="display: grid; grid-template-columns: 3fr 1fr auto; gap: 0.75rem; align-items: end; margin-bottom: 1.25rem;">
          <div class="field-group">
            <label class="field-label" for="produtoSel">Produto *</label>
            <select id="produtoSel" class="field-input" [(ngModel)]="selectedProdutoId" (ngModelChange)="onProdutoChange($event)">
              <option value="">— Selecione um produto —</option>
              @for (p of produtos(); track p.id) {
                <option [value]="p.id" [disabled]="p.quantidadeEstoque === 0">
                  {{ p.nome }} (R$ {{ p.preco | number:'1.2-2':'pt-BR' }}) — {{ p.quantidadeEstoque }} un.
                </option>
              }
            </select>
          </div>
          <div class="field-group">
            <label class="field-label" for="qtdItem">Qtd *</label>
            <input id="qtdItem" class="field-input" type="number" [(ngModel)]="selectedQtd" placeholder="1" min="1" />
          </div>
          <button id="btn-add-item" class="btn-add-item" (click)="adicionarItem()" [disabled]="!selectedProdutoId || selectedQtd < 1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
          </button>
        </div>

        <!-- Items List -->
        @if (itens().length === 0) {
          <div style="text-align: center; padding: 2rem; background: var(--bg-elevated); border-radius: 10px; border: 1px dashed var(--border-default);">
            <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0;">Nenhum item adicionado ainda. Selecione um produto acima.</p>
          </div>
        } @else {
          <div>
            <!-- Table header -->
            <div class="items-row items-header">
              <span>Produto</span>
              <span style="text-align: center;">Qtd</span>
              <span style="text-align: right;">Unitário</span>
              <span style="text-align: right;">Subtotal</span>
              <span></span>
            </div>
            @for (item of itens(); track item.produtoId) {
              <div class="items-row items-data">
                <span style="font-weight: 500;">{{ getNomeProduto(item.produtoId) }}</span>
                <span style="text-align: center; font-family: monospace; color: var(--text-secondary);">{{ item.quantidade }}</span>
                <span style="text-align: right; color: var(--text-secondary); font-family: var(--font-tight);">
                  {{ item.precoUnitario | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
                <span style="text-align: right; font-weight: 600; font-family: var(--font-tight);">
                  {{ (item.quantidade * item.precoUnitario) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </span>
                <button class="btn-remove-item" (click)="removerItem(item.produtoId)" title="Remover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Step 3: Summary & Submit -->
      <div class="glass-card" style="padding: 1.5rem; border-color: rgba(99,102,241,0.20);">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
          <div class="step-badge">3</div>
          <h2 style="font-size: 1rem; font-weight: 600; margin: 0;">Revisão e Emissão</h2>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 2rem; flex-wrap: wrap;">
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div class="summary-line">
              <span>Cliente:</span>
              <span>{{ form.nomeCliente || '—' }}</span>
            </div>
            <div class="summary-line">
              <span>CPF/CNPJ:</span>
              <span>{{ form.cpfCnpjCliente || '—' }}</span>
            </div>
            <div class="summary-line">
              <span>Qtd. Itens:</span>
              <span>{{ itens().length }}</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 1rem;">
            <div style="text-align: right;">
              <p style="font-size: 0.8125rem; color: var(--text-muted); margin: 0;">Total da Nota Fiscal</p>
              <p style="font-size: 2rem; font-weight: 800; font-family: var(--font-tight); letter-spacing: -0.04em; margin: 0;" class="gradient-text">
                {{ total() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
              </p>
            </div>

            <button
              id="btn-emitir-nota"
              class="btn-emitir"
              [disabled]="submitting() || !canSubmit"
              (click)="emitirNota()"
            >
              @if (submitting()) {
                <span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>
                Emitindo Nota...
              } @else {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
                Emitir Nota Fiscal
              }
            </button>
          </div>
        </div>

        @if (!canSubmit && !submitting()) {
          <p style="font-size: 0.8125rem; color: var(--accent-warning); margin: 1rem 0 0; display: flex; align-items: center; gap: 0.375rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Preencha o nome do cliente, CPF/CNPJ e adicione ao menos um item para emitir a nota.
          </p>
        }
      </div>
    </div>
  `,
  styles: [`
    .step-badge {
      width: 28px; height: 28px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.8125rem; font-weight: 700; color: white; flex-shrink: 0;
    }

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
    select.field-input option { background: #1a1a24; }

    .btn-add-item {
      display: flex; align-items: center; justify-content: center;
      width: 42px; height: 42px; border-radius: 8px;
      background: var(--accent-primary); color: white;
      border: none; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
    }
    .btn-add-item:hover:not(:disabled) { background: var(--accent-primary-hover); }
    .btn-add-item:disabled { opacity: 0.4; cursor: not-allowed; }

    .items-row {
      display: grid; grid-template-columns: 3fr 1fr 1fr 1fr auto;
      gap: 1rem; padding: 0.625rem 0.875rem; align-items: center;
    }
    .items-header {
      font-size: 0.75rem; font-weight: 600; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem;
    }
    .items-data {
      font-size: 0.875rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .items-data:last-child { border-bottom: none; }

    .btn-remove-item {
      background: transparent; border: none; cursor: pointer;
      color: var(--text-muted); padding: 0.25rem;
      border-radius: 4px; transition: all 0.2s; display: flex;
    }
    .btn-remove-item:hover { background: rgba(239,68,68,0.15); color: #fca5a5; }

    .summary-line {
      display: flex; gap: 0.75rem; font-size: 0.875rem;
    }
    .summary-line span:first-child { color: var(--text-muted); min-width: 80px; }
    .summary-line span:last-child { color: var(--text-primary); font-weight: 500; }

    .btn-emitir {
      display: inline-flex; align-items: center; gap: 0.625rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
      border: none; border-radius: 12px; padding: 0.875rem 2rem;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
      box-shadow: 0 4px 20px rgba(99,102,241,0.35);
    }
    .btn-emitir:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(99,102,241,0.45);
    }
    .btn-emitir:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  `]
})
export class EmitirNotaComponent implements OnInit, OnDestroy {
  private faturamentoService = inject(FaturamentoService);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  produtos = signal<Produto[]>([]);
  itens = signal<{ produtoId: number; quantidade: number; precoUnitario: number }[]>([]);
  submitting = signal(false);

  form = { nomeCliente: '', cpfCnpjCliente: '' };
  selectedProdutoId: string | number = '';
  selectedQtd = 1;

  total = computed(() =>
    this.itens().reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0)
  );

  get canSubmit(): boolean {
    return !!this.form.nomeCliente.trim()
      && !!this.form.cpfCnpjCliente.trim()
      && this.itens().length > 0;
  }

  ngOnInit(): void {
    this.estoqueService.getProdutos().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => this.produtos.set(list),
      error: () => this.toastService.error('Erro ao carregar produtos', 'API de Estoque indisponível.')
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onProdutoChange(id: string | number): void {
    this.selectedQtd = 1;
  }

  private findProduto(): Produto | null {
    return this.produtos().find(p => p.id === Number(this.selectedProdutoId)) ?? null;
  }

  adicionarItem(): void {
    const produto = this.findProduto();
    if (!produto) return;

    const qtd = Number(this.selectedQtd);
    if (qtd < 1 || qtd > produto.quantidadeEstoque) {
      this.toastService.warning('Quantidade inválida', `Saldo disponível: ${produto.quantidadeEstoque} unidades.`);
      return;
    }

    const jaNaLista = this.itens().find(i => i.produtoId === produto.id);
    if (jaNaLista) {
      this.itens.update(list =>
        list.map(i => i.produtoId === produto.id
          ? { ...i, quantidade: i.quantidade + qtd }
          : i
        )
      );
    } else {
      this.itens.update(list => [...list, {
        produtoId: produto.id,
        quantidade: qtd,
        precoUnitario: produto.preco,
      }]);
    }

    this.selectedProdutoId = '';
    this.selectedQtd = 1;
  }

  removerItem(produtoId: number): void {
    this.itens.update(list => list.filter(i => i.produtoId !== produtoId));
  }

  getNomeProduto(id: number): string {
    return this.produtos().find(p => p.id === id)?.nome ?? `Produto #${id}`;
  }

  emitirNota(): void {
    if (!this.canSubmit) return;
    this.submitting.set(true);

    const dto: CreateNotaFiscalDto = {
      nomeCliente: this.form.nomeCliente,
      cpfCnpjCliente: this.form.cpfCnpjCliente,
      itens: this.itens(),
    };

    this.faturamentoService.criarNota(dto).pipe(takeUntil(this.destroy$)).subscribe({
      next: (nota) => {
        this.submitting.set(false);
        this.toastService.success(
          `NF-${nota.numeroSequencial.toString().padStart(4, '0')} emitida!`,
          `Nota criada com sucesso para ${nota.nomeCliente}.`
        );
        this.router.navigate(['/notas']);
      },
      error: () => {
        this.submitting.set(false);
        this.toastService.error('Erro ao emitir nota', 'Verifique se a API de Faturamento está ativa na porta 5000.');
      }
    });
  }
}
