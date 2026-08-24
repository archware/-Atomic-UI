import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  inject,
  input
} from '@angular/core';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';

export type TableCellOverflow = 'wrap' | 'truncate';
export type TableScrollbarMode = 'overlay' | 'native';
export type TableMobileScrollMode = 'page' | 'bounded';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ScrollOverlayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scroll-overlay
      class="atomic-table-container so-block"
      [class.atomic-table-striped]="striped()"
      [class.atomic-table-unified-scroll]="unifiedScroll()"
      [class.atomic-table-bounded-scroll]="hasBoundedScroll"
      [class.atomic-table-mobile-scroll-bounded]="hasBoundedMobileScroll"
      [class.atomic-table-truncate-cells]="cellOverflow() === 'truncate'"
      [maxBodyHeight]="maxHeight()"
      [minColumnWidth]="40"
      [columnTemplate]="columnTemplate()"
      [lockColumnTemplate]="!!columnTemplate()"
      [verticalSelector]="unifiedScroll() || maxHeight() ? null : 'tbody'"
      [nativeScrollbars]="scrollbarMode() === 'native'"
      [resetKey]="scrollResetKey()"
      [scrollAreaAriaLabel]="scrollViewportLabel"
    >
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </app-scroll-overlay>
  `,
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, OnDestroy {
  readonly striped = input(false);
  readonly maxHeight = input<number | string>();
  readonly columnTemplate = input<string>();
  readonly unifiedScroll = input(false);
  readonly scrollResetKey = input<unknown>();
  readonly ariaLabel = input('');
  readonly cellOverflow = input<TableCellOverflow>('wrap');
  readonly scrollbarMode = input<TableScrollbarMode>('overlay');
  readonly mobileScrollMode = input<TableMobileScrollMode>('page');

  isResponsiveCardLayout = false;

  private readonly changeDetector = inject(ChangeDetectorRef);
  private responsiveMediaQuery?: MediaQueryList;
  private readonly handleResponsiveChange = (event: MediaQueryListEvent): void => {
    this.isResponsiveCardLayout = event.matches;
    this.changeDetector.markForCheck();
  };

  get hasBoundedScroll(): boolean {
    const maxHeight = this.maxHeight();
    if (typeof maxHeight === 'number') {
      return Number.isFinite(maxHeight) && maxHeight > 0;
    }
    return typeof maxHeight === 'string' && maxHeight.trim().length > 0;
  }

  get hasBoundedMobileScroll(): boolean {
    return this.mobileScrollMode() === 'bounded' && this.hasBoundedScroll;
  }

  get scrollViewportLabel(): string | null {
    const label = this.ariaLabel().trim();
    const ownsScroll = this.unifiedScroll() || this.hasBoundedScroll;
    const keepsResponsiveViewport = !this.isResponsiveCardLayout || this.hasBoundedMobileScroll;
    return ownsScroll && keepsResponsiveViewport && label ? label : null;
  }

  ngOnInit(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    this.responsiveMediaQuery = window.matchMedia('(max-width: 768px)');
    this.isResponsiveCardLayout = this.responsiveMediaQuery.matches;
    this.responsiveMediaQuery.addEventListener('change', this.handleResponsiveChange);
  }

  ngOnDestroy(): void {
    this.responsiveMediaQuery?.removeEventListener('change', this.handleResponsiveChange);
  }
}
