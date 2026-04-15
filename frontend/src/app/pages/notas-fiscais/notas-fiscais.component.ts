import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  lucideHash
} from '@ng-icons/lucide';

@Component({
  selector: 'app-notas-fiscais',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, ZardCardComponent, ZardBadgeComponent, ZardButtonComponent, NgIcon],
  providers: [
    provideIcons({ 
      lucideFileText, 
      lucideRefreshCcw, 
      lucidePrinter, 
      lucideCheckCircle, 
      lucideClock, 
      lucideCalendar,
      lucideUser,
      lucideHash
    })
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-3xl font-bold tracking-tight">Notas Fiscais</h2>
          <p class="text-muted-foreground">
            {{ notasAbertas() }} aberta(s) · {{ notasFechadas() }} fechada(s)
          </p>
        </div>
        <button z-button zType="outline" (click)="loadNotas()" [zLoading]="loading()">
          <ng-icon name="lucideRefreshCcw" size="16" class="mr-2" [class.animate-spin]="loading()" />
          Atualizar
        </button>
      </div>

      <!-- Filter tabs -->
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

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <z-card class="h-40 animate-pulse bg-muted/50"></z-card>
          }
        </div>
      } @else if (filteredNotas().length === 0) {
        <z-card class="bg-muted/20 py-12 text-center">
          <ng-icon name="lucideFileText" size="48" class="mx-auto mb-4 text-muted-foreground/30" />
          <p class="text-muted-foreground">Nenhuma nota encontrada para este filtro.</p>
        </z-card>
      } @else {
        <div class="grid gap-4">
          @for (nota of filteredNotas(); track nota.id) {
            <z-card>
              <!-- Card Header -->
              <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 mb-4">
                <div class="flex items-center gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ng-icon name="lucideHash" size="20" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                       <span class="font-bold text-lg">NF-{{ nota.numeroSequencial.toString().padStart(4, '0') }}</span>
                       <z-badge [zType]="nota.status === 'Aberta' ? 'secondary' : 'default'" zShape="pill" class="h-5">
                         <ng-icon [name]="nota.status === 'Aberta' ? 'lucideClock' : 'lucideCheckCircle'" size="12" class="mr-1" />
                         {{ nota.status }}
                       </z-badge>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-muted-foreground">
                       <span class="flex items-center gap-1"><ng-icon name="lucideUser" size="14" /> {{ nota.nomeCliente }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-6">
                  <div class="flex flex-col items-end gap-1">
                     <span class="text-xs text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1">
                       <ng-icon name="lucideCalendar" size="12" /> Emitida em
                     </span>
                     <span class="text-sm font-medium">{{ nota.dataEmissao | date:'dd/MM/yyyy HH:mm':'':'pt-BR' }}</span>
                  </div>

                  @if (nota.status === 'Aberta') {
                    <button
                      z-button
                      zSize="sm"
                      [zLoading]="printing() === nota.id"
                      (click)="imprimirNota(nota)"
                      class="shadow-lg shadow-primary/20"
                    >
                      <ng-icon name="lucidePrinter" size="16" class="mr-2" />
                      Fechar & Imprimir
                    </button>
                  } @else {
                    <div class="flex items-center text-success gap-1.5 px-3 py-1.5 bg-success/10 rounded-full text-xs font-bold border border-success/20">
                      <ng-icon name="lucideCheckCircle" size="14" />
                      ENCERRADA
                    </div>
                  }
                </div>
              </div>

              <!-- Card Body: Items -->
              @if (nota.itens && nota.itens.length > 0) {
                <div class="space-y-2 mb-4">
                  <p class="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Itens da Nota ({{ nota.itens.length }})</p>
                  <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    @for (item of nota.itens; track item.produtoId) {
                      <div class="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                        <span class="text-muted-foreground">
                          ID #{{ item.produtoId }} × <b>{{ item.quantidade }}</b> un.
                        </span>
                        <span class="font-bold">
                          {{ (item.quantidade * item.precoUnitario) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Card Footer -->
              <div card-footer class="flex items-center justify-between py-2 border-t mt-4">
                <div class="text-xs text-muted-foreground font-mono opacity-60">
                  CPF/CNPJ: {{ nota.cpfCnpjCliente }}
                </div>
                <div class="flex items-baseline gap-3">
                  <span class="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total</span>
                  <span class="text-xl font-extrabold tracking-tight text-primary">
                    {{ calcTotal(nota) | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
                  </span>
                </div>
              </div>
            </z-card>
          }
        </div>
      }
    </div>
  `,
  styles: []
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
