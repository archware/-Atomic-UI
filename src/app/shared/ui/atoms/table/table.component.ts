import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';

/**
 * TableComponent - Tabla atómica con scroll opcional
 *
 * Usa tokens centralizados de table-tokens.css
 *
 * @example
 * ```html
 * <!-- Tabla simple -->
 * <app-table [striped]="true">...</app-table>
 *
 * <!-- Tabla con altura máxima y scroll -->
 * <app-table [maxHeight]="350">...</app-table>
 * ```
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ScrollOverlayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scroll-overlay
      class="atomic-table-container so-block"
      [class.atomic-table-striped]="striped"
      [maxBodyHeight]="maxHeight"
      [minColumnWidth]="40">
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </app-scroll-overlay>
  `,
  styles: [`
    /* ============================================
       TOKENS: Usa --table-* de table-tokens.css
       ============================================ */
    :host {
      display: block;
      width: 100%;
    }

    .atomic-table-container {
      width: 100%;
      border-radius: var(--table-border-radius);
      border: 1px solid var(--table-color-border);
      background: var(--table-color-background);
      overflow: hidden; /* ScrollOverlay maneja el overflow interno */
    }

    /* Eliminar scroll sticky nativo ya que ScrollOverlay usa CSS Grid para el layout */

    .atomic-table {
      width: 100%;
      display: table;
      border-collapse: separate;
      border-spacing: 0;
      text-align: left;
      font-family: var(--table-font-family);
      font-size: var(--table-font-size);
      color: var(--table-color-text);
      table-layout: auto;
    }

    /* CRÍTICO: Hacer invisible el wrapper app-table-head */
    .atomic-table > app-table-head {
      display: contents;
    }

    /* Tbody */
    .atomic-table tbody {
      display: table-row-group;
    }

    /* Zebra stripes */
    .atomic-table-striped .atomic-table tbody tr:nth-child(odd) {
      background-color: var(--table-color-stripe);
    }

    /* ============================================
       RESPONSIVE: Cards en móvil
       ============================================ */
    @media screen and (max-width: 768px) {
      .atomic-table-container {
        border: none !important;
        border-radius: 0 !important;
        overflow: auto !important;
        max-height: none !important;
      }

      .atomic-table,
      .atomic-table > app-table-head,
      .atomic-table thead,
      .atomic-table tbody {
        display: block !important;
      }

      .atomic-table thead,
      .atomic-table .atomic-thead {
        display: none !important;
      }

      .atomic-table tbody tr {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important; /* Sobrescribir width: max-content de so-root */
        background: var(--table-color-background) !important;
        border: 1px solid var(--table-color-border) !important;
        border-radius: var(--table-border-radius) !important;
        padding: var(--table-card-padding) !important;
        margin-bottom: var(--table-card-gap) !important;
        box-shadow: var(--table-card-shadow) !important;
      }

      .atomic-table tbody tr:hover {
        transform: none !important;
        box-shadow: var(--table-card-shadow) !important;
      }

      .atomic-table tbody td {
        display: flex !important;
        padding: var(--space-2) 0 !important;
        border-bottom: 1px solid var(--table-color-border-light) !important;
      }

      .atomic-table tbody td:last-child {
        border-bottom: none !important;
      }

      .atomic-table tbody td[data-label]::before {
        content: attr(data-label);
        display: block !important;
        font-weight: var(--table-font-weight-label);
        color: var(--table-color-label);
        flex: 0 0 120px;
        margin-right: var(--space-3);
      }

      .atomic-table tbody td.actions-cell {
        justify-content: flex-end !important;
        padding-top: var(--space-3) !important;
        border-top: 1px solid var(--table-color-border) !important;
        border-bottom: none !important;
      }
    }
  `]
})
export class TableComponent {
  /** Habilitar filas alternadas (zebra stripes) */
  @Input() striped = false;

  /** Altura máxima del contenedor en píxeles (activa scroll vertical) */
  @Input() maxHeight?: number;
}
