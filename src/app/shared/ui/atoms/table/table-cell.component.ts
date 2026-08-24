import { Component, ViewEncapsulation, ChangeDetectionStrategy, input } from '@angular/core';


/**
 * TableCellComponent - Celda de tabla atómica
 *
 * Usa tokens centralizados --table-* de table-tokens.css
 *
 * @example
 * ```html
 * <td app-table-cell>Contenido</td>
 * <td app-table-cell align="right">Alineado derecha</td>
 * <td app-table-cell [dataLabel]="'Nombre'">Juan</td>
 * ```
 */
@Component({
  selector: '[app-table-cell]',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    '[class.align-left]': 'align() === "left"',
    '[class.align-center]': 'align() === "center"',
    '[class.align-right]': 'align() === "right"',
    '[class.atomic-table-cell-wrap]': 'wrap()',
    '[attr.data-label]': 'dataLabel()'
  },
  styleUrl: './table-cell.component.css'
})
export class TableCellComponent {
  /** Alineación del contenido */
  readonly align = input<'left' | 'center' | 'right'>('left');

  /** Label para vista mobile (cards) */
  readonly dataLabel = input<string>();

  /** Permite envolver esta celda cuando la tabla usa truncado global. */
  readonly wrap = input(false);
}
