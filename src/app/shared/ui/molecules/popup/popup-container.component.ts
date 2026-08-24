import { Component, ChangeDetectionStrategy, ElementRef, afterRenderEffect, inject } from '@angular/core';

import { PopupService, PopupItem } from '../../services/popup.service';

/**
 * Contenedor de popups global.
 * Debe colocarse en el nivel raíz del app (app.component o app.html).
 * Lee los popups del PopupService y los renderiza como modales.
 * 
 * @example
 * ```html
 * <!-- En app.html o app.component -->
 * <app-popup-container></app-popup-container>
 * ```
 */
@Component({
  selector: 'app-popup-container',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (popup of popupService.popups(); track popup.id) {
      <div 
        class="popup-overlay" 
        [class.popup-closing]="popup.closing"
        (click)="onBackdropClick(popup)"
        (keydown.escape)="onEscape(popup, $event)"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'popup-title-' + popup.id"
      >
        <div 
          class="popup" 
          [class]="'popup-' + popup.size + ' popup-type-' + popup.type"
          (click)="$event.stopPropagation()"
          (keydown.escape)="onEscape(popup, $event)"
          (keydown)="$event.stopPropagation()"
          tabindex="-1"
        >
          <!-- Header -->
          <div class="popup-header">
            @if (popup.icon) {
              <span class="popup-icon" [class]="'popup-icon-' + popup.type">
                <i [class]="popup.icon"></i>
              </span>
            }
            <h3 class="popup-title" [id]="'popup-title-' + popup.id">{{ popup.title }}</h3>
            @if (popup.closable) {
              <button class="popup-close" (click)="onDismiss(popup)" type="button" aria-label="Cerrar">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="popup-body">
            @if (popup.message) {
              <p class="popup-message">{{ popup.message }}</p>
            }
            @if (popup.htmlContent) {
              <div [innerHTML]="popup.htmlContent"></div>
            }
          </div>

          <!-- Footer -->
          @if (popup.buttons && popup.buttons.length > 0) {
            <div class="popup-footer">
              @for (button of popup.buttons; track button.label) {
                <button 
                  type="button"
                  class="popup-btn"
                  [class]="'popup-btn-' + (button.variant || 'primary')"
                  [attr.data-autofocus]="button.autofocus ? '' : null"
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
  styleUrl: './popup-container.component.css'
})
export class PopupContainerComponent {
  protected readonly popupService = inject(PopupService);
  private readonly host = inject(ElementRef<HTMLElement>);
  private focused = new Set<number>();

  constructor() {
    /*
    EL FOCO EMPIEZA EN LA SALIDA SEGURA.

    Sin esto el foco se queda donde estaba —o en el fondo del dialogo, que lleva
    `tabindex="0"`—, y quien navega con teclado tiene que adivinar donde esta.
    Se mueve al boton marcado `autofocus`, que en un `confirm` es «Cancelar».

    Una sola vez por popup: repetirlo en cada repintado arrancaria el foco de
    donde lo haya puesto la persona.
    */
    afterRenderEffect(() => {
      const abiertos = this.popupService.popups();
      const vivos = new Set(abiertos.map(popup => popup.id));
      this.focused = new Set([...this.focused].filter(id => vivos.has(id)));

      const ultimo = abiertos[abiertos.length - 1];
      if (!ultimo || ultimo.closing || this.focused.has(ultimo.id)) {
        return;
      }
      const root = this.host.nativeElement as HTMLElement;
      const overlays = root.querySelectorAll('.popup-overlay');
      const overlay = overlays[overlays.length - 1];
      const objetivo =
        overlay?.querySelector<HTMLElement>('[data-autofocus]') ??
        overlay?.querySelector<HTMLElement>('.popup-btn');
      if (objetivo) {
        objetivo.focus();
        this.focused.add(ultimo.id);
      }
    });
  }

  onBackdropClick(popup: PopupItem): void {
    if (popup.closeOnBackdrop) {
      this.popupService.close(popup.id);
    }
  }

  /*
  ESCAPE NO ES UN CIERRE MUDO.

  Se cerraba el popup sin ejecutar nada. Quien lo abrio se queda esperando una
  respuesta que no va a llegar: el boton sigue en «Anulando…», la fila sigue
  bloqueada, y no hay forma de saber que la persona dijo que no.

  Si hay un boton que cancela, Escape hace exactamente lo que ese boton.
  */
  onEscape(popup: PopupItem, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.onDismiss(popup);
  }

  /**
   * Escape y la aspa representan la misma decisión: cancelar cuando el popup
   * expone esa salida, o cerrar un aviso meramente informativo.
   */
  onDismiss(popup: PopupItem): void {
    const cancelButton = popup.buttons?.find(button => button.cancels);
    if (cancelButton) {
      cancelButton.action();
      return;
    }
    if (popup.closable) {
      this.popupService.close(popup.id);
    }
  }
}

/*
NOTA SOBRE LO QUE SE QUITO: `onEnter`.

Ejecutaba el boton primario —el que hace la cosa— desde el fondo del dialogo,
que es lo que tenia el foco. Un Intro por inercia, arrastrado del formulario
anterior, confirmaba. La doctrina lo nombra como contraejemplo.

Ahora el foco arranca en el boton marcado `autofocus` (por defecto el de
cancelar) y el Intro lo pulsa el navegador, sobre el boton que la persona ve
enfocado.
*/
