import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceiptPanel } from './receipt-panel';

describe('ReceiptPanel', () => {
  let fixture: ComponentFixture<ReceiptPanel>;
  let component: ReceiptPanel;

  function createPrintWindow(): {
    readonly value: Window;
    readonly document: Document;
    readonly frames: FrameRequestCallback[];
    readonly lifecycle: EventTarget;
    readonly focus: jasmine.Spy;
    readonly print: jasmine.Spy;
    readonly close: jasmine.Spy;
  } {
    const printDocument = document.implementation.createHTMLDocument('');
    const frames: FrameRequestCallback[] = [];
    const lifecycle = new EventTarget();
    const focus = jasmine.createSpy('focus');
    const print = jasmine.createSpy('print');
    const close = jasmine.createSpy('close');
    const value = {
      document: printDocument,
      closed: false,
      focus,
      print,
      close,
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      },
      addEventListener: lifecycle.addEventListener.bind(lifecycle),
      removeEventListener: lifecycle.removeEventListener.bind(lifecycle),
    } as unknown as Window;

    return {
      value,
      document: printDocument,
      frames,
      lifecycle,
      focus,
      print,
      close,
    };
  }

  function flushAnimationFrames(frames: FrameRequestCallback[]): void {
    while (frames.length > 0) {
      frames.shift()?.(0);
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptPanel],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ReceiptPanel);
    component = fixture.componentInstance;
  });

  it('renders an accessible summary from stable fields', () => {
    fixture.componentRef.setInput('title', 'Comprobante de pago');
    fixture.componentRef.setInput('ariaLabel', 'Comprobante OP-123');
    fixture.componentRef.setInput('fields', [
      { id: 'operation', label: 'Operación', value: 'OP-123' },
      { id: 'amount', label: 'Monto', value: 'S/ 25.00', emphasis: true },
    ]);
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[role="region"]') as HTMLElement;
    expect(region.getAttribute('aria-label')).toBe('Comprobante OP-123');
    expect(region.textContent).toContain('Comprobante de pago');
    expect(region.textContent).toContain('S/ 25.00');
    expect(
      fixture.nativeElement.querySelector('.receipt-panel__detail--emphasis'),
    ).not.toBeNull();
  });

  it('refuses to print an empty receipt', () => {
    const open = spyOn(window, 'open').and.returnValue(null);

    expect(component.print()).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  it('prints from a rendered isolated document and treats receipt data as plain text', () => {
    const printWindow = createPrintWindow();
    const receiptText = 'RAPIDIARIO\n<script>window.opener.location = "bad"</script>';
    fixture.componentRef.setInput('printText', receiptText);
    fixture.detectChanges();
    spyOn(window, 'open').and.returnValue(printWindow.value);

    expect(component.print()).toBe(true);
    expect(printWindow.document.querySelector('pre')?.textContent).toBe(receiptText);
    expect(printWindow.document.querySelector('script')).toBeNull();
    expect(printWindow.document.querySelector('style')?.textContent).toContain(
      'var(--receipt-printable-width, 48mm)',
    );
    expect(printWindow.document.querySelector('style')?.textContent).toContain(
      'size: auto;',
    );
    expect(printWindow.print).not.toHaveBeenCalled();

    flushAnimationFrames(printWindow.frames);

    expect(printWindow.focus).toHaveBeenCalledTimes(1);
    expect(printWindow.print).toHaveBeenCalledTimes(1);

    printWindow.lifecycle.dispatchEvent(new Event('afterprint'));
    expect(printWindow.close).toHaveBeenCalledTimes(1);
  });

  it('reports when the browser blocks the isolated print document', () => {
    fixture.componentRef.setInput('printText', 'RAPIDIARIO\nOP-BLOCKED');
    fixture.detectChanges();
    spyOn(window, 'open').and.returnValue(null);

    expect(component.print()).toBe(false);
  });

  it('closes the isolated document if printing fails after rendering', () => {
    const printWindow = createPrintWindow();
    printWindow.print.and.throwError('Print unavailable');
    fixture.componentRef.setInput('printText', 'RAPIDIARIO\nOP-ERROR');
    fixture.detectChanges();
    spyOn(window, 'open').and.returnValue(printWindow.value);

    expect(component.print()).toBe(true);
    flushAnimationFrames(printWindow.frames);

    expect(printWindow.close).toHaveBeenCalledTimes(1);
  });
});
