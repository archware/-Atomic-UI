import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloatingInputComponent } from './floating-input.component';

@Component({
  selector: 'app-test-floating-host',
  imports: [FloatingInputComponent, ReactiveFormsModule],
  template: `<app-floating-input
    label="Nombre"
    placeholder="Escriba su nombre"
    [variant]="variante()"
    [error]="error"
    [formControl]="control"
  ></app-floating-input>`,
})
class Anfitrion {
  readonly control = new FormControl('');
  readonly variante = signal<
    'standard' | 'floating' | 'floating-value' | 'underline' | 'material' | 'outline'
  >('floating');
  error = '';
}

const etiquetaInterna = (raiz: HTMLElement) => raiz.querySelector('label.floating-label');
const campo = (raiz: HTMLElement) => raiz.querySelector('input') as HTMLInputElement;
const caja = (raiz: HTMLElement) => raiz.querySelector('.floating-input-wrapper') as HTMLElement;

describe('FloatingInputComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('conserva floating como valor por defecto de su identidad', () => {
    const fixture = TestBed.createComponent(FloatingInputComponent);
    expect(fixture.componentInstance.variant()).toBe('floating');
  });

  it('standard: etiqueta superior fuera de la caja, sin etiqueta flotante y marcador visible', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('standard');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const superior = raiz.querySelector('label.fl-label') as HTMLLabelElement;
    expect(superior.textContent?.trim()).toBe('Nombre');
    expect(superior.closest('.floating-input-wrapper')).toBeNull();
    expect(superior.htmlFor).toBe(campo(raiz).id);
    expect(etiquetaInterna(raiz)).toBeNull();
    expect(caja(raiz).classList.contains('variant-standard')).toBe(true);
    expect(campo(raiz).getAttribute('placeholder')).toBe('Escriba su nombre');
  });

  it('floating: el marcador solo aparece cuando la etiqueta sube (enfoque o valor)', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(campo(raiz).hasAttribute('placeholder')).toBe(false);

    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('focused')).toBe(true);
    expect(campo(raiz).getAttribute('placeholder')).toBe('Escriba su nombre');

    campo(raiz).dispatchEvent(new Event('blur'));
    fixture.componentInstance.control.setValue('Ana');
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('has-value')).toBe(true);
    expect(campo(raiz).getAttribute('placeholder')).toBe('Escriba su nombre');
  });

  it('floating-value: dibuja la caja flotante y enfocar vacio no sube la etiqueta ni muestra el marcador', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(caja(raiz).classList.contains('variant-floating')).toBe(true);
    expect(caja(raiz).classList.contains('label-solo-valor')).toBe(true);

    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(campo(raiz).hasAttribute('placeholder')).toBe(false);

    fixture.componentInstance.control.setValue('Luis');
    await fixture.whenStable();
    expect(campo(raiz).getAttribute('placeholder')).toBe('Escriba su nombre');
  });

  it('las formas historicas (underline, material, outline) siguen siendo flotantes', async () => {
    for (const variante of ['underline', 'material', 'outline'] as const) {
      const fixture = TestBed.createComponent(Anfitrion);
      fixture.componentInstance.variante.set(variante);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      expect(etiquetaInterna(raiz)).not.toBeNull();
      expect(caja(raiz).classList.contains(`variant-${variante}`)).toBe(true);
    }
  });

  it('sin etiqueta no se crea etiqueta flotante y el marcador se conserva', async () => {
    const fixture = TestBed.createComponent(FloatingInputComponent);
    fixture.componentRef.setInput('placeholder', 'Buscar');
    await fixture.whenStable();
    expect(etiquetaInterna(fixture.nativeElement)).toBeNull();
    expect(campo(fixture.nativeElement).getAttribute('placeholder')).toBe('Buscar');
  });

  it('un error marca la caja y muestra su mensaje', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.error = 'Requerido';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('.input-error')?.textContent?.trim()).toBe('Requerido');
    expect(caja(raiz).classList.contains('has-error')).toBe(true);
  });
});
