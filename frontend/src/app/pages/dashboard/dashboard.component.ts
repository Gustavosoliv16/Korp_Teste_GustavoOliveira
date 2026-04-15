import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { NotaFiscal, Produto } from '../../models/models';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucidePackage, 
  lucideFileText, 
  lucideCheckCircle, 
  lucideDollarSign, 
  lucidePlus,
  lucideArrowRight,
  lucideActivity
} from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, ZardCardComponent, ZardBadgeComponent, ZardButtonComponent, NgIcon],
  providers: [
    provideIcons({ 
      lucidePackage, 
      lucideFileText, 
      lucideCheckCircle, 
      lucideDollarSign, 
      lucidePlus,
      lucideArrowRight,
      lucideActivity
    })
  ],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p class="text-muted-foreground">
          Gerencie seu estoque e emita notas fiscais com total controle e rastreabilidade.
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Total Produtos -->
        <z-card zTitle="Produtos Cadastrados" zDescription="Total de itens no estoque">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ng-icon name="lucidePackage" size="24" />
            </div>
            <div>
              @if (loadingEstoque()) {
                <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
              } @else {
                <div class="text-2xl font-bold">{{ produtos().length }}</div>
              }
            </div>
          </div>
        </z-card>

        <!-- Notas Abertas -->
        <z-card zTitle="Notas Abertas" zDescription="Aguardando fechamento">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
              <ng-icon name="lucideFileText" size="24" />
            </div>
            <div>
              @if (loadingNotas()) {
                <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
              } @else {
                <div class="text-2xl font-bold">{{ notasAbertas() }}</div>
              }
            </div>
          </div>
        </z-card>

        <!-- Notas Fechadas -->
        <z-card zTitle="Notas Fechadas" zDescription="Concluídas com sucesso">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <ng-icon name="lucideCheckCircle" size="24" />
            </div>
            <div>
              @if (loadingNotas()) {
                <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
              } @else {
                <div class="text-2xl font-bold">{{ notasFechadas() }}</div>
              }
            </div>
          </div>
        </z-card>

        <!-- Total Faturado -->
        <z-card zTitle="Total Faturado" zDescription="Soma das notas fechadas">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <ng-icon name="lucideDollarSign" size="24" />
            </div>
            <div>
              @if (loadingNotas()) {
                <div class="h-8 w-16 animate-pulse rounded bg-muted"></div>
              } @else {
                <div class="text-2xl font-bold">{{ totalFaturado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</div>
              }
            </div>
          </div>
        </z-card>
      </div>

      <!-- Main Content -->
      <div class="grid gap-6 md:grid-cols-7">
        <!-- Recent Notes -->
        <z-card class="md:col-span-4" zTitle="Notas Recentes" zDescription="As últimas notas fiscais geradas">
          @if (loadingNotas()) {
            <div class="space-y-3">
              <div class="h-12 w-full animate-pulse rounded bg-muted"></div>
              <div class="h-12 w-full animate-pulse rounded bg-muted"></div>
              <div class="h-12 w-full animate-pulse rounded bg-muted"></div>
            </div>
          } @else if (notas().length === 0) {
            <div class="flex h-[200px] flex-col items-center justify-center gap-2 text-center">
              <ng-icon name="lucideFileText" size="40" class="text-muted-foreground/50" />
              <p class="text-muted-foreground">Nenhuma nota emitida ainda</p>
              <a z-button zType="link" routerLink="/emitir">Emitir a primeira nota</a>
            </div>
          } @else {
            <div class="space-y-4">
              @for (nota of recentNotas(); track nota.id) {
                <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div class="flex items-center gap-3 size-full overflow-hidden">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs font-bold text-primary">
                      NF
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium leading-none truncate">{{ nota.nomeCliente }}</p>
                      <p class="text-xs text-muted-foreground">
                        Emitida em {{ nota.dataEmissao | date:'dd/MM/yyyy':'':'pt-BR' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 shrink-0">
                    <z-badge [zType]="nota.status === 'Aberta' ? 'secondary' : 'default'" zShape="pill">
                      {{ nota.status }}
                    </z-badge>
                    <span class="text-sm font-semibold">
                      {{ calcTotal(nota) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                </div>
              }
              <a z-button zType="outline" class="w-full mt-4" routerLink="/notas">
                Ver todas as notas
                <ng-icon name="lucideArrowRight" size="14" class="ml-2" />
              </a>
            </div>
          }
        </z-card>

        <!-- Quick Actions & Systems -->
        <div class="flex flex-col gap-6 md:col-span-3">
          <z-card zTitle="Ações Rápidas">
            <div class="grid gap-3">
              <a z-button routerLink="/emitir" class="w-full justify-start">
                <ng-icon name="lucidePlus" size="18" class="mr-2" />
                Emitir Nova Nota
              </a>
              <a z-button zType="outline" routerLink="/estoque" class="w-full justify-start">
                <ng-icon name="lucidePackage" size="18" class="mr-2" />
                Gerenciar Estoque
              </a>
            </div>
          </z-card>

          <z-card zTitle="Status do Sistema">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span class="text-sm font-medium">Faturamento API</span>
                </div>
                <span class="text-xs font-mono text-muted-foreground">:5000</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span class="text-sm font-medium">Estoque API</span>
                </div>
                <span class="text-xs font-mono text-muted-foreground">:5001</span>
              </div>
              <div class="mt-4 pt-4 border-t flex items-center gap-2 text-muted-foreground">
                <ng-icon name="lucideActivity" size="14" />
                <span class="text-xs">Sistema Operacional</span>
              </div>
            </div>
          </z-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-label { color: var(--text-muted); font-size: 0.8125rem; margin: 0 0 0.25rem; }
    .stat-value { font-size: 1.75rem; font-weight: 700; margin: 0; font-family: var(--font-tight); letter-spacing: -0.04em; }

    .quick-action-btn {
      display: flex; align-items: center; gap: 0.625rem;
      padding: 0.75rem 1rem; border-radius: 10px;
      font-size: 0.875rem; font-weight: 500;
      text-decoration: none; transition: all 0.2s;
    }
    .quick-action-primary {
      background: var(--accent-primary);
      color: white;
    }
    .quick-action-primary:hover { background: var(--accent-primary-hover); transform: translateY(-1px); }
    .quick-action-secondary {
      background: var(--bg-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
    }
    .quick-action-secondary:hover { background: var(--bg-overlay); color: var(--text-primary); }

    .service-pill {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.8125rem; font-family: monospace;
      color: var(--text-secondary);
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .dot-green { background: #10b981; box-shadow: 0 0 6px #10b981; animation: pulse 2s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .nota-row {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      padding: 0.75rem 1rem; border-radius: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      transition: background 0.2s;
    }
    .nota-row:hover { background: var(--bg-overlay); }
    .nota-num {
      font-family: monospace; font-size: 0.8125rem; font-weight: 600;
      color: var(--accent-primary); background: rgba(99,102,241,0.1);
      padding: 0.25rem 0.5rem; border-radius: 6px; flex-shrink: 0;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private faturamentoService = inject(FaturamentoService);
  private estoqueService = inject(EstoqueService);
  private toastService = inject(ToastService);

  notas = signal<NotaFiscal[]>([]);
  produtos = signal<Produto[]>([]);
  loadingNotas = signal(true);
  loadingEstoque = signal(true);

  notasAbertas = computed(() => this.notas().filter(n => n.status === 'Aberta').length);
  notasFechadas = computed(() => this.notas().filter(n => n.status === 'Fechada').length);
  totalFaturado = computed(() =>
    this.notas()
      .filter(n => n.status === 'Fechada')
      .reduce((acc, n) => acc + this.calcTotal(n), 0)
  );
  recentNotas = computed(() => [...this.notas()].reverse().slice(0, 5));

  ngOnInit(): void {
    this.faturamentoService.getNotas().subscribe({
      next: (notas) => { this.notas.set(notas); this.loadingNotas.set(false); },
      error: () => {
        this.loadingNotas.set(false);
        this.toastService.error('API de Faturamento indisponível', 'Verifique se o microsserviço está rodando na porta 5000.');
      }
    });

    this.estoqueService.getProdutos().subscribe({
      next: (produtos) => { this.produtos.set(produtos); this.loadingEstoque.set(false); },
      error: () => {
        this.loadingEstoque.set(false);
        this.toastService.warning('API de Estoque indisponível', 'Verifique se o microsserviço está rodando na porta 5001.');
      }
    });
  }

  calcTotal(nota: NotaFiscal): number {
    return nota.itens?.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0) ?? 0;
  }
}
