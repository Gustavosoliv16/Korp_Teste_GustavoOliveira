import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  lucideEdit, 
  lucideX, 
  lucidePlus, 
  lucideTrash2, 
  lucideSave, 
  lucideRefreshCcw 
} from '@ng-icons/lucide';
import { NotaFiscal, Produto } from '../../../models/models';

@Component({
  selector: 'app-invoice-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, CurrencyPipe],
  providers: [
    provideIcons({ 
      lucideEdit, 
      lucideX, 
      lucidePlus, 
      lucideTrash2, 
      lucideSave, 
      lucideRefreshCcw 
    })
  ],
  template: `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ng-icon name="lucideEdit" class="text-primary" />
              Editar Nota Fiscal #{{ nota.numeroSequencial.toString().padStart(4, '0') }}
            </h3>
            <p class="text-[10px] text-zinc-500 uppercase tracking-tighter italic">Alteração de rascunho</p>
          </div>
          <button (click)="onClose.emit()" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <ng-icon name="lucideX" size="24" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Cliente</label>
              <input [(ngModel)]="editForm.nomeCliente" type="text" class="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">CPF/CNPJ</label>
              <input [(ngModel)]="editForm.cpfCnpjCliente" type="text" class="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white" />
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Produtos da Nota</label>
              <button (click)="addItem()" class="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                <ng-icon name="lucidePlus" /> Adicionar
              </button>
            </div>

            <div class="space-y-2">
              @for (item of editItems; track $index) {
              <div class="flex items-center gap-2 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                <select [(ngModel)]="item.produtoId" (change)="onProdChange(item)" class="flex-1 h-9 px-2 bg-transparent text-sm outline-none border-none text-zinc-900 dark:text-zinc-100">
                  <option [ngValue]="null" class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Selecione...</option>
                  @for (p of produtos; track p.id) {
                    <option [ngValue]="p.id" class="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">{{ p.nome }}</option>
                  }
                </select>
                <input [(ngModel)]="item.quantidade" type="number" class="w-16 h-9 px-2 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded text-sm text-center dark:text-white" />
                <div class="w-24 text-right text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  {{ (item.quantidade * item.precoUnitario) | currency:'BRL' }}
                </div>
                <button (click)="removeItem($index)" class="text-zinc-400 hover:text-red-500 px-2 transition-colors">
                  <ng-icon name="lucideTrash2" size="16" />
                </button>
              </div>
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-end gap-3">
          <button (click)="onClose.emit()" class="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"> Cancelar </button>
          <button 
            (click)="save()" 
            [disabled]="loading"
            class="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <ng-icon [name]="loading ? 'lucideRefreshCcw' : 'lucideSave'" [class.animate-spin]="loading" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InvoiceEditModalComponent {
  @Input({ required: true }) nota!: NotaFiscal;
  @Input() produtos: Produto[] = [];
  @Input() loading = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  editForm = { nomeCliente: '', cpfCnpjCliente: '' };
  editItems: any[] = [];

  ngOnInit() {
    this.editForm.nomeCliente = this.nota.nomeCliente;
    this.editForm.cpfCnpjCliente = this.nota.cpfCnpjCliente || '';
    this.editItems = this.nota.itens.map(i => ({ 
      produtoId: i.produtoId, 
      nomeProduto: i.nomeProduto, 
      quantidade: i.quantidade, 
      precoUnitario: i.precoUnitario 
    }));
  }

  addItem() {
    this.editItems.push({ produtoId: null, nomeProduto: '', quantidade: 1, precoUnitario: 0 });
  }

  removeItem(index: number) {
    this.editItems.splice(index, 1);
  }

  onProdChange(item: any) {
    const prod = this.produtos.find(p => p.id === item.produtoId);
    if (prod) {
      item.nomeProduto = prod.nome;
      item.precoUnitario = prod.preco;
    }
  }

  save() {
    const dto = {
      nomeCliente: this.editForm.nomeCliente,
      cpfCnpjCliente: this.editForm.cpfCnpjCliente,
      itens: this.editItems.filter(i => i.produtoId !== null)
    };
    this.onSave.emit(dto);
  }
}
