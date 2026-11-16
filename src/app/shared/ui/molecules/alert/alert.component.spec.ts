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

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('alert.spec.cerrada');
    }
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

  it('conserva la cruz de error sin duplicar las cuchillas CSS del cierre', async () => {
    fixture.componentRef.setInput('kind', 'danger');
    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('.alert__icon') as HTMLElement;
    expect(icon).withContext('danger debe tener icono').not.toBeNull();
    expect(icon.classList).toContain('fa-xmark');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('aplica modo compacto y permite colapsar a una linea', async () => {
    fixture.componentRef.setInput('compact', true);
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('startCollapsed', true);
    await fixture.whenStable();

    const panel = fixture.nativeElement.querySelector('.alert') as HTMLElement;
    const message = fixture.nativeElement.querySelector('.alert__message') as HTMLElement;
    expect(panel.classList).toContain('alert--compact');
    expect(panel.classList).toContain('alert--collapsed');
    expect(message.classList).toContain('alert__message--collapsed');
    expect(message.hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('.alert__title')?.textContent?.trim()).toBe(
      'Nota informativa',
    );

    (fixture.nativeElement.querySelector('.alert__toggle button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(panel.classList).not.toContain('alert--collapsed');
    expect(message.classList).not.toContain('alert__message--collapsed');
    expect(message.hidden).toBe(false);
  });

  it('restaura ocultamiento persistido y respeta autoHide dinamico', async () => {
    fixture.componentRef.setInput('rememberClosedKey', 'alert.spec.cerrada');
    fixture.componentRef.setInput('closable', true);
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('.alert__close button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(window.localStorage.getItem('alert.spec.cerrada')).toBe('1');
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();

    const fixtureNueva = TestBed.createComponent(Alert);
    fixtureNueva.componentRef.setInput('rememberClosedKey', 'alert.spec.cerrada');
    await fixtureNueva.whenStable();
    expect(fixtureNueva.nativeElement.querySelector('.alert')).toBeNull();

    const fixtureAuto = TestBed.createComponent(Alert);
    jasmine.clock().install();
    try {
      fixtureAuto.componentRef.setInput('autoHideMs', 100);
      fixtureAuto.detectChanges();
      expect(fixtureAuto.nativeElement.querySelector('.alert')).not.toBeNull();
      jasmine.clock().tick(110);
      fixtureAuto.detectChanges();
      expect(fixtureAuto.nativeElement.querySelector('.alert')).toBeNull();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('reabre la alerta cerrada cuando cambia reopenToken y restaura startCollapsed', async () => {
    fixture.componentRef.setInput('closable', true);
    fixture.componentRef.setInput('collapsible', true);
    fixture.componentRef.setInput('startCollapsed', true);
    fixture.componentRef.setInput('reopenToken', 'corte-1');
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.alert__toggle button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('.alert__message') as HTMLElement).hidden).toBe(false);

    (fixture.nativeElement.querySelector('.alert__close button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.alert')).toBeNull();

    fixture.componentRef.setInput('reopenToken', 'corte-2');
    await fixture.whenStable();
    const reopenedMsg = fixture.nativeElement.querySelector('.alert__message') as HTMLElement;
    expect(reopenedMsg).not.toBeNull();
    expect(reopenedMsg.hidden).toBe(true);
  });

  it('usa acento lateral y lectura neutra en los cuatro tonos', async () => {
    const host = fixture.nativeElement as HTMLElement;
    // Fixture de tokens: prueba el CSS real de la molécula, no una clase simulada.
    for (const [token, value] of Object.entries({
      '--space-1': '4px', '--space-2': '8px', '--space-3': '12px',
      '--space-4': '16px', '--text-sm': '14px', '--text-lg': '18px',
      '--text-color': 'rgb(240, 240, 240)',
    })) host.style.setProperty(token, value);
    for (const kind of ['info', 'success', 'warning', 'danger'] as const) {
      host.style.setProperty(`--alert-${kind}-bg`, 'rgb(30, 40, 50)');
      host.style.setProperty(`--alert-${kind}-border`, 'rgb(100, 160, 220)');
      host.style.setProperty(`--alert-${kind}-text`, 'rgb(180, 210, 240)');
      fixture.componentRef.setInput('kind', kind);
      fixture.componentRef.setInput('title', 'Aviso largo que se conserva');
      await fixture.whenStable();
      const panel = host.querySelector('.alert') as HTMLElement;
      const style = getComputedStyle(panel);
      expect(style.borderInlineStartWidth).toBe('4px');
      expect(style.borderTopWidth).toBe('0px');
      expect(style.color).toBe('rgb(240, 240, 240)');
      expect(style.backgroundColor).toBe('rgb(30, 40, 50)');
      expect(getComputedStyle(host.querySelector('.alert__icon')!).color).toBe('rgb(180, 210, 240)');
      for (const width of [320, 375, 768, 1366]) {
        host.style.width = `${width}px`;
        expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
      }
    }
  });
});
