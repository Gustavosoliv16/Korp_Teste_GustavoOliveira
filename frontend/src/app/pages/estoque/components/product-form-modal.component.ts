import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZardButtonComponent } from '@/shared/components/button';
import { ZardInputDirective } from '@/shared/components/input';
import { CreateProdutoDto, Produto } from '../../../models/models';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ZardButtonComponent, ZardInputDirective],
  template: `
    <div class="grid gap-4 py-4">
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" for="nome">Descrição (Nome do Produto)</label>
        <input 
          id="nome" 
          z-input 
          [(ngModel)]="form.nome" 
          placeholder="Ex: Notebook Dell" 
          class="focus:ring-primary/20"
        />
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" for="preco">Preço (R$)</label>
          <input 
            id="preco" 
            z-input 
            type="number" 
            [(ngModel)]="form.preco" 
            placeholder="0.00" 
            class="focus:ring-primary/20"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" for="qtd">Saldo (Qtd. Estoque)</label>
          <input 
            id="qtd" 
            z-input 
            type="number" 
            min="0" 
            (keydown)="preventInvalidChars($event)" 
            [(ngModel)]="form.quantidadeEstoque" 
            placeholder="0" 
            class="focus:ring-primary/20"
          />
        </div>
      </div>
      
      <div class="space-y-2">
        <label class="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300" for="descricao">Detalhes / Observações</label>
        <textarea 
          id="descricao" 
          z-input 
          [(ngModel)]="form.descricao" 
          placeholder="Detalhes do produto..."
          class="min-h-[100px] focus:ring-primary/20"
        ></textarea>
      </div>
    </div>
    
    <div class="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800">
      <button z-button zType="outline" (click)="onCancel.emit()">Cancelar</button>
      <button z-button (click)="save()" [zLoading]="saving">
        {{ isEditing ? 'Atualizar Produto' : 'Salvar Produto' }}
      </button>
    </div>
  `
})
export class ProductFormModalComponent implements OnInit {
  @Input() produto: Produto | null = null;
  @Input() saving = false;

  @Output() onSave = new EventEmitter<CreateProdutoDto>();
  @Output() onCancel = new EventEmitter<void>();

  form: CreateProdutoDto = { nome: '', descricao: '', preco: 0, quantidadeEstoque: 0 };
  isEditing = false;

  ngOnInit() {
    if (this.produto) {
      this.isEditing = true;
      this.form = {
        nome: this.produto.nome,
        descricao: this.produto.descricao || '',
        preco: this.produto.preco,
        quantidadeEstoque: this.produto.quantidadeEstoque
      };
    }
  }

  save() {
    this.onSave.emit(this.form);
  }

  preventInvalidChars(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'];
    if (
      !allowedKeys.includes(event.key) && 
      (event.key < '0' || event.key > '9')
    ) {
      event.preventDefault();
    }
  }
}
