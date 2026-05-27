import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

import { PanelComponent } from '../../surfaces/panel/panel.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { RowComponent } from '../../atoms/row/row.component';

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
  imports: [PanelComponent, ButtonComponent, RowComponent],
  template: `
    <app-panel [title]="title" icon="🔍" variant="default" padding="md">
      <app-row [responsive]="true" minColumnWidth="180px" gap="1rem" verticalAlign="bottom">
        <!-- Campos proyectados por el consumidor -->
        <ng-content></ng-content>

        <!-- Botones de acción -->
        <div class="filter-actions">
          <app-button variant="primary" (buttonClick)="onFilter()">
            <i icon-left class="fa-solid fa-magnifying-glass"></i>
            {{ filterLabel }}
          </app-button>
          @if (showClear) {
            <app-button variant="ghost" (buttonClick)="onClear()">
              {{ clearLabel }}
            </app-button>
          }
        </div>
      </app-row>
    </app-panel>
  `,
  styles: [`
    :host { display: block; }
    .filter-actions {
      display: flex;
      gap: var(--space-2);
      align-items: center;
      flex-shrink: 0;
    }
  `]
})
export class FiltersComponent {
  /** Título del panel de filtros */
  @Input() title = 'Filtros';

  /** Texto del botón principal */
  @Input() filterLabel = 'Filtrar';

  /** Texto del botón limpiar */
  @Input() clearLabel = 'Limpiar';

  /** Mostrar botón de limpiar */
  @Input() showClear = false;

  /** Emitido al hacer clic en Filtrar */
  @Output() filter = new EventEmitter<void>();

  /** Emitido al hacer clic en Limpiar */
  @Output() clear = new EventEmitter<void>();

  onFilter() { this.filter.emit(); }
  onClear() { this.clear.emit(); }
}
