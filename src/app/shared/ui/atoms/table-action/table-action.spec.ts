import { TestBed } from '@angular/core/testing';
import { TableAction } from './table-action';

describe('TableAction', () => {
  it('conserva el perfil histórico y añade el perfil compacto de catálogo explícito', () => {
    const casos = [
      // Consulta no comparte el verde de activar: cambio visual aprobado.
      ['view', 'fa-eye', 'neutral'], ['edit', 'fa-pen', 'info'],
      ['activate', 'fa-circle-check', 'success'],
      ['deactivate', 'fa-trash', 'danger'], ['delete', 'fa-trash', 'danger'],
    ] as const;
    for (const [action, icon, tone] of casos) {
      const fixture = TestBed.createComponent(TableAction);
      fixture.componentRef.setInput('label', action);
      fixture.componentRef.setInput('action', action);
      fixture.componentRef.setInput('profile', 'catalog');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('i').classList).toContain(icon);
      const clases = fixture.nativeElement.querySelector('button').classList;
      expect(clases).toContain(`table-action--${tone}`);
      expect(clases).toContain('table-action--profile-catalog');
      fixture.destroy();
    }
  });

  it('no emite durante carga ni deshabilitado', () => {
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Ver');
    const accion = jasmine.createSpy('accion');
    fixture.componentInstance.triggered.subscribe(accion);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(accion).not.toHaveBeenCalled();
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(accion).not.toHaveBeenCalled();
  });
  it('presenta la acción de consulta con color informativo cuando está habilitada', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Ver detalle');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList).toContain('table-action--info');
    expect(button.disabled).toBeFalse();
  });

  it('mantiene las tres variantes de tamaño y un nombre accesible', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('label', 'Editar registro');
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Editar registro');
    expect(button.classList).toContain('table-action--lg');
  });

  it('normaliza iconClass sin reemplazarlo por los tres puntos de custom', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const fixture = TestBed.createComponent(TableAction);
    fixture.componentRef.setInput('action', 'custom');
    fixture.componentRef.setInput('label', 'Imprimir comprobante');
    fixture.componentRef.setInput('iconClass', 'print');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.classList).toContain('fa-solid');
    expect(icon.classList).toContain('fa-print');
    expect(icon.classList).not.toContain('fa-ellipsis');
  });

  it('publica iconos semanticos para imprimir, revertir, canales y contrasena', async () => {
    await TestBed.configureTestingModule({ imports: [TableAction] }).compileComponents();
    const cases = [
      ['print', 'fa-print'],
      ['reverse', 'fa-rotate-left'],
      ['channels', 'fa-mobile-screen-button'],
      ['reset-password', 'fa-key'],
    ] as const;

    for (const [action, expectedIcon] of cases) {
      const fixture = TestBed.createComponent(TableAction);
      fixture.componentRef.setInput('action', action);
      fixture.componentRef.setInput('label', action);
      fixture.detectChanges();
      expect((fixture.nativeElement.querySelector('i') as HTMLElement).classList).toContain(
        expectedIcon,
      );
      fixture.destroy();
    }
  });
});
