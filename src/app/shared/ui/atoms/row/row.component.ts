import { Component, input } from '@angular/core';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

/** Horizontal alignment options */
export type RowAlign = 'left' | 'center' | 'right' | 'stretch';

/** Justify content options */
export type RowJustify = 'start' | 'center' | 'end' | 'between' | 'around';

/** Vertical alignment options */
export type RowVerticalAlign = 'top' | 'center' | 'bottom' | 'stretch' | 'baseline';

/** Layout variant */
export type RowVariant = 'default' | 'form';

/**
 * RowComponent - Unified layout component for grids
 * 
 * Replaces both legacy app-row and app-form-row with a single component.
 * 
 * @example
 * ```html
 * <!-- Default grid -->
 * <app-row columns="1fr 1fr 1fr">...</app-row>
 * 
 * <!-- Form layout (2 columns, form spacing) -->
 * <app-row variant="form">...</app-row>
 * 
 * <!-- Responsive auto-wrap -->
 * <app-row [responsive]="true" minColumnWidth="200px">...</app-row>
 * ```
 */
@Component({
  selector: 'app-row',
  standalone: true,
  imports: [VariablesCssDirective],
  template: `
    <div 
      class="row"
      [class.row--variant-form]="variant() === 'form'"
      [class.row--responsive]="responsive()"
      [class.row--align-left]="align() === 'left'"
      [class.row--align-center]="align() === 'center'"
      [class.row--align-right]="align() === 'right'"
      [class.row--align-stretch]="align() === 'stretch'"
      [class.row--justify-start]="justify() === 'start'"
      [class.row--justify-center]="justify() === 'center'"
      [class.row--justify-end]="justify() === 'end'"
      [class.row--justify-between]="justify() === 'between'"
      [class.row--justify-around]="justify() === 'around'"
      [class.row--valign-top]="verticalAlign() === 'top'"
      [class.row--valign-center]="verticalAlign() === 'center'"
      [class.row--valign-bottom]="verticalAlign() === 'bottom'"
      [class.row--valign-stretch]="verticalAlign() === 'stretch'"
      [class.row--valign-baseline]="verticalAlign() === 'baseline'"
      [class.row--wrap]="wrap() === 'wrap'"
      [appVariablesCss]="{
        '--row-columns': computedColumns,
        '--row-gap': computedGap
      }"
    >
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './row.component.css'
})
export class RowComponent {
  /** 
   * CSS Grid template columns (e.g., '1fr 1fr', 'repeat(3, 1fr)')
   * When not specified, form variant uses '1fr 1fr', others use '1fr'
   */
  readonly columns = input<string>();

  /** Gap between columns */
  readonly gap = input('var(--space-7)'); /* 3var(--space-2) default horizontal gap */

  /** Horizontal column content alignment */
  readonly align = input<RowAlign>('stretch');

  /** Vertical alignment of items */
  readonly verticalAlign = input<RowVerticalAlign>('stretch');

  /** Justify content across the row */
  readonly justify = input<RowJustify>('start');

  /** 
   * Layout variant
   * - 'default': Standard grid layout
   * - 'form': Form layout (1fr 1fr, gap var(--space-5), margin-bottom)
   */
  readonly variant = input<RowVariant>('default');

  /** 
   * Enable responsive auto-fit wrapping
   * When true, uses CSS auto-fit to wrap columns automatically
   */
  readonly responsive = input(false);

  /** 
   * Minimum column width for responsive mode
   * Only used when responsive=true
   */
  readonly minColumnWidth = input('200px');

  /** 
   * Flex wrap mode (uses flexbox instead of grid)
   * Values: 'nowrap' | 'wrap'
   */
  readonly wrap = input<'nowrap' | 'wrap'>('nowrap');

  /** Computed grid-template-columns based on variant and responsive settings */
  get computedColumns(): string {
    // Responsive mode: use auto-fit for wrapping
    if (this.responsive()) {
      return `repeat(auto-fit, minmax(${this.minColumnWidth()}, 1fr))`;
    }

    // If columns was explicitly set, always use it (highest priority)
    const columns = this.columns();
    if (columns !== undefined) {
      return columns;
    }

    // Form variant default: 2 equal columns
    if (this.variant() === 'form') {
      return '1fr 1fr';
    }

    // Default: single column
    return '1fr';
  }

  /** Computed gap based on variant */
  get computedGap(): string {
    if (this.variant() === 'form') {
      return 'var(--space-5) var(--space-7)'; /* 24px vertical, 3var(--space-2) horizontal */
    }
    return this.gap();
  }
}
