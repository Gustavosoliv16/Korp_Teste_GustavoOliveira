import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { Toast } from '../../models/models';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast"
          [class]="'toast toast-' + toast.type + (toast.exiting ? ' toast-exit' : '')"
          role="alert"
        >
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9028 20.9782 14.8354 21.5896C12.768 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              }
              @case ('error') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9L9 15M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              }
              @case ('warning') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9V13M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              }
              @case ('info') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              }
            }
          </div>
          <div class="toast-body">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
          </div>
          <button class="toast-close" (click)="toastService.dismiss(toast.id)" aria-label="Fechar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-icon { flex-shrink: 0; margin-top: 1px; }
    .toast-body { flex: 1; min-width: 0; }
    .toast-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0;
      line-height: 1.4;
    }
    .toast-message {
      font-size: 0.8125rem;
      margin: 0.25rem 0 0;
      opacity: 0.85;
      line-height: 1.4;
    }
    .toast-close {
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      opacity: 0.6;
      padding: 2px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.2s;
    }
    .toast-close:hover { opacity: 1; }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
