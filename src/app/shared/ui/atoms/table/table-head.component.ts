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
  templateUrl: './table-head.component.html',
  styleUrl: './table-head.component.css'
})
export class TableHeadComponent { }
