import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-overlay" 
      (click)="onBackdropClick()"
      (keydown.escape)="onEscape()"
      (keydown.enter)="onBackdropClick()"
      (keydown.space)="onBackdropClick(); $event.preventDefault()"
      tabindex="0"
      role="button"
      aria-label="Cerrar modal"
    >
      <div class="modal" 
        (click)="$event.stopPropagation()"
        (keydown.enter)="$event.stopPropagation()"
        (keydown.space)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        [class.modal-sm]="size === 'sm'"
        [class.modal-md]="size === 'md'"
        [class.modal-lg]="size === 'lg'"
      >
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" (click)="closed.emit()" type="button" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        @if (hasFooter) {
        <div class="modal-footer">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: var(--overlay-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 150ms ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: var(--surface-background);
      border-radius: var(--radius-lg);
      width: 90%;
      box-shadow: var(--shadow-xl);
      animation: slideUp 200ms ease;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }

    /* Sizes */
    .modal-sm { max-width: 400px; }
    .modal-md { max-width: 550px; }
    .modal-lg { max-width: 800px; }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) var(--space-5);
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .modal-close {
      width: var(--control-height-sm);
      height: var(--control-height-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      color: var(--text-color-secondary);
      background: transparent;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 150ms ease;
    }

    .modal-close:hover {
      background: var(--surface-hover);
      color: var(--text-color);
    }

    .modal-body {
      padding: var(--space-5);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-5);
      border-top: 1px solid var(--border-color);
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-background, --overlay-backdrop, --surface-hover
     * ya tienen valores apropiados para temas oscuros.
     */
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = true;

  @Output() closed = new EventEmitter<void>();

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.closed.emit();
    }
  }

  onEscape() {
    if (this.closeOnBackdrop) {
      this.closed.emit();
    }
  }
}
