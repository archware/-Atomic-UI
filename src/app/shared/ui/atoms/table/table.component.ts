import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ScrollOverlayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scroll-overlay
      class="atomic-table-container"
      [class.atomic-table-striped]="striped"
      [class.atomic-table--columns]="!!columnTemplate"
      [maxHeight]="maxHeight ?? null"
      [style.--atomic-table-columns]="columnTemplate || null">
      <table class="atomic-table" role="table">
        <ng-content></ng-content>
      </table>
    </app-scroll-overlay>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .atomic-table-container {
      width: 100%;
      overflow: hidden;
    }

    .atomic-table td:last-child {
      padding-right: var(--space-6);
    }

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

    .atomic-table tbody {
      display: table-row-group;
    }

    /* Maquetacion por columnas fijas. Antes la aplicaba el scroll-overlay
       escribiendo sobre el contenido proyectado, y al pasar thead/tbody/tr a
       display:block|grid destruia la semantica de tabla sin restaurar ningun
       role: un lector de pantalla dejaba de anunciar filas y celdas. Ahora vive
       en el componente que posee el <table>, y los roles se declaran de forma
       explicita para que la rejilla no cueste la semantica. */
    .atomic-table--columns .atomic-table,
    .atomic-table--columns .atomic-table thead,
    .atomic-table--columns .atomic-table tbody {
      display: block;
    }

    .atomic-table--columns .atomic-table tr {
      display: grid;
      grid-template-columns: var(--atomic-table-columns);
      align-items: center;
    }

    .atomic-table--columns .atomic-table th,
    .atomic-table--columns .atomic-table td {
      display: flex;
      min-width: 0;
      align-items: center;
      overflow-wrap: anywhere;
    }

    .atomic-table th, .atomic-table td {
      padding: var(--table-cell-padding, var(--space-3) var(--space-4));
      vertical-align: middle;
      border-bottom: 1px solid var(--table-color-border-light, rgba(0,0,0,0.05));
    }

    .atomic-table tbody tr {
      background-color: var(--table-color-background);
      transition: background-color var(--table-transition-duration, 0.2s) var(--table-transition-timing, ease),
                  transform var(--table-transition-duration, 0.2s) var(--table-transition-timing, ease),
                  box-shadow var(--table-transition-duration, 0.2s) var(--table-transition-timing, ease);
    }

    .atomic-table tbody tr:hover {
      background-color: var(--table-row-hover, rgba(0,0,0,0.02));
      box-shadow: var(--table-row-hover-shadow, 0 var(--space-1) var(--space-3) rgba(0,0,0,0.08));
      transform: var(--table-row-hover-transform, translateY(-var(--space-1)));
      z-index: 1;
      position: relative;
    }

    .atomic-table thead th {
      position: sticky;
      top: 0;
      z-index: 2;
      color: var(--table-header-color);
      font-size: var(--table-font-size-header, var(--space-3));
      font-weight: var(--table-font-weight-header, 600);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: var(--table-header-bg);
      border-top: var(--table-header-border-width, var(--space-1)) var(--table-header-border-style, solid) var(--table-header-border-color, var(--table-color-border));
      border-bottom: var(--table-header-border-width, var(--space-1)) var(--table-header-border-style, solid) var(--table-header-border-color, var(--table-color-border));
    }

    .atomic-table thead th:first-child {
      border-left: var(--table-header-border-width, var(--space-1)) var(--table-header-border-style, solid) var(--table-header-border-color, var(--table-color-border));
      border-top-left-radius: var(--table-header-radius, var(--space-2));
      border-bottom-left-radius: var(--table-header-radius, var(--space-2));
    }

    .atomic-table thead th:last-child {
      border-right: var(--table-header-border-width, var(--space-1)) var(--table-header-border-style, solid) var(--table-header-border-color, var(--table-color-border));
      border-top-right-radius: var(--table-header-radius, var(--space-2));
      border-bottom-right-radius: var(--table-header-radius, var(--space-2));
    }

    .atomic-table-striped .atomic-table tbody tr:nth-child(odd) {
      background-color: var(--table-color-stripe);
    }

    .atomic-table-striped .atomic-table tbody tr:nth-child(odd):hover {
      background-color: var(--table-color-hover, var(--table-row-hover));
    }

    /* ============================================
       RESPONSIVE: Cards en móvil (Sin usar !important)
       Usamos selectores de alta especificidad para anular ScrollOverlay
       ============================================ */
    @media screen and (max-width: 768px) {
      .atomic-table-container {
        border: none;
        border-radius: 0;
        overflow: auto;
        max-height: none;
      }
      .atomic-table,
      .atomic-table > app-table-head,
      .atomic-table tbody {
        display: block;
      }
      .atomic-table thead,
      .atomic-table .atomic-thead {
        display: none;
      }
      .atomic-table tbody tr {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--table-color-background);
        border: 1px solid var(--table-color-border);
        border-radius: var(--table-border-radius);
        padding: var(--table-card-padding);
        margin-bottom: var(--table-card-gap);
        box-shadow: var(--table-card-shadow);
      }
      .atomic-table tbody tr:hover {
        transform: none;
        box-shadow: var(--table-card-shadow);
      }
      .atomic-table tbody td {
        display: flex;
        padding: var(--space-2) 0;
        border-bottom: 1px solid var(--table-color-border-light);
      }
      .atomic-table tbody td:last-child {
        border-bottom: none;
      }
      .atomic-table tbody td[data-label]::before {
        content: attr(data-label);
        display: block;
        font-weight: var(--table-font-weight-label);
        color: var(--table-color-primary);
        flex: 0 0 120px;
        margin-right: var(--space-3);
      }
      .atomic-table tbody td.actions-cell {
        justify-content: flex-end;
        padding-top: var(--space-3);
        border-top: 1px solid var(--table-color-border);
        border-bottom: none;
      }
    }
  `]
})
export class TableComponent {
  @Input() striped = false;
  /** Altura maxima del cuerpo en pixeles. */
  @Input() maxHeight?: number;
  /** Plantilla de columnas CSS grid, p. ej. `'70px minmax(150px, 1fr) 100px'`. */
  @Input() columnTemplate?: string;
}
