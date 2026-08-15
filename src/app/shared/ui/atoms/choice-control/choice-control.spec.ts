import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChoiceControl } from './choice-control';

describe('ChoiceControl', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceControl],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders a controlled checkbox and emits its boolean state', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('label', 'Seleccionar cuenta');
    fixture.componentRef.setInput('checked', true);
    let selected = true;
    fixture.componentInstance.changed.subscribe((checked) => (selected = checked));
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBeTrue();
    expect(fixture.nativeElement.classList.contains('choice-control--checked')).toBeTrue();
    expect(input.getAttribute('aria-label')).toBe('Seleccionar cuenta');
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(selected).toBeFalse();
  });

  it('supports an accessible radio without visible text', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('type', 'radio');
    fixture.componentRef.setInput('ariaLabel', 'Cliente registrado');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('radio');
    expect(fixture.nativeElement.classList.contains('choice-control--disabled')).toBeTrue();
    expect(input.getAttribute('aria-label')).toBe('Cliente registrado');
  });

  /*
    UNA CASILLA QUE NO PUEDE DECIR QUE ESTA MAL DEJA A LA PERSONA ADIVINANDO.

    Sin esto, una casilla obligatoria sin marcar hacia que el formulario se
    negara a enviarse en silencio. Y las rutinas que llevan el foco al primer
    campo invalido buscan `[aria-invalid="true"]`: sin ese atributo, este control
    era invisible para ellas y el foco no iba a ninguna parte.
  */
  it('anuncia el error y queda alcanzable por las rutinas de foco', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('label', 'Confirmo la correccion');
    fixture.componentRef.setInput('error', 'Debe confirmar antes de continuar.');
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    const nativo = raiz.querySelector('input') as HTMLInputElement;
    const aviso = raiz.querySelector('.choice__error') as HTMLElement;

    expect(aviso).not.toBeNull();
    expect(aviso.textContent?.trim()).toBe('Debe confirmar antes de continuar.');
    // Se anuncia solo: aparece despues de intentar enviar.
    expect(aviso.getAttribute('role')).toBe('alert');
    // Y el control queda asociado al mensaje y marcado como invalido.
    expect(nativo.getAttribute('aria-invalid')).toBe('true');
    expect(nativo.getAttribute('aria-describedby')).toBe(aviso.id);
  });

  it('sin error no ensucia el marcado', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('label', 'Acepto');
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.querySelector('.choice__error')).toBeNull();
    expect(raiz.querySelector('input')?.hasAttribute('aria-invalid')).toBeFalse();
    expect(raiz.querySelector('input')?.hasAttribute('aria-describedby')).toBeFalse();
  });
});
