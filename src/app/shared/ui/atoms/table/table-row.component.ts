import { Component, ViewEncapsulation, ChangeDetectionStrategy, input } from '@angular/core';


/**
 * TableRowComponent - Fila de tabla atómica
 * 
 * Usa tokens centralizados --table-* de table-tokens.css
 */
@Component({
  selector: 'tr[app-table-row]',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  host: {
    '[class.selected]': 'selected()'
  },
  styleUrl: './table-row.component.css'
})
export class TableRowComponent {
  /** Indica si la fila está seleccionada */
  readonly selected = input(false);
}
