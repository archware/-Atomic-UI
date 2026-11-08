import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { ErrorPagesComponent } from './error-pages.component';

describe('ErrorPagesComponent', () => {
  let fixture: ComponentFixture<ErrorPagesComponent>;
  let component: ErrorPagesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPagesComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza por defecto el código 404 con su título, descripción e icono canónicos', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.error-code')?.textContent?.trim()).toBe('404');
    expect(host.querySelector('.error-title')?.textContent?.trim()).toBe('Página no encontrada');
    expect(host.querySelector('.error-icon')?.textContent?.trim()).toBe('🔍');
    expect(host.querySelector('.error-technical')).toBeNull();
  });

  it('actualiza reactivamente los Signals de entrada (code, title, description, icon, acciones e info técnica) bajo OnPush y restaura defaults ante cadena vacía', () => {
    const host = fixture.nativeElement as HTMLElement;

    fixture.componentRef.setInput('code', 500);
    fixture.componentRef.setInput('showSecondaryAction', true);
    fixture.componentRef.setInput('showTechnicalInfo', true);
    fixture.componentRef.setInput('technicalMessage', 'GET /api/v1/reportes - 500');
    fixture.detectChanges();

    expect(host.querySelector('.error-code')?.textContent?.trim()).toBe('500');
    expect(host.querySelector('.error-title')?.textContent?.trim()).toBe('Error interno del servidor');
    expect(host.querySelectorAll('app-button').length).toBe(3);
    expect(host.querySelector('.error-technical code')?.textContent?.trim()).toBe(
      'GET /api/v1/reportes - 500',
    );

    fixture.componentRef.setInput('title', 'Fallo personalizado');
    fixture.componentRef.setInput('description', 'Descripción a medida');
    fixture.componentRef.setInput('icon', '🧾');
    fixture.detectChanges();

    expect(host.querySelector('.error-title')?.textContent?.trim()).toBe('Fallo personalizado');
    expect(host.querySelector('.error-description')?.textContent?.trim()).toBe('Descripción a medida');
    expect(host.querySelector('.error-icon')?.textContent?.trim()).toBe('🧾');

    fixture.componentRef.setInput('title', '   ');
    fixture.componentRef.setInput('description', '');
    fixture.componentRef.setInput('icon', '');
    fixture.detectChanges();

    expect(host.querySelector('.error-title')?.textContent?.trim()).toBe('Error interno del servidor');
    expect(host.querySelector('.error-icon')?.textContent?.trim()).toBe('💥');
  });

  it('navega a primaryActionRoute al invocar onPrimaryAction y prioriza data.code de ActivatedRoute cuando está presente', async () => {
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture.componentRef.setInput('primaryActionRoute', '/dashboard');
    fixture.detectChanges();
    component.onPrimaryAction();
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ErrorPagesComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { code: 403 } } },
        },
      ],
    }).compileComponents();

    const routedFixture = TestBed.createComponent(ErrorPagesComponent);
    routedFixture.detectChanges();
    const routedHost = routedFixture.nativeElement as HTMLElement;
    expect(routedHost.querySelector('.error-code')?.textContent?.trim()).toBe('403');
    expect(routedHost.querySelector('.error-title')?.textContent?.trim()).toBe('Acceso denegado');
  });
});
