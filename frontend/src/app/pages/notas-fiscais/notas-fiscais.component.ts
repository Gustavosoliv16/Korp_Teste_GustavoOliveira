import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { ToastService } from '../../services/toast.service';
import { NotaFiscal } from '../../models/models';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  template: `
    <div class="page-enter" style="padding: 2rem; max-width: 1280px; margin: 0 auto;">

      <!-- Header -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0 0 0.25rem;">Listagem de</p>
          <h1 style="font-family: var(--font-tight); font-size: 1.75rem; font-weight: 800; letter-spacing: -0.04em; margin: 0;">Notas Fiscais</h1>
          <p style="color: var(--text-secondary); margin: 0.375rem 0 0; font-size: 0.875rem;">
            {{ notasAbertas() }} aberta(s) · {{ notasFechadas() }} fechada(s)
          </p>
        </div>
        <button class="btn-refresh" (click)="loadNotas()" [disabled]="loading()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" [style]="loading() ? 'animation: spin 0.7s linear infinite;' : ''">
            <path d="M23 4V10H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 15C19.84 16.8918 18.6047 18.5275 16.9717 19.6924C15.3387 20.8573 13.3909 21.4899 11.3934 21.4958C9.39585 21.5017 7.44433 20.8806 5.80451 19.7253C4.1647 18.57 2.91959 16.9414 2.25843 15.0557C1.59727 13.1699 1.55489 11.1259 2.13689 9.2148C2.71889 7.30365 3.89434 5.62433 5.48465 4.4016C7.07495 3.17887 9.00167 2.47508 11.0004 2.38953C12.9992 2.30397 14.9798 2.84105 16.67 3.92" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Atualizar
        </button>
      </div>

      <!-- Filter tabs -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
        @for (tab of tabs; track tab.value) {
          <button
            class="filter-tab"
            [class.filter-tab-active]="activeFilter() === tab.value"
            (click)="activeFilter.set(tab.value)"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tab.value === 'all' ? notas().length : notas().filter(n => n.status === tab.value).length }}</span>
          </button>
        }
      </div>

      @if (loading()) {
        <div style="display: flex; align-items: center; justify-content: center; height: 300px;">
          <div style="text-align: center;">
            <div class="spinner" style="width: 40px; height: 40px; border-width: 3px; margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-muted); font-size: 0.875rem;">Carregando notas fiscais...</p>
          </div>
        </div>
      } @else if (filteredNotas().length === 0) {
        <div class="glass-card" style="padding: 4rem 2rem; text-align: center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="opacity: 0.25; margin: 0 auto 1rem; display: block;"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <p style="color: var(--text-muted); margin: 0;">Nenhuma nota encontrada para este filtro.</p>
        </div>
      } @else {
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          @for (nota of filteredNotas(); track nota.id) {
            <div class="nota-card glass-card">
              <!-- Header row -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div class="nota-number">
                    NF-{{ nota.numeroSequencial.toString().padStart(4, '0') }}
                  </div>
                  <div>
                    <p style="font-weight: 600; font-size: 1rem; margin: 0;">{{ nota.nomeCliente }}</p>
                    <p style="color: var(--text-muted); font-size: 0.8125rem; margin: 0.125rem 0 0; font-family: monospace;">{{ nota.cpfCnpjCliente }}</p>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
                  <div style="text-align: right;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Emitida em</p>
                    <p style="font-size: 0.875rem; font-weight: 500; margin: 0;">{{ nota.dataEmissao | date:'dd/MM/yyyy HH:mm':'':'pt-BR' }}</p>
                  </div>
                  <span class="badge" [class]="nota.status === 'Aberta' ? 'badge-aberta' : 'badge-fechada'">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block;"></span>
                    {{ nota.status }}
                  </span>
                </div>
              </div>

              <!-- Items -->
              @if (nota.itens && nota.itens.length > 0) {
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                  <p style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin: 0 0 0.625rem;">Itens ({{ nota.itens.length }})</p>
                  <div style="display: flex; flex-direction: column; gap: 0.375rem;">
                    @for (item of nota.itens; track item.produtoId) {
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--bg-elevated); border-radius: 8px;">
                        <span style="font-size: 0.875rem; color: var(--text-secondary);">
                          Produto #{{ item.produtoId }} × {{ item.quantidade }} un.
                        </span>
                        <span style="font-size: 0.875rem; font-weight: 600; font-family: var(--font-tight);">
                          {{ (item.quantidade * item.precoUnitario) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Footer -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
                <p style="color: var(--text-muted); font-size: 0.8125rem; margin: 0;">
                  {{ nota.itens?.length ?? 0 }} item(ns)
                </p>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                  <div style="text-align: right;">
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Total da Nota</p>
                    <p style="font-size: 1.25rem; font-weight: 700; font-family: var(--font-tight); letter-spacing: -0.03em; margin: 0; color: var(--text-primary);">
                      {{ calcTotal(nota) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </p>
                  </div>
                  @if (nota.status === 'Aberta') {
                    <button
                      [id]="'btn-imprimir-' + nota.id"
                      class="btn-imprimir"
                      [disabled]="printing() === nota.id"
                      (click)="imprimirNota(nota)"
                    >
                      @if (printing() === nota.id) {
                        <span class="spinner" style="width:15px;height:15px;border-width:2px;"></span>
                        Processando...
                      } @else {
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 14H6V22H18V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Imprimir / Fechar NF
                      }
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .btn-refresh {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: var(--bg-elevated); color: var(--text-secondary);
      border: 1px solid var(--border-default); border-radius: 10px;
      padding: 0.625rem 1rem; font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .btn-refresh:hover:not(:disabled) { background: var(--bg-overlay); color: var(--text-primary); }
    .btn-refresh:disabled { opacity: 0.5; cursor: not-allowed; }

    .filter-tab {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.5rem 1rem; border-radius: 8px;
      background: transparent; border: 1px solid var(--border-subtle);
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
      cursor: pointer; transition: all 0.2s; font-family: inherit;
    }
    .filter-tab:hover { background: var(--bg-elevated); color: var(--text-primary); }
    .filter-tab-active {
      background: rgba(99,102,241,0.15) !important;
      border-color: rgba(99,102,241,0.3) !important;
      color: #a5b4fc !important;
    }
    .tab-count {
      background: var(--bg-elevated); border-radius: 999px;
      padding: 0.125rem 0.5rem; font-size: 0.75rem;
      color: var(--text-muted);
    }
    .filter-tab-active .tab-count {
      background: rgba(99,102,241,0.2); color: #818cf8;
    }

    .nota-card { padding: 1.25rem 1.5rem; transition: border-color 0.2s, box-shadow 0.2s; }
    .nota-card:hover { border-color: var(--border-default); box-shadow: 0 4px 24px rgba(0,0,0,0.2); }

    .nota-number {
      font-family: monospace; font-size: 0.875rem; font-weight: 700;
      background: rgba(99,102,241,0.12); color: #a5b4fc;
      padding: 0.375rem 0.75rem; border-radius: 8px;
      border: 1px solid rgba(99,102,241,0.2); flex-shrink: 0;
    }

    .btn-imprimir {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
      border: none; border-radius: 10px; padding: 0.625rem 1.125rem;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
      box-shadow: 0 4px 12px rgba(99,102,241,0.3);
    }
    .btn-imprimir:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99,102,241,0.4);
    }
    .btn-imprimir:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class NotasFiscaisComponent implements OnInit {
  private faturamentoService = inject(FaturamentoService);
  private toastService = inject(ToastService);

  notas = signal<NotaFiscal[]>([]);
  loading = signal(true);
  printing = signal<number | null>(null);
  activeFilter = signal<string>('all');

  tabs = [
    { label: 'Todas', value: 'all' },
    { label: 'Abertas', value: 'Aberta' },
    { label: 'Fechadas', value: 'Fechada' },
  ];

  notasAbertas = computed(() => this.notas().filter(n => n.status === 'Aberta').length);
  notasFechadas = computed(() => this.notas().filter(n => n.status === 'Fechada').length);
  filteredNotas = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return [...this.notas()].reverse();
    return [...this.notas()].filter(n => n.status === f).reverse();
  });

  ngOnInit(): void { this.loadNotas(); }

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
    this.faturamentoService.imprimirNota(nota.id).subscribe({
      next: (res) => {
        this.notas.update(list =>
          list.map(n => n.id === nota.id ? { ...n, status: 'Fechada' } : n)
        );
        this.printing.set(null);
        this.toastService.success(
          'Nota Fiscal fechada com sucesso!',
          `NF-${nota.numeroSequencial.toString().padStart(4,'0')} foi impressa e o estoque foi atualizado.`
        );
      },
      error: (err) => {
        this.printing.set(null);
        const status = err?.status;
        if (status === 503) {
          this.toastService.error(
            'Serviço de Estoque indisponível',
            'Operação interrompida: O microsserviço de Estoque falhou. Sua nota fiscal continua Aberta.'
          );
        } else if (status === 400) {
          this.toastService.warning('Saldo insuficiente', err?.error || 'Estoque insuficiente para um ou mais produtos desta nota.');
        } else {
          this.toastService.error('Erro ao fechar nota', 'Tente novamente ou verifique os microsserviços.');
        }
      }
    });
  }

  calcTotal(nota: NotaFiscal): number {
    return nota.itens?.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0) ?? 0;
  }
}
