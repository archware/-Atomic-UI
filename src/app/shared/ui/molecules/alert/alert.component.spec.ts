import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Alert } from './alert.component';

describe('Alert', () => {
  let fixture: ComponentFixture<Alert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Alert);
  });

  it('aplica la clase semantica del kind y muestra el titulo', async () => {
    fixture.componentRef.setInput('kind', 'warning');
    fixture.componentRef.setInput('title', 'Atencion');
    await fixture.whenStable();

    const alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.classList).toContain('alert--warning');
    expect(fixture.nativeElement.querySelector('.alert__title')?.textContent?.trim()).toBe(
      'Atencion',
    );
  });

  it('traslada el espaciado de flujo al host, no al elemento interno', async () => {
    fixture.componentRef.setInput('spacing', 'compact');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('alert-flow--compact');

    fixture.componentRef.setInput('spacing', 'none');
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).classList).toContain('alert-flow--none');
  });

  it('reserva la interrupcion del lector de pantalla para el kind danger', async () => {
    fixture.componentRef.setInput('kind', 'info');
    await fixture.whenStable();
    let alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.getAttribute('aria-live')).toBe('polite');

    fixture.componentRef.setInput('kind', 'danger');
    await fixture.whenStable();
    alert = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.getAttribute('aria-live')).toBe('assertive');
  });

  it('emite closed y desaparece de verdad en modo zoneless', async () => {
    fixture.componentRef.setInput('closable', true);
    let closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => (closedCount += 1));
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.alert__close button') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(closedCount).toBe(1);
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();
  });

  it('renderiza iconos correctos para info, success y warning', async () => {
    const iconMap: Record<string, string> = {
      'info': 'fa-circle-info',
      'success': 'fa-circle-check',
      'warning': 'fa-triangle-exclamation'
    };
    
    for (const kind of ['info', 'success', 'warning'] as const) {
      fixture.componentRef.setInput('kind', kind);
      await fixture.whenStable();
      const icon = fixture.nativeElement.querySelector('.alert__icon') as HTMLElement;
      expect(icon).not.toBeNull();
      expect(icon.classList).toContain(iconMap[kind]);
    }
  });

  it('renderiza el icono blades.heavy para danger', async () => {
    fixture.componentRef.setInput('kind', 'danger');
    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('.alert__icon') as HTMLElement;
    expect(icon).withContext('danger debe tener icono').not.toBeNull();
    expect(icon.classList).toContain('close');
    expect(icon.classList).toContain('blades');
    expect(icon.classList).toContain('heavy');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });
});
