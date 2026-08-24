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
      <tr>
        <ng-content></ng-content>
      </tr>
    </thead>
  `,
  styleUrl: './table-head.component.css'
})
export class TableHeadComponent { }
