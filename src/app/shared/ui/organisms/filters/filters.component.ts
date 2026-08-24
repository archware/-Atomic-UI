import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { PanelComponent } from '../../surfaces/panel/panel.component';
import { ButtonComponent } from '../../atoms/button/button.component';

/**
 * FiltersComponent — Organismo genérico para paneles de filtros.
 *
 * Usa ng-content para proyectar campos personalizados.
 * No impone estructura interna: cada app define sus propios filtros.
 *
 * @example
 * ```html
 * <app-filters title="Buscar registros" (filter)="onFilter()" (clear)="onClear()">
 *   <app-floating-input label="Nombre" [(ngModel)]="nombre"></app-floating-input>
 *   <app-select2 [options]="estados" [(ngModel)]="estado" label="Estado"></app-select2>
 *   <app-datepicker [(ngModel)]="fecha" label="Fecha"></app-datepicker>
 * </app-filters>
 * ```
 */
@Component({
  selector: 'app-filters',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PanelComponent, ButtonComponent],
  template: `
    <app-panel [title]="title()" icon="🔍" variant="default" padding="md">
      <div class="filter-bar">
        <ng-content></ng-content>
        <div class="filter-actions">
          <app-button variant="primary" (buttonClick)="onFilter()">
            <i icon-left class="fa-solid fa-magnifying-glass"></i>
            {{ filterLabel() }}
          </app-button>
          @if (showClear()) {
            <app-button variant="ghost" (buttonClick)="onClear()">
              {{ clearLabel() }}
            </app-button>
          }
        </div>
      </div>
    </app-panel>
  `,
  styleUrl: './filters.component.styles.css'
})
export class FiltersComponent {
  /** Título del panel de filtros */
  readonly title = input('Filtros');

  /** Texto del botón principal */
  readonly filterLabel = input('Filtrar');

  /** Texto del botón limpiar */
  readonly clearLabel = input('Limpiar');

  /** Mostrar botón de limpiar */
  readonly showClear = input(false);

  /** Emitido al hacer clic en Filtrar */
  readonly filter = output<void>();

  /** Emitido al hacer clic en Limpiar */
  readonly clear = output<void>();

  onFilter() { this.filter.emit(); }
  onClear() { this.clear.emit(); }
}
