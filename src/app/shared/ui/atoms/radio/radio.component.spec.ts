import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadioComponent } from './radio.component';

describe('RadioComponent: estado deshabilitado', () => {
  let fixture: ComponentFixture<RadioComponent>;
  let component: RadioComponent;

  const colorFondo = 'rgb(17, 34, 51)';
  const colorTexto = 'rgb(238, 239, 240)';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    const anfitrion = fixture.nativeElement as HTMLElement;
    anfitrion.style.setProperty('--input-disabled-bg', '#112233');
    anfitrion.style.setProperty('--input-disabled-text', '#eeeff0');
    fixture.componentRef.setInput('label', 'Preferencia');
    fixture.componentRef.setInput('options', [
      { value: 'correo', label: 'Correo' },
      { value: 'telefono', label: 'Teléfono' },
    ]);
  });

  it('aplica la señal deshabilitada al grupo, las etiquetas y los controles', () => {
    component.writeValue('correo');
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const entradas = Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
    const etiquetas = Array.from(
      fixture.nativeElement.querySelectorAll('.radio-label'),
    ) as HTMLElement[];
    const circulos = Array.from(
      fixture.nativeElement.querySelectorAll('.radio-circle'),
    ) as HTMLElement[];
    const etiquetaGrupo = fixture.nativeElement.querySelector(
      '.radio-group-label',
    ) as HTMLElement;
    const marca = fixture.nativeElement.querySelector('.radio-dot') as HTMLElement;

    expect(entradas.every((entrada) => entrada.disabled)).toBeTrue();
    expect(getComputedStyle(etiquetaGrupo).color).toBe(colorTexto);
    expect(
      etiquetas.every((etiqueta) => getComputedStyle(etiqueta).color === colorTexto),
    ).toBeTrue();
    expect(getComputedStyle(circulos[0]).backgroundColor).toBe(colorTexto);
    expect(getComputedStyle(circulos[0]).borderTopColor).toBe(colorTexto);
    expect(getComputedStyle(circulos[1]).backgroundColor).toBe(colorFondo);
    expect(getComputedStyle(circulos[1]).borderTopColor).toBe(colorTexto);
    expect(getComputedStyle(marca).backgroundColor).toBe(colorFondo);
    expect(getComputedStyle(marca).opacity).toBe('1');
  });

  it('aplica el mismo contrato a una opción deshabilitada de forma individual', () => {
    fixture.componentRef.setInput('options', [
      { value: 'correo', label: 'Correo' },
      { value: 'telefono', label: 'Teléfono', disabled: true },
    ]);
    component.writeValue('telefono');
    fixture.detectChanges();

    const contenedores = Array.from(
      fixture.nativeElement.querySelectorAll('.radio-wrapper'),
    ) as HTMLElement[];
    const entradas = Array.from(
      fixture.nativeElement.querySelectorAll('input'),
    ) as HTMLInputElement[];
    const circuloSeleccionado = contenedores[1].querySelector(
      '.radio-circle',
    ) as HTMLElement;
    const etiquetaSeleccionada = contenedores[1].querySelector(
      '.radio-label',
    ) as HTMLElement;

    expect(entradas[0].disabled).toBeFalse();
    expect(entradas[1].disabled).toBeTrue();
    expect(getComputedStyle(etiquetaSeleccionada).color).toBe(colorTexto);
    expect(getComputedStyle(circuloSeleccionado).backgroundColor).toBe(colorTexto);
    expect(getComputedStyle(circuloSeleccionado).borderTopColor).toBe(colorTexto);
    expect(getComputedStyle(etiquetaSeleccionada).opacity).toBe('1');
  });
});
