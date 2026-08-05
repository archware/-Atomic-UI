import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollOverlayComponent } from './scroll-overlay.component';

describe('ScrollOverlayComponent', () => {
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
    await TestBed.configureTestingModule({
      imports: [ScrollOverlayComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('keeps the projected viewport keyboard accessible when requested', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.componentRef.setInput('focusable', true);
    fixture.componentRef.setInput('viewportRole', 'region');
    fixture.componentRef.setInput('ariaLabel', 'Resultados de prueba');
    await fixture.whenStable();

    const viewport = fixture.nativeElement.querySelector(
      '.scroll-overlay__viewport',
    ) as HTMLElement;
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Resultados de prueba');
    expect(getComputedStyle(viewport).scrollbarWidth).toBe('none');
  });

  it('constrains a modal viewport and resets both scroll axes through its public API', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    fixture.componentRef.setInput('maxHeight', '32rem');
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const viewport = fixture.componentInstance.viewportElement;
    viewport.scrollTop = 80;
    viewport.scrollLeft = 25;

    fixture.componentInstance.scrollToStart();

    expect(host.style.getPropertyValue('--scroll-overlay-viewport-max-height')).toBe('32rem');
    expect(viewport.scrollTop).toBe(0);
    expect(viewport.scrollLeft).toBe(0);
  });

  it('scrolls the owned viewport when the wheel is used over its content', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    await fixture.whenStable();
    const viewport = fixture.componentInstance.viewportElement;
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
    await fixture.whenStable();
    const viewport = fixture.componentInstance.viewportElement;
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
    await fixture.whenStable();
    const viewport = fixture.componentInstance.viewportElement;
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
    await fixture.whenStable();
    const viewport = fixture.componentInstance.viewportElement;
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

  it('preserves a nested native scroller and chains the wheel at its boundary', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    await fixture.whenStable();
    const viewport = fixture.componentInstance.viewportElement;
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

  it('coalesces repeated geometry requests into one layout read per frame', async () => {
    const fixture = TestBed.createComponent(ScrollOverlayComponent);
    await fixture.whenStable();
    const component = fixture.componentInstance as unknown as {
      scheduleMetricsUpdate: () => void;
      updateMetrics: () => void;
    };
    const updateSpy = spyOn(component, 'updateMetrics').and.callThrough();
    let pendingFrame: FrameRequestCallback | undefined;
    const frameSpy = spyOn(window, 'requestAnimationFrame').and.callFake(
      (callback: FrameRequestCallback) => {
        pendingFrame = callback;
        return 21;
      },
    );

    component.scheduleMetricsUpdate();
    component.scheduleMetricsUpdate();
    component.scheduleMetricsUpdate();

    expect(frameSpy).toHaveBeenCalledTimes(1);
    pendingFrame?.(16);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
});
