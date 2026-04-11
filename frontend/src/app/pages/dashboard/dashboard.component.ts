import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FaturamentoService } from '../../services/faturamento.service';
import { EstoqueService } from '../../services/estoque.service';
import { ToastService } from '../../services/toast.service';
import { NotaFiscal, Produto } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="page-enter" style="padding: 2rem; max-width: 1280px; margin: 0 auto;">

      <!-- Header -->
      <div style="margin-bottom: 2.5rem;">
        <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0 0 0.375rem;">Bem-vindo ao</p>
        <h1 style="font-family: var(--font-tight); font-size: 2rem; font-weight: 800; letter-spacing: -0.04em; margin: 0;">
          Sistema de Notas Fiscais
          <span class="gradient-text"> Eletrônicas</span>
        </h1>
        <p style="color: var(--text-secondary); margin: 0.5rem 0 0; font-size: 0.9375rem;">
          Gerencie seu estoque e emita notas fiscais com total controle e rastreabilidade.
        </p>
      </div>

      <!-- Stats Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem;">

        <!-- Total Produtos -->
        <div class="glass-card stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="white" stroke-width="1.75" stroke-linecap="round"/><path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="white" stroke-width="1.75" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Produtos Cadastrados</p>
            @if (loadingEstoque()) {
              <div class="spinner" style="margin-top: 4px;"></div>
            } @else {
              <p class="stat-value">{{ produtos().length }}</p>
            }
          </div>
        </div>

        <!-- Notas Abertas -->
        <div class="glass-card stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="white" stroke-width="1.75" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Notas Abertas</p>
            @if (loadingNotas()) {
              <div class="spinner" style="margin-top: 4px;"></div>
            } @else {
              <p class="stat-value" style="color: #34d399;">{{ notasAbertas() }}</p>
            }
          </div>
        </div>

        <!-- Notas Fechadas -->
        <div class="glass-card stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9028 20.9782 14.8354 21.5896C12.768 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="white" stroke-width="2" stroke-linecap="round"/><path d="M22 4L12 14.01L9 11.01" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Notas Fechadas</p>
            @if (loadingNotas()) {
              <div class="spinner" style="margin-top: 4px;"></div>
            } @else {
              <p class="stat-value" style="color: #818cf8;">{{ notasFechadas() }}</p>
            }
          </div>
        </div>

        <!-- Total Faturado -->
        <div class="glass-card stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <p class="stat-label">Total Faturado</p>
            @if (loadingNotas()) {
              <div class="spinner" style="margin-top: 4px;"></div>
            } @else {
              <p class="stat-value" style="color: #fcd34d;">{{ totalFaturado() | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Quick Actions & Recent Notes Grid -->
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">

        <!-- Quick Actions -->
        <div class="glass-card" style="padding: 1.5rem;">
          <h2 style="font-size: 1rem; font-weight: 600; margin: 0 0 1.25rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem;">Ações rápidas</h2>
          <div style="display: flex; flex-direction: column; gap: 0.625rem;">
            <a routerLink="/emitir" class="quick-action-btn quick-action-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              Emitir Nova Nota Fiscal
            </a>
            <a routerLink="/estoque" class="quick-action-btn quick-action-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><path d="M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
              Gerenciar Estoque
            </a>
            <a routerLink="/notas" class="quick-action-btn quick-action-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
              Ver Todas as Notas
            </a>
          </div>

          <!-- Arquitetura Info -->
          <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(99,102,241,0.08); border-radius: 10px; border: 1px solid rgba(99,102,241,0.15);">
            <p style="font-size: 0.75rem; color: #a5b4fc; font-weight: 600; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.06em;">Microsserviços</p>
            <div style="display: flex; flex-direction: column; gap: 0.375rem;">
              <div class="service-pill service-pill-ok">
                <span class="dot dot-green"></span>
                Faturamento API :5000
              </div>
              <div class="service-pill service-pill-ok">
                <span class="dot dot-green"></span>
                Estoque API :5001
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notes -->
        <div class="glass-card" style="padding: 1.5rem; overflow: hidden;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h2 style="font-size: 0.75rem; font-weight: 600; margin: 0; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em;">Notas Recentes</h2>
            <a routerLink="/notas" style="font-size: 0.8125rem; color: var(--accent-primary); text-decoration: none; font-weight: 500;">Ver todas →</a>
          </div>

          @if (loadingNotas()) {
            <div style="display: flex; align-items: center; justify-content: center; height: 160px;">
              <div class="spinner" style="width: 32px; height: 32px; border-width: 3px;"></div>
            </div>
          } @else if (notas().length === 0) {
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; gap: 0.75rem;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="opacity: 0.3;"><path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0;">Nenhuma nota emitida ainda</p>
              <a routerLink="/emitir" style="font-size: 0.8125rem; color: var(--accent-primary); text-decoration: none; font-weight: 500;">Emitir a primeira →</a>
            </div>
          } @else {
            <div style="display: flex; flex-direction: column; gap: 0.625rem;">
              @for (nota of recentNotas(); track nota.id) {
                <div class="nota-row">
                  <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 0;">
                    <div class="nota-num">NF-{{ nota.numeroSequencial.toString().padStart(4, '0') }}</div>
                    <div style="min-width: 0;">
                      <p style="font-size: 0.875rem; font-weight: 500; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ nota.nomeCliente }}</p>
                      <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">{{ nota.dataEmissao | date:'dd/MM/yyyy':'':'pt-BR' }}</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
                    <span class="badge" [class]="nota.status === 'Aberta' ? 'badge-aberta' : 'badge-fechada'">
                       {{ nota.status }}
                    </span>
                    <span style="font-size: 0.875rem; font-weight: 600; color: var(--text-primary);">
                      {{ calcTotal(nota) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
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
