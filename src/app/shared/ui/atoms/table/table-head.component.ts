import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

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

    /* Thead con estilos RTC */
    .atomic-thead {
      display: table-header-group;
      z-index: 10;
    }
    
    /* Fila del header */
    .atomic-thead tr {
      display: table-row;
    }
    
    /* Celdas del header - Usando tokens RTC */
    .atomic-thead th,
    .atomic-thead th[app-table-header-cell] {
      display: table-cell;
      position: sticky;
      top: 0;
      z-index: 20;
      
      /* Padding y tipografía - tokens RTC */
      padding: var(--rtc-cell-padding);
      color: var(--rtc-header-color);
      font-size: var(--rtc-font-size-header);
      font-weight: var(--rtc-font-weight-header);
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
      
      /* Fondo - token RTC */
      background: var(--rtc-header-bg);
      
      /* Borde "cápsula" - tokens RTC */
      border-top: var(--rtc-header-border-width) var(--rtc-header-border-style) var(--rtc-header-border-color);
      border-bottom: var(--rtc-header-border-width) var(--rtc-header-border-style) var(--rtc-header-border-color);
      border-left: none;
      border-right: none;
      
      /* Sombra */
      box-shadow: var(--rtc-header-shadow);
    }
    
    /* Bordes redondeados en primera y última celda */
    .atomic-thead th:first-child {
      border-left: var(--rtc-header-border-width) var(--rtc-header-border-style) var(--rtc-header-border-color);
      border-top-left-radius: var(--rtc-header-radius);
      border-bottom-left-radius: var(--rtc-header-radius);
    }
    
    .atomic-thead th:last-child {
      border-right: var(--rtc-header-border-width) var(--rtc-header-border-style) var(--rtc-header-border-color);
      border-top-right-radius: var(--rtc-header-radius);
      border-bottom-right-radius: var(--rtc-header-radius);
    }
    
    /* Alineación */
    .atomic-thead th.text-right { text-align: right; }
    .atomic-thead th.text-center { text-align: center; }
  `]
})
export class TableHeadComponent { }
