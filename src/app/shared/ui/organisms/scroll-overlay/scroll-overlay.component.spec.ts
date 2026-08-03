import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ScrollOverlayComponent } from './scroll-overlay.component';

describe('ScrollOverlayComponent', () => {
  const originalResizeObserver = globalThis.ResizeObserver;
  const originalMutationObserver = globalThis.MutationObserver;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;

  let resizeCallback: ResizeObserverCallback;
  let mutationCallback: MutationCallback;
  let pendingFrame: FrameRequestCallback | undefined;

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
      imports: [ScrollOverlayComponent],
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

    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(
      frameCountBeforeObservers + 1,
    );
    pendingFrame?.(16);
    expect(geometrySpy).toHaveBeenCalledTimes(1);
  });
});
