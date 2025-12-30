import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="atomic-table-container" 
      [class.atomic-table-striped]="striped"
      [style.max-height]="maxHeight ? maxHeight + 'px' : null"
      [class.atomic-table-scrollable]="!!maxHeight">
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </div>
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
      overflow-x: auto;
      border-radius: var(--table-border-radius);
      border: 1px solid var(--table-color-border);
      background: var(--table-color-background);
    }

    /* Scroll vertical cuando hay maxHeight */
    .atomic-table-container.atomic-table-scrollable {
      overflow-y: auto;
    }

    /* Sticky header cuando hay scroll */
    .atomic-table-scrollable .atomic-table thead,
    .atomic-table-scrollable .atomic-table .atomic-thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .atomic-table-scrollable .atomic-table thead th,
    .atomic-table-scrollable .atomic-table .atomic-thead th {
      position: sticky;
      top: 0;
      background: var(--table-header-bg, var(--surface-background));
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
        border: none;
        border-radius: 0;
        overflow: visible;
        max-height: none !important;
      }

      .atomic-table,
      .atomic-table > app-table-head,
      .atomic-table thead,
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
        font-weight: var(--table-font-weight-label);
        color: var(--table-color-text-secondary);
        width: 40%;
        flex-shrink: 0;
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
