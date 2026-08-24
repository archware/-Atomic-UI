import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('total', 50);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps the shared button contract in the minimal variant', () => {
    fixture.componentRef.setInput('variant', 'minimal');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(element.querySelectorAll<HTMLButtonElement>('.page-text-btn'));

    expect(buttons.length).toBe(2);
    expect(buttons.every((button) => button.classList.contains('page-btn'))).toBeTrue();
    expect(buttons[0].getAttribute('aria-label')).toContain('anterior');
    expect(buttons[1].getAttribute('aria-label')).toContain('siguiente');
  });

  it('uses classes instead of static inline styles for layout and icons', () => {
    fixture.componentRef.setInput('variant', 'minimal');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.page-size-control')).not.toBeNull();
    expect(element.querySelector('.page-icon--start')).not.toBeNull();
    expect(element.querySelector('.page-icon--end')).not.toBeNull();
    expect(element.querySelectorAll('.page-text-btn[style], .page-icon[style]').length).toBe(0);
  });

  // ── totalPages computed ───────────────────────────────────────────────────
  describe('totalPages', () => {
    it('should compute correct total pages', () => {
      expect(component.totalPages()).toBe(5);
    });

    it('should return 1 when total is 0', () => {
      fixture.componentRef.setInput('total', 0);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(1);
    });

    it('should round up for partial last page', () => {
      fixture.componentRef.setInput('total', 11);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(2);
    });

    it('should handle pageSize > total', () => {
      fixture.componentRef.setInput('total', 5);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.detectChanges();
      expect(component.totalPages()).toBe(1);
    });
  });

  // ── Navigation buttons ────────────────────────────────────────────────────
  describe('navigation buttons', () => {
    it('should disable prev button on page 1', () => {
      fixture.componentRef.setInput('page', 1);
      fixture.detectChanges();
      const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-prev');
      expect(prevBtn.disabled).toBeTrue();
    });

    it('should enable prev button on page > 1', () => {
      fixture.componentRef.setInput('page', 2);
      fixture.detectChanges();
      const prevBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-prev');
      expect(prevBtn.disabled).toBeFalse();
    });

    it('should disable next button on last page', () => {
      fixture.componentRef.setInput('page', 5);
      fixture.detectChanges();
      const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-next');
      expect(nextBtn.disabled).toBeTrue();
    });

    it('should enable next button when not on last page', () => {
      fixture.componentRef.setInput('page', 3);
      fixture.detectChanges();
      const nextBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.page-next');
      expect(nextBtn.disabled).toBeFalse();
    });
  });

  // ── goToPage & pageChange ─────────────────────────────────────────────────
  describe('goToPage', () => {
    it('should emit pageChange with the target page number', () => {
      let emittedPage: number | undefined;
      component.pageChange.subscribe((p) => { emittedPage = p; });

      component.goToPage(3);

      expect(emittedPage).toBe(3);
      expect(component.currentPage()).toBe(3);
    });

    it('should NOT emit pageChange for the current page', () => {
      fixture.componentRef.setInput('page', 2);
      fixture.detectChanges();
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(2);

      expect(emittedCount).toBe(0);
    });

    it('should NOT emit pageChange for page 0 (out of range)', () => {
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(0);

      expect(emittedCount).toBe(0);
    });

    it('should NOT emit pageChange for page > totalPages', () => {
      let emittedCount = 0;
      component.pageChange.subscribe(() => { emittedCount++; });

      component.goToPage(99);

      expect(emittedCount).toBe(0);
    });
  });

  // ── visiblePages ──────────────────────────────────────────────────────────
  describe('visiblePages', () => {
    it('should show all pages when total pages <= maxVisible', () => {
      fixture.componentRef.setInput('total', 30);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.detectChanges();

      const pages = component.visiblePages().filter((p) => p !== '...');
      expect(pages).toEqual([1, 2, 3]);
    });

    it('should include ellipsis when pages exceed maxVisible', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.componentRef.setInput('page', 1);
      fixture.detectChanges();

      expect(component.visiblePages()).toContain('...');
    });

    it('should always include page 1 and last page', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.componentRef.setInput('page', 5);
      fixture.detectChanges();

      const pages = component.visiblePages();
      expect(pages[0]).toBe(1);
      expect(pages[pages.length - 1]).toBe(10);
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('should have aria-label on the nav element', () => {
      const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
      expect(nav.getAttribute('aria-label')).toBeTruthy();
    });

    it('should mark active page button with aria-current="page"', () => {
      fixture.componentRef.setInput('page', 2);
      fixture.detectChanges();
      const activeBtn = fixture.nativeElement.querySelector('[aria-current="page"]');
      expect(activeBtn).not.toBeNull();
    });
  });
});
