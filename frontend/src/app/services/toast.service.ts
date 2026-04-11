import { Injectable, signal } from '@angular/core';
import { Toast } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  private add(type: Toast['type'], title: string, message: string): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, type, title, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }

  success(title: string, message = '') { this.add('success', title, message); }
  error(title: string, message = '')   { this.add('error',   title, message); }
  warning(title: string, message = '') { this.add('warning', title, message); }
  info(title: string, message = '')    { this.add('info',    title, message); }

  dismiss(id: number): void {
    this.toasts.update(list =>
      list.map(t => t.id === id ? { ...t, exiting: true } : t)
    );
    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, 300);
  }
}
