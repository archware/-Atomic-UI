import { Component, ChangeDetectionStrategy, inject, ViewChildren, QueryList, ElementRef, effect } from '@angular/core';

import { ModalService, ModalItem } from '../../services/modal.service';

/**
 * Contenedor de modales global.
 * Debe colocarse en el nivel raíz del app (app.component o app.html).
 * Lee los modales del ModalService y los renderiza.
 * 
 * @example
 * ```html
 * <!-- En app.html o app.component -->
 * <app-modal-container></app-modal-container>
 * ```
 */
@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (modal of modalService.modals(); track modal.id; let first = $first) {
      <div 
        class="modal-overlay" 
        [class.modal-closing]="modal.closing"
        (click)="onBackdropClick(modal)"
        (keydown.escape)="onEscape(modal)"
        (keydown.enter)="onEnter(modal)"
        tabindex="-1"
      >
        <div 
          #modalElement
          class="modal" 
          [class]="'modal-' + modal.size"
          [class.modal-exit]="modal.closing"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="'modal-title-' + modal.id"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title" [id]="'modal-title-' + modal.id">{{ modal.title }}</h3>
            @if (modal.closable) {
              <button #closeButton class="modal-close" (click)="modalService.close(modal.id)" type="button" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="modal-body">
            @if (modal.message) {
              <p class="modal-message">{{ modal.message }}</p>
            }
            @if (modal.htmlContent) {
              <div [innerHTML]="modal.htmlContent"></div>
            }
          </div>

          <!-- Footer -->
          @if (modal.hasFooter && modal.buttons && modal.buttons.length > 0) {
            <div class="modal-footer">
              @for (button of modal.buttons; track button.label) {
                <button 
                  type="button"
                  class="modal-btn"
                  [class]="'modal-btn-' + (button.variant || 'primary')"
                  (click)="button.action()"
                >
                  {{ button.label }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './modal-container.component.css'
})
export class ModalContainerComponent {
  protected readonly modalService = inject(ModalService);

  @ViewChildren('modalElement') modalElements!: QueryList<ElementRef<HTMLElement>>;

  constructor() {
    // Effect to focus the newest modal when the list changes
    effect(() => {
      const modalList = this.modalService.modals();
      if (modalList.length > 0) {
        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
          const newestModal = this.modalElements.last;
          if (newestModal) {
            // Find first focusable element (close button or first action button)
            const focusable = newestModal.nativeElement.querySelector(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;

            if (focusable) {
              focusable.focus();
            } else {
              newestModal.nativeElement.focus();
            }
          }
        }, 0);
      }
    });
  }

  onBackdropClick(modal: ModalItem): void {
    if (modal.closeOnBackdrop) {
      this.modalService.close(modal.id);
    }
  }

  onEscape(modal: ModalItem): void {
    if (modal.closable) {
      this.modalService.close(modal.id);
    }
  }

  onEnter(modal: ModalItem): void {
    if (modal.buttons && modal.buttons.length > 0) {
      const primaryBtn = modal.buttons.find(b => b.variant === 'primary' || !b.variant) || modal.buttons[0];
      if (primaryBtn && primaryBtn.action) {
        primaryBtn.action();
      }
    }
  }
}
