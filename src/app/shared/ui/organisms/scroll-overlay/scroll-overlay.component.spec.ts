import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollOverlayComponent } from './scroll-overlay.component';

@Component({
  standalone: true,
  imports: [ScrollOverlayComponent],
  template: `
    <app-scroll-overlay
      class="outer-overlay"
      horizontalSelector=".outer-horizontal"
      verticalSelector=".outer-vertical"
    >
      <div class="outer-horizontal">
        <div class="outer-vertical">
          <app-scroll-overlay class="inner-overlay">
            <div>Contenido interno</div>
          </app-scroll-overlay>
        </div>
      </div>
    </app-scroll-overlay>
  `,
})
class NestedScrollOverlayHostComponent {}

describe('ScrollOverlayComponent', () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalMutationObserver = globalThis.MutationObserver;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  let resizeCallback: ResizeObserverCallback;
  let mutationCallback: MutationCallback;
  let pendingFrame: FrameRequestCallback | undefined;

  const setScrollMetrics = (
    element: HTMLElement,
    metrics: Partial<Pick<HTMLElement, 'clientHeight' | 'clientWidth' | 'scrollHeight' | 'scrollWidth'>>,
  ): void => {
    for (const [property, value] of Object.entries(metrics)) {
      Object.defineProperty(element, property, { configurable: true, value });
    }
    Object.defineProperty(element, 'scrollTop', {
      configurable: true,
      value: element.scrollTop,
      writable: true,
    });
    Object.defineProperty(element, 'scrollLeft', {
      configurable: true,
      value: element.scrollLeft,
      writable: true,
    });
  };

  beforeEach(async () => {
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
    globalThis.MutationObserver = class {
      constructor(callback: MutationCallback) {
        mutationCallback = callback;
      }
      observe(): void {}
      disconnect(): void {}
      takeRecords(): MutationRecord[] {
        return [];
      }
    };
    globalThis.requestAnimationFrame = jasmine
      .createSpy('requestAnimationFrame')
      .and.callFake((callback: FrameRequestCallback) => {
        pendingFrame = callback;
        return 17;
      });
    globalThis.cancelAnimationFrame = jasmine.createSpy('cancelAnimationFrame');

    await TestBed.configureTestingModule({
      imports: [ScrollOverlayComponent, NestedScrollOverlayHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
    globalThis.MutationObserver = originalMutationObserver;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('coalesces resize and row mutations into one geometry pass per frame', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as unknown as {
      syncGeometry: () => void;
    };
    const geometrySpy = spyOn(component, 'syncGeometry').and.callThrough();
    const frameCountBeforeObservers = (
      globalThis.requestAnimationFrame as jasmine.Spy
    ).calls.count();

    resizeCallback([], {} as ResizeObserver);
    mutationCallback([], {} as MutationObserver);
    mutationCallback([], {} as MutationObserver);

    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(frameCountBeforeObservers + 1);
    pendingFrame?.(16);
    expect(geometrySpy).toHaveBeenCalledTimes(1);
  });

  it('hides native scrollbars on every custom scroller managed by the overlay', async () => {
    const fixture = TestBed.createComponent(NestedScrollOverlayHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const horizontal = fixture.nativeElement.querySelector('.outer-horizontal') as HTMLElement;
    const vertical = fixture.nativeElement.querySelector('.outer-vertical') as HTMLElement;

    expect(horizontal.getAttribute('data-so-managed-scrollbar')).toBe('true');
    expect(vertical.getAttribute('data-so-managed-scrollbar')).toBe('true');
    expect(getComputedStyle(horizontal).getPropertyValue('scrollbar-width')).toBe('none');
    expect(getComputedStyle(vertical).getPropertyValue('scrollbar-width')).toBe('none');
  });

  it('does not remove managed-axis markers from a nested overlay', async () => {
    const fixture = TestBed.createComponent(NestedScrollOverlayHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const innerRoot = fixture.nativeElement.querySelector('.inner-overlay') as HTMLElement;
    const innerScrollArea = innerRoot.querySelector('.so-scroll-area') as HTMLElement;

    expect(innerScrollArea.getAttribute('data-so-horizontal')).toBe('true');
    expect(innerScrollArea.getAttribute('data-so-vertical')).toBe('true');
    expect(innerScrollArea.getAttribute('data-so-managed-scrollbar')).toBe('true');
  });

  it('routes wheel gestures from projected content to the managed viewport', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    setScrollMetrics(viewport, { clientHeight: 200, scrollHeight: 800 });

    const wheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 120,
    });
    viewport.dispatchEvent(wheel);

    expect(viewport.scrollTop).toBe(120);
    expect(wheel.defaultPrevented).toBe(true);
  });

  it('leaves Ctrl and Meta wheel gestures to browser zoom and pinch handling', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    setScrollMetrics(viewport, { clientHeight: 200, scrollHeight: 800 });

    for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
      viewport.scrollTop = 0;
      const wheel = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: 120,
        ...modifier,
      });
      viewport.dispatchEvent(wheel);

      expect(viewport.scrollTop).toBe(0);
      expect(wheel.defaultPrevented).toBe(false);
    }
  });

  it('uses Shift plus wheel for horizontal movement', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    setScrollMetrics(viewport, { clientWidth: 200, scrollWidth: 800 });

    const wheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 90,
      shiftKey: true,
    });
    viewport.dispatchEvent(wheel);

    expect(viewport.scrollLeft).toBe(90);
    expect(wheel.defaultPrevented).toBe(true);
  });

  it('routes a negative wheel delta toward the beginning of the viewport', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    setScrollMetrics(viewport, { clientHeight: 200, scrollHeight: 800 });
    viewport.scrollTop = 180;

    const wheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: -70,
    });
    viewport.dispatchEvent(wheel);

    expect(viewport.scrollTop).toBe(110);
    expect(wheel.defaultPrevented).toBe(true);
  });

  it('keeps nested native scroll ownership and chains at its edge', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    const nested = document.createElement('div');
    nested.style.overflowY = 'auto';
    viewport.append(nested);
    setScrollMetrics(viewport, { clientHeight: 200, scrollHeight: 800 });
    setScrollMetrics(nested, { clientHeight: 100, scrollHeight: 500 });

    const nestedWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    });
    nested.dispatchEvent(nestedWheel);

    expect(nestedWheel.defaultPrevented).toBe(false);
    expect(viewport.scrollTop).toBe(0);

    nested.scrollTop = 400;
    const boundaryWheel = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    });
    nested.dispatchEvent(boundaryWheel);

    expect(boundaryWheel.defaultPrevented).toBe(true);
    expect(viewport.scrollTop).toBe(80);
  });
});
