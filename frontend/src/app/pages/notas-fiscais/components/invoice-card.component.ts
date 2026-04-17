import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideFileText, 
  lucidePrinter, 
  lucideCheckCircle, 
  lucideClock, 
  lucideCalendar,
  lucideUser,
  lucideHash,
  lucideBot,
  lucideChevronDown,
  lucideEdit,
  lucideRefreshCcw
} from '@ng-icons/lucide';
import { ZardCardComponent } from '@/shared/components/card';
import { ZardBadgeComponent } from '@/shared/components/badge';
import { ZardButtonComponent } from '@/shared/components/button';
import { NotaFiscal } from '../../../models/models';

@Component({
  selector: 'app-invoice-card',
  standalone: true,
  imports: [
    DatePipe, 
    CurrencyPipe, 
    ZardCardComponent, 
    ZardBadgeComponent, 
    ZardButtonComponent, 
    NgIcon
  ],
  providers: [
    provideIcons({ 
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
      lucideEdit
    })
  ],
  template: `
    <z-card class="overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all duration-300">
      <div class="p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 group-hover:text-primary transition-colors relative">
              <ng-icon name="lucideFileText" size="24" />
              <div class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white border-2 border-white dark:border-zinc-950"> # </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-bold text-zinc-900 dark:text-white">NF-{{ nota.numeroSequencial.toString().padStart(4, '0') }}</h3>
                <z-badge 
                  [zType]="nota.status === 'Fechada' ? 'default' : 'secondary'" 
                  zShape="pill" 
                  class="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider"
                >
                  <ng-icon [name]="nota.status === 'Fechada' ? 'lucideCheckCircle' : 'lucideClock'" class="mr-1" />
                  {{ nota.status }}
                </z-badge>
              </div>
              <div class="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                <span class="flex items-center gap-1"><ng-icon name="lucideUser" size="14" /> {{ nota.nomeCliente }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <div class="text-right mr-4">
              <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total</p>
              <p class="text-xl font-black text-zinc-900 dark:text-white">{{ calcTotal() | currency:'BRL' }}</p>
            </div>
            
            <div class="flex items-center gap-2">
              @if (nota.status === 'Aberta') {
                <button 
                  z-button 
                  zType="outline" 
                  zSize="sm"
                  (click)="onEdit.emit(nota)"
                  class="dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  <ng-icon name="lucideEdit" class="mr-2" />
                  Editar
                </button>
              }

              <button 
                z-button 
                [zType]="nota.status === 'Fechada' ? 'outline' : 'default'" 
                zSize="sm"
                (click)="onPrint.emit(nota)"
                [disabled]="isPrinting"
              >
                <ng-icon [name]="isPrinting ? 'lucideRefreshCcw' : 'lucidePrinter'" class="mr-2" [class.animate-spin]="isPrinting" />
                {{ nota.status === 'Fechada' ? 'Re-imprimir' : 'Fechar & Imprimir' }}
              </button>

              <button 
                z-button 
                zType="outline" 
                zSize="sm" 
                zShape="circle"
                (click)="onToggleExpand.emit(nota.id)"
                [class.rotate-180]="isExpanded"
                class="transition-transform duration-300"
              >
                <ng-icon name="lucideChevronDown" />
              </button>
            </div>
          </div>
        </div>

        @if (isExpanded) {
          <div class="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-300">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <h4 class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <ng-icon name="lucideClock" /> Detalhes da Emissão
                </h4>
                <div class="space-y-3">
                  <div class="flex items-center gap-3 text-sm">
                    <div class="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                      <ng-icon name="lucideCalendar" class="text-zinc-400" />
                    </div>
                    <div>
                      <p class="text-xs text-zinc-400 uppercase font-medium">Data de Emissão</p>
                      <p class="font-semibold text-zinc-700 dark:text-zinc-200">{{ nota.dataEmissao | date:'dd/MM/yyyy HH:mm' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <div class="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
                      <ng-icon name="lucideHash" class="text-zinc-400" />
                    </div>
                    <div>
                      <p class="text-xs text-zinc-400 uppercase font-medium">CPF/CNPJ Cliente</p>
                      <p class="font-semibold text-zinc-700 dark:text-zinc-200">{{ nota.cpfCnpjCliente || 'Não informado' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <h4 class="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <ng-icon name="lucideBot" /> Resumo Inteligente (IA)
                </h4>
                <div class="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                  <div class="absolute top-0 right-0 p-2 opacity-10">
                    <ng-icon name="lucideBot" size="48" />
                  </div>
                  <p class="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                    {{ nota.resumoIA || 'O resumo da IA será gerado automaticamente quando a nota for fechada e enviada para processamento.' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                    <th class="pb-2 font-medium">Produto</th>
                    <th class="pb-2 font-medium text-center">Qtd</th>
                    <th class="pb-2 font-medium text-right">Unitário</th>
                    <th class="pb-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="text-zinc-600 dark:text-zinc-300">
                  @for (item of nota.itens; track item.produtoId) {
                    <tr class="border-b border-zinc-50 dark:border-zinc-900/50">
                      <td class="py-2 text-zinc-900 dark:text-zinc-100">{{ item.nomeProduto }}</td>
                      <td class="py-2 text-center">{{ item.quantidade }}</td>
                      <td class="py-2 text-right">{{ item.precoUnitario | currency:'BRL' }}</td>
                      <td class="py-2 text-right font-semibold text-zinc-900 dark:text-white">{{ (item.quantidade * item.precoUnitario) | currency:'BRL' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </z-card>
  `
})
export class InvoiceCardComponent {
  @Input({ required: true }) nota!: NotaFiscal;
  @Input() isExpanded = false;
  @Input() isPrinting = false;

  @Output() onPrint = new EventEmitter<NotaFiscal>();
  @Output() onEdit = new EventEmitter<NotaFiscal>();
  @Output() onToggleExpand = new EventEmitter<number>();

  calcTotal(): number {
    return this.nota.itens?.reduce((acc, item) => acc + (item.quantidade * item.precoUnitario), 0) ?? 0;
  }
}
