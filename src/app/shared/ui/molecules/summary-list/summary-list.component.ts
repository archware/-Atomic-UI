import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

export type SummaryListLayout = 'summary' | 'detail';

export interface SummaryListItem {
  label: string;
  value: string | number;
  icon?: string;
  valueColor?: string;
}

@Component({
  selector: 'app-summary-list',
  standalone: true,
  imports: [VariablesCssDirective],
  template: `
    <dl
      class="summary-list"
      [class.data-list]="layout() === 'detail'"
      [class.summary-list--featured]="featured()"
      [class.summary-list--detail]="layout() === 'detail'"
      [class.summary-list--grid]="columns() !== null && (columns() ?? 0) > 1"
      [appVariablesCss]="{
        '--summary-columns': columns() !== null && (columns() ?? 0) > 1 ? 'repeat(' + columns() + ', minmax(0, 1fr))' : null
      }"
    >
      @for (item of items(); track item.label) {
        <div>
          <dt>
            @if (item.icon) {
              <i [class]="item.icon" aria-hidden="true"></i>
            }
            {{ item.label }}
          </dt>
          <dd [appVariablesCss]="{'--summary-value-color': item.valueColor}">{{ item.value }}</dd>
        </div>
      }
    </dl>
  `,
  styleUrl: './summary-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryListComponent {
  readonly items = input<readonly SummaryListItem[]>([]);
  readonly featured = input(false);
  /** Detalle semántico sin controles ni estilos del consumidor. */
  readonly layout = input<SummaryListLayout>('summary');
  /** Cantidad opcional de columnas para grillas de resumen/KPI. */
  readonly columns = input<number | null>(null);
}
