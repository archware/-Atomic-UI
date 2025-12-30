import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * TableHeadComponent - Cabecera de tabla atómica
 * 
 * Usa tokens centralizados --table-* de table-tokens.css
 */
@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <thead class="atomic-thead">
      <ng-content></ng-content>
    </thead>
  `,
  styles: [`
    /* CRÍTICO: El wrapper debe ser invisible para el layout de tabla */
    app-table-head {
      display: contents;
    }

    /* Thead con estilos usando tokens --table-* */
    .atomic-thead {
      display: table-header-group;
      z-index: 10;
    }
    
    /* Fila del header */
    .atomic-thead tr {
      display: table-row;
    }
    
    /* Celdas del header - Usando tokens --table-* */
    .atomic-thead th,
    .atomic-thead th[app-table-header-cell] {
      display: table-cell;
      position: sticky;
      top: 0;
      z-index: 20;
      
      /* Padding y tipografía */
      padding: var(--table-cell-padding);
      color: var(--table-header-color);
      font-size: var(--table-font-size-header);
      font-weight: var(--table-font-weight-header);
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      
      /* Fondo */
      background: var(--table-header-bg);
      
      /* Borde "cápsula" */
      border-top: var(--table-header-border-width) var(--table-header-border-style) var(--table-header-border-color);
      border-bottom: var(--table-header-border-width) var(--table-header-border-style) var(--table-header-border-color);
      border-left: none;
      border-right: none;
      
      /* Sombra */
      box-shadow: var(--table-header-shadow);
    }
    
    /* Bordes redondeados en primera y última celda */
    .atomic-thead th:first-child {
      border-left: var(--table-header-border-width) var(--table-header-border-style) var(--table-header-border-color);
      border-top-left-radius: var(--table-header-radius);
      border-bottom-left-radius: var(--table-header-radius);
    }
    
    .atomic-thead th:last-child {
      border-right: var(--table-header-border-width) var(--table-header-border-style) var(--table-header-border-color);
      border-top-right-radius: var(--table-header-radius);
      border-bottom-right-radius: var(--table-header-radius);
    }
    
    /* Alineación */
    .atomic-thead th.text-right { text-align: right; }
    .atomic-thead th.text-center { text-align: center; }
  `]
})
export class TableHeadComponent { }
