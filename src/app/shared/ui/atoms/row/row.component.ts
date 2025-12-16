import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Horizontal alignment options */
export type RowAlign = 'left' | 'center' | 'right' | 'stretch';

/** Justify content options */
export type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around';

@Component({
  selector: 'app-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="row"
      [class.row--align-left]="align === 'left'"
      [class.row--align-center]="align === 'center'"
      [class.row--align-right]="align === 'right'"
      [class.row--align-stretch]="align === 'stretch'"
      [class.row--justify-start]="justify === 'start'"
      [class.row--justify-center]="justify === 'center'"
      [class.row--justify-end]="justify === 'end'"
      [class.row--justify-between]="justify === 'between'"
      [class.row--justify-around]="justify === 'around'"
      [style.grid-template-columns]="columns"
      [style.gap]="gap"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .row {
      display: grid;
      width: 100%;
      box-sizing: border-box;
      align-items: center; /* Vertical centering */
    }

    /* === Alignment (justify-items) === */
    .row--align-left { justify-items: start; }
    .row--align-center { justify-items: center; }
    .row--align-right { justify-items: end; }
    .row--align-stretch { justify-items: stretch; }

    /* === Justify (justify-content) === */
    .row--justify-start { justify-content: start; }
    .row--justify-center { justify-content: center; }
    .row--justify-end { justify-content: end; }
    .row--justify-between { justify-content: space-between; }
    .row--justify-around { justify-content: space-around; }

    /* === Individual Column Alignment (utility classes) === */
    ::ng-deep .justify-start { justify-self: start !important; }
    ::ng-deep .justify-center { justify-self: center !important; }
    ::ng-deep .justify-end { justify-self: end !important; }

    /* === Responsive: Stack on mobile === */
    @media (max-width: 768px) {
      .row {
        grid-template-columns: 1fr !important;
        gap: 1.25rem !important; /* 20px on mobile */
      }
    }
  `]
})
export class RowComponent {
  /** CSS Grid template columns (e.g., '1fr 1fr', 'repeat(3, 1fr)') */
  @Input() columns: string = '1fr';

  /** Gap between columns (default 24px desktop, 12px mobile) */
  @Input() gap: string = '1.5rem'; /* 24px */

  /** Column content alignment */
  @Input() align: RowAlign = 'left';

  /** Justify content across the row */
  @Input() justify: RowJustify = 'start';
}
