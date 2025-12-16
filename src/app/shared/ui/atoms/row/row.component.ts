import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Horizontal alignment options */
export type RowAlign = 'left' | 'center' | 'right' | 'stretch';

/** Justify content options */
export type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around';

/** Vertical alignment options */
export type RowVerticalAlign = 'top' | 'center' | 'bottom' | 'stretch' | 'baseline';

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
      [class.row--valign-top]="verticalAlign === 'top'"
      [class.row--valign-center]="verticalAlign === 'center'"
      [class.row--valign-bottom]="verticalAlign === 'bottom'"
      [class.row--valign-stretch]="verticalAlign === 'stretch'"
      [class.row--valign-baseline]="verticalAlign === 'baseline'"
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
      align-items: stretch; /* Default: stretch to fill height */
    }

    /* === Horizontal Alignment (justify-items) === */
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

    /* === Vertical Alignment (align-items) === */
    .row--valign-top { align-items: start; }
    .row--valign-center { align-items: center; }
    .row--valign-bottom { align-items: end; }
    .row--valign-stretch { align-items: stretch; }
    .row--valign-baseline { align-items: baseline; }

    /* === Individual Column Alignment (utility classes) === */
    ::ng-deep .justify-start { justify-self: start !important; }
    ::ng-deep .justify-center { justify-self: center !important; }
    ::ng-deep .justify-end { justify-self: end !important; }
    ::ng-deep .align-self-start { align-self: start !important; }
    ::ng-deep .align-self-center { align-self: center !important; }
    ::ng-deep .align-self-end { align-self: end !important; }

    /* === Responsive: Stack on mobile === */
    @media (max-width: 640px) {
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

  /** Horizontal column content alignment */
  @Input() align: RowAlign = 'stretch';

  /** Vertical alignment of items */
  @Input() verticalAlign: RowVerticalAlign = 'stretch';

  /** Justify content across the row */
  @Input() justify: RowJustify = 'start';
}
