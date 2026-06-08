import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';


/**
 * TableHeadComponent - Cabecera de tabla atómica
 * 
 * Usa tokens centralizados --table-* de table-tokens.css
 */
@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [],
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
      
      /* Borde sutil inferior para separar del contenido */
      border-bottom: var(--table-header-border-width, 2px) var(--table-header-border-style, solid) var(--table-header-border-color, var(--table-color-border));
      
      /* Sombra */
      box-shadow: var(--table-header-shadow);
    }
    
    /* Alineación */
    .atomic-thead th.text-right { text-align: right; }
    .atomic-thead th.text-center { text-align: center; }
  `]
})
export class TableHeadComponent { }
