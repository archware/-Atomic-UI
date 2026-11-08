import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { PaginationComponent } from './pagination.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent, TranslateModule.forRoot()],
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

    it('should always include page 1 and last page when on middle page', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.componentRef.setInput('page', 5);
      fixture.detectChanges();

      const pages = component.visiblePages();
      expect(pages).toEqual([1, '...', 3, 4, 5, 6, 7, '...', 10]);
    });

    it('should include page 1 as active button when on page 1 and totalPages > maxVisible', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.componentRef.setInput('page', 1);
      fixture.detectChanges();

      expect(component.visiblePages()).toEqual([1, 2, 3, 4, 5, '...', 10]);
      const activeBtn = fixture.nativeElement.querySelector('.page-btn.active') as HTMLButtonElement | null;
      expect(activeBtn).not.toBeNull();
      expect(activeBtn?.textContent?.trim()).toBe('1');
      expect(activeBtn?.getAttribute('aria-current')).toBe('page');
    });

    it('should include last page as active button without duplication when on last page and totalPages > maxVisible', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('maxVisible', 5);
      fixture.componentRef.setInput('page', 10);
      fixture.detectChanges();

      expect(component.visiblePages()).toEqual([1, '...', 6, 7, 8, 9, 10]);
      const activeBtn = fixture.nativeElement.querySelector('.page-btn.active') as HTMLButtonElement | null;
      expect(activeBtn).not.toBeNull();
      expect(activeBtn?.textContent?.trim()).toBe('10');
      expect(activeBtn?.getAttribute('aria-current')).toBe('page');
    });
  });

  // ── Variants & visual differentiation ─────────────────────────────────────
  describe('variants visual treatment', () => {
    it('renders distinct active and disabled button styles and variant treatments', () => {
      fixture.componentRef.setInput('total', 100);
      fixture.componentRef.setInput('pageSize', 10);
      fixture.componentRef.setInput('page', 1);
      fixture.componentRef.setInput('variant', 'standard');
      fixture.detectChanges();

      const hostEl = fixture.nativeElement as HTMLElement;
      const activeBtn = hostEl.querySelector('.page-btn.active') as HTMLElement;
      const inactiveBtn = hostEl.querySelectorAll('.page-btn.page-number')[1] as HTMLElement;
      const disabledPrev = hostEl.querySelector('.page-prev') as HTMLElement;

      expect(activeBtn.textContent?.trim()).toBe('1');
      expect(getComputedStyle(activeBtn).backgroundColor).toBeTruthy();
      expect(getComputedStyle(activeBtn).backgroundColor).not.toBe(
        getComputedStyle(inactiveBtn).backgroundColor,
      );
      expect(getComputedStyle(disabledPrev).boxShadow).toBe('none');

      fixture.componentRef.setInput('variant', 'rounded');
      fixture.detectChanges();
      const roundedNav = hostEl.querySelector('.pagination-rounded') as HTMLElement;
      const roundedInactiveBtn = hostEl.querySelectorAll('.pagination-rounded .page-btn.page-number')[1] as HTMLElement;
      roundedInactiveBtn.style.transition = 'none';
      expect(roundedNav).not.toBeNull();
      expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(
        getComputedStyle(roundedInactiveBtn).backgroundColor,
      );
      const isJsdom = getComputedStyle(activeBtn).backgroundColor.startsWith('var(');
      if (!isJsdom) {
        expect(parseFloat(getComputedStyle(roundedNav).borderTopLeftRadius)).toBeGreaterThan(20);
      }

      fixture.componentRef.setInput('variant', 'cards');
      fixture.detectChanges();
      const cardsNav = hostEl.querySelector('.pagination-cards') as HTMLElement;
      const cardBtn = hostEl.querySelector('.pagination-cards .page-btn.page-number:not(.active)') as HTMLElement;
      expect(cardsNav).not.toBeNull();
      expect(cardBtn).not.toBeNull();
      expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(
        getComputedStyle(cardsNav).backgroundColor,
      );
      if (isJsdom) {
        expect(getComputedStyle(cardBtn).borderBottomColor).toBe(
          'var(--pagination-card-accent-border)',
        );
      } else {
        expect(parseFloat(getComputedStyle(cardBtn).borderBottomWidth)).toBeGreaterThanOrEqual(2);
      }

      fixture.componentRef.setInput('variant', 'minimal');
      fixture.detectChanges();
      const badgeEl = hostEl.querySelector('.pagination-minimal .page-minimal-text') as HTMLElement;
      expect(badgeEl).not.toBeNull();
      expect(getComputedStyle(badgeEl).backgroundColor).toBeTruthy();
    });

    it('applies high-contrast semantic tokens in light, dark, and brand-dark themes', () => {
      const root = document.documentElement;
      const previousTheme = root.getAttribute('data-theme');
      try {
        fixture.componentRef.setInput('total', 100);
        fixture.componentRef.setInput('pageSize', 10);
        fixture.componentRef.setInput('page', 1);
        fixture.componentRef.setInput('variant', 'standard');
        fixture.detectChanges();

        const hostEl = fixture.nativeElement as HTMLElement;
        const wrapper = hostEl.querySelector('.pagination-wrapper') as HTMLElement;
        const activeBtn = hostEl.querySelector('.page-btn.active') as HTMLElement;
        const inactiveBtn = hostEl.querySelectorAll('.page-btn.page-number')[1] as HTMLElement;
        activeBtn.style.transition = 'none';
        inactiveBtn.style.transition = 'none';

        root.setAttribute('data-theme', 'light');
        root.classList.remove('dark', 'theme-dark');
        const lightWrapperBg = getComputedStyle(wrapper).backgroundColor;
        const lightActiveBg = getComputedStyle(activeBtn).backgroundColor;

        root.setAttribute('data-theme', 'dark');
        const darkWrapperBg = getComputedStyle(wrapper).backgroundColor;
        const darkActiveBg = getComputedStyle(activeBtn).backgroundColor;
        const darkInactiveBg = getComputedStyle(inactiveBtn).backgroundColor;

        expect(darkActiveBg).not.toBe(darkInactiveBg);

        root.setAttribute('data-theme', 'brand-dark');
        const brandDarkWrapperBg = getComputedStyle(wrapper).backgroundColor;
        const brandDarkActiveBg = getComputedStyle(activeBtn).backgroundColor;
        expect(brandDarkActiveBg).toBe(darkActiveBg);

        if (lightWrapperBg.startsWith('var(')) {
          expect(lightWrapperBg).toBe('var(--pagination-wrapper-bg)');
          expect(lightActiveBg).toBe('var(--pagination-active-bg)');
          expect(darkInactiveBg).toBe('var(--pagination-bg)');
        } else {
          expect(darkWrapperBg).not.toBe(lightWrapperBg);
          expect(darkActiveBg).not.toBe(lightActiveBg);
          expect(brandDarkWrapperBg).not.toBe(lightWrapperBg);
        }
      } finally {
        if (previousTheme === null) {
          root.removeAttribute('data-theme');
        } else {
          root.setAttribute('data-theme', previousTheme);
        }
      }
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
