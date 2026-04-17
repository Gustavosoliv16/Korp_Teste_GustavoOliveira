import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { Produto, CreateNotaFiscalDto } from '../../models/models';
import { Subject, takeUntil } from 'rxjs';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardInputDirective } from '@/shared/components/input';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardTableImports } from '@/shared/components/table';
import { ZardSelectImports } from '@/shared/components/select';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideUser, 
  lucidePackage, 
  lucidePlus, 
  lucideTrash2, 
  lucideSend, 
  lucideAlertTriangle,
  lucideCheckCircle,
  lucideShoppingCart
} from '@ng-icons/lucide';

@Component({
  selector: 'app-emitir-nota',
  standalone: true,
  imports: [
    FormsModule, 
    CurrencyPipe, 
    ZardCardComponent, 
    ZardInputDirective, 
    ZardButtonComponent,
    ...ZardTableImports,
    ...ZardSelectImports,
    NgIcon
  ],
  providers: [
    provideIcons({ 
      lucideUser, 
      lucidePackage, 
      lucidePlus, 
      lucideTrash2, 
      lucideSend, 
      lucideAlertTriangle,
      lucideCheckCircle,
      lucideShoppingCart
    })
  ],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-white">Emitir Nota Fiscal</h2>
        <p class="text-muted-foreground">Preencha os dados do cliente e adicione os itens para faturamento.</p>
      </div>

      <div class="grid gap-6 md:grid-cols-12">
        <!-- Main Form Column -->
        <div class="md:col-span-8 space-y-6">
          
          <!-- Step 1: Cliente -->
          <z-card>
            <div class="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
              <h3 class="font-semibold text-lg flex items-center gap-2 text-white">
                <ng-icon name="lucideUser" size="18" />
                Dados do Cliente
              </h3>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase text-muted-foreground" for="nome">Nome do Cliente</label>
                <input id="nome" z-input [(ngModel)]="form.nomeCliente" placeholder="Nome completo" />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold uppercase text-muted-foreground" for="cpf">CPF / CNPJ</label>
                <input 
                  id="cpf" 
                  z-input 
                  [(ngModel)]="form.cpfCnpjCliente" 
                  (input)="onCpfCnpjInput($event)"
                  placeholder="000.000.000-00" 
                  maxlength="18"
                />
              </div>
            </div>
          </z-card>

          <!-- Step 2: Itens -->
          <z-card>
            <div class="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
              <h3 class="font-semibold text-lg flex items-center gap-2 text-white">
                <ng-icon name="lucidePackage" size="18" />
                Produtos da Nota
              </h3>
            </div>

            <!-- Add Item Row -->
            <div class="flex flex-col sm:flex-row gap-3 items-end mb-6 bg-muted/30 p-4 rounded-lg">
              <div class="flex-1 space-y-2 w-full">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Selecionar Produto</label>
                <select 
                  [(ngModel)]="selectedProdutoId"
                  class="w-full h-10 px-3 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer hover:bg-zinc-800/80 transition-colors"
                >
                  <option value="" disabled selected>Escolha um produto</option>
                  @for (p of produtos(); track p.id) {
                    <option [value]="p.id.toString()" [disabled]="p.quantidadeEstoque === 0">
                      {{ p.nome }} ({{ p.preco | currency:'BRL' }}) - {{ p.quantidadeEstoque }} un.
                    </option>
                  }
                </select>
              </div>
              <div class="w-full sm:w-24 space-y-2">
                <label class="text-[10px] font-bold uppercase text-muted-foreground">Qtd</label>
                <input z-input type="number" [(ngModel)]="selectedQtd" min="1" />
              </div>
              <button z-button (click)="adicionarItem()" [disabled]="!selectedProdutoId || selectedQtd < 1">
                <ng-icon name="lucidePlus" size="18" />
              </button>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto">
              <table z-table>
                <thead z-table-header>
                  <tr z-table-row>
                    <th z-table-head class="text-white">Produto</th>
                    <th z-table-head class="text-center text-white">Qtd</th>
                    <th z-table-head class="text-right text-white">Total</th>
                    <th z-table-head class="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody z-table-body>
                  @if (itens().length === 0) {
                    <tr z-table-row>
                      <td z-table-cell colspan="4" class="h-24 text-center text-muted-foreground italic">
                        Nenhum item adicionado.
                      </td>
                    </tr>
                  } @else {
                    @for (item of itens(); track item.produtoId) {
                      <tr z-table-row>
                        <td z-table-cell class="font-medium text-white">
                          {{ getNomeProduto(item.produtoId) }}
                          <div class="text-[10px] text-muted-foreground">{{ item.precoUnitario | currency:'BRL' }} / un</div>
                        </td>
                        <td z-table-cell class="text-center font-mono">{{ item.quantidade }}</td>
                        <td z-table-cell class="text-right font-bold text-white">
                          {{ (item.quantidade * item.precoUnitario) | currency:'BRL' }}
                        </td>
                        <td z-table-cell class="text-right">
                          <button z-button zType="ghost" zSize="sm" class="text-destructive h-8 w-8 p-0 hover:bg-destructive/10" (click)="removerItem(item.produtoId)">
                            <ng-icon name="lucideTrash2" size="14" />
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </z-card>
        </div>

        <!-- Summary Column -->
        <div class="md:col-span-4 space-y-6">
          <z-card class="sticky top-6">
            <div class="flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
              <h3 class="font-semibold text-lg flex items-center gap-2 text-white">
                <ng-icon name="lucideCheckCircle" size="18" />
                Resumo
              </h3>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground flex items-center gap-1"><ng-icon name="lucideShoppingCart" size="14" /> Itens</span>
                <span class="font-medium text-white">{{ itens().length }}</span>
              </div>
              <div class="border-t border-border/50 pt-4">
                <div class="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Geral</div>
                <div class="text-3xl font-extrabold tracking-tight text-primary">
                  {{ total() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                </div>
              </div>

              @if (!canSubmit) {
                <div class="bg-warning/10 border-warning/20 border rounded-lg p-3 flex gap-2 sm:text-xs text-[10px] text-warning items-start">
                  <ng-icon name="lucideAlertTriangle" size="16" class="mt-0.5 shrink-0" />
                  <span>Preencha os dados do cliente e adicione itens para emitir.</span>
                </div>
              }

              <button 
                z-button 
                class="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                [disabled]="!canSubmit || submitting()"
                [zLoading]="submitting()"
                (click)="emitirNota()"
              >
                <ng-icon [name]="editMode() ? 'lucideSave' : 'lucideSend'" size="20" class="mr-2" />
                {{ editMode() ? 'Salvar Alterações' : 'Emitir Nota' }}
              </button>
            </div>
          </z-card>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class EmitirNotaComponent implements OnInit, OnDestroy {
  private faturamentoService = inject(FaturamentoService);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  editMode = signal(false);
  editId = signal<number | null>(null);

  produtos = signal<Produto[]>([]);
  itens = signal<{ produtoId: number; nomeProduto: string; quantidade: number; precoUnitario: number }[]>([]);
  submitting = signal(false);

  form = { nomeCliente: '', cpfCnpjCliente: '' };
  selectedProdutoId = '';
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
    this.carregarProdutos();
    
    // Verificar se é edição
    const idParaEditar = this.route.snapshot.queryParamMap.get('edit');
    if (idParaEditar) {
      this.editMode.set(true);
      this.editId.set(Number(idParaEditar));
      this.carregarNotaParaEdicao(Number(idParaEditar));
    }
  }

  carregarProdutos(): void {
    this.estoqueService.getProdutos().pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => this.produtos.set(list),
      error: () => this.toastService.error('Erro ao carregar produtos', 'API de Estoque indisponível.')
    });
  }

  carregarNotaParaEdicao(id: number): void {
    this.faturamentoService.getNota(id).subscribe({
      next: (nota) => {
        this.form.nomeCliente = nota.nomeCliente;
        this.form.cpfCnpjCliente = nota.cpfCnpjCliente || '';
        this.itens.set(nota.itens.map(i => ({
          produtoId: i.produtoId,
          nomeProduto: i.nomeProduto,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario
        })));
      },
      error: () => this.toastService.error('Erro', 'Não foi possível carregar a nota para edição.')
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private findProduto(): Produto | null {
    return this.produtos().find(p => p.id === Number(this.selectedProdutoId)) ?? null;
  }

  adicionarItem(): void {
    if (!this.selectedProdutoId) {
      this.toastService.warning('Selecione um produto', 'Você deve escolher um produto antes de adicionar.');
      return;
    }

    const produto = this.findProduto();
    if (!produto) {
      this.toastService.error('Erro na seleção', 'O produto selecionado não pôde ser encontrado.');
      return;
    }

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
        nomeProduto: produto.nome,
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

  onCpfCnpjInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove tudo o que não é dígito

    if (value.length <= 11) {
      // Máscara de CPF (000.000.000-00)
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Máscara de CNPJ (00.000.000/0000-00)
      value = value.substring(0, 14); // Limita a 14 dígitos
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.form.cpfCnpjCliente = value;
    event.target.value = value;
  }

  emitirNota(): void {
    if (!this.canSubmit) return;
    this.submitting.set(true);

    const dto: CreateNotaFiscalDto = {
      nomeCliente: this.form.nomeCliente,
      cpfCnpjCliente: this.form.cpfCnpjCliente,
      itens: this.itens().map(i => ({
        produtoId: i.produtoId,
        nomeProduto: i.nomeProduto,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario
      }))
    };

    const request$ = this.editMode() 
      ? this.faturamentoService.atualizarNota(this.editId()!, dto)
      : this.faturamentoService.criarNota(dto);

    request$.subscribe({
      next: () => {
        this.toastService.success(
          this.editMode() ? 'Nota Atualizada' : 'Nota Emitida', 
          `A nota fiscal foi ${this.editMode() ? 'atualizada' : 'criada'} com sucesso.`
        );
        this.router.navigate(['/notas-fiscais']);
      },
      error: (err) => {
        const errorMsg = err?.error?.detail || err?.error || 'Erro ao processar a nota.';
        this.toastService.error('Erro', errorMsg);
      },
      complete: () => this.submitting.set(false)
    });
  }
}
