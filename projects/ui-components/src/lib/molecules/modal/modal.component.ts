import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
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
      tabindex="0"
      role="button"
      aria-label="Cerrar modal"
    >
      <div class="modal" 
        (click)="$event.stopPropagation()" 
        role="dialog"
        aria-modal="true"
        [class.modal-sm]="size === 'sm'"
        [class.modal-md]="size === 'md'"
        [class.modal-lg]="size === 'lg'"
      >
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" (click)="close.emit()" type="button" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="modal-footer" *ngIf="hasFooter">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
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
      background: var(--surface-background, #ffffff);
      border-radius: 0.75rem;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color, #111827);
      margin: 0;
    }

    .modal-close {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: var(--text-color-secondary, #6b7280);
      background: transparent;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 150ms ease;
    }

    .modal-close:hover {
      background: var(--surface-section, #f3f4f6);
      color: var(--text-color, #111827);
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
    }

    /* Dark Mode */
    :host-context(.dark) .modal,
    :host-context([data-theme="dark"]) .modal {
      background: var(--surface-section, #1f2937);
    }

    :host-context(.dark) .modal-close:hover,
    :host-context([data-theme="dark"]) .modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f3f4f6;
    }

    :host-context(.dark) .modal-title,
    :host-context([data-theme="dark"]) .modal-title {
      color: #f3f4f6;
    }
  `]
})
export class ModalComponent {
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = true;

  @Output() close = new EventEmitter<void>();

  onBackdropClick() {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }

  onEscape() {
    if (this.closeOnBackdrop) {
      this.close.emit();
    }
  }
}
