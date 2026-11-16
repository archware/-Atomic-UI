import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagInputComponent } from './tag-input.component';

@Component({
  selector: 'app-test-tag-input-host',
  imports: [TagInputComponent, FormsModule],
  template: `<app-tag-input
    label="Etiquetas"
    placeholder="Escriba y pulse Enter"
    [variant]="variante()"
    [error]="error"
    [(ngModel)]="etiquetas"
  ></app-tag-input>`,
})
class Anfitrion {
  readonly etiquetas = signal<string[]>([]);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
  error = '';
}

@Component({
  selector: 'app-test-tag-input-reactive',
  imports: [TagInputComponent, ReactiveFormsModule],
  template: `<app-tag-input label="Etiquetas" variant="floating" [formControl]="control" />`,
})
class AnfitrionReactivo {
  readonly control = new FormControl<string[]>([]);
}

const elevada = (raiz: HTMLElement) => !!raiz.querySelector('label.fl-label--floating.fl-label--floated');
const flotante = (raiz: HTMLElement) => raiz.querySelector('label.fl-label--floating');
const campo = (raiz: HTMLElement) => raiz.querySelector('input.tag-input__input') as HTMLInputElement;

describe('TagInputComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion, AnfitrionReactivo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('por defecto es standard: etiqueta superior y marcador visible', async () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.componentRef.setInput('label', 'Etiquetas');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(flotante(raiz)).toBeNull();
    expect(raiz.querySelector('label.fl-label')?.closest('.fl-control')).toBeNull();
    expect(campo(raiz).getAttribute('placeholder')).toBeTruthy();
  });

  it('floating: reposo sin marcador; enfocar sube la etiqueta y muestra el marcador', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(elevada(raiz)).toBe(false);
    expect(campo(raiz).hasAttribute('placeholder')).toBe(false);
    expect(flotante(raiz)?.parentElement?.classList.contains('fl-control')).toBe(true);

    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(true);
    expect(campo(raiz).getAttribute('placeholder')).toBe('Escriba y pulse Enter');
  });

  it('floating-value: enfocar vacio no sube la etiqueta; con etiquetas (tags) si', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(false);

    fixture.componentInstance.etiquetas.set(['uno']);
    await fixture.whenStable();
    await fixture.whenStable();
    expect(raiz.querySelectorAll('app-chip').length).toBe(1);
    expect(elevada(raiz)).toBe(true);
  });

  it('FormControl: setValue y reset mueven la etiqueta flotante', async () => {
    const fixture = TestBed.createComponent(AnfitrionReactivo);
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(false);
    fixture.componentInstance.control.setValue(['a', 'b']);
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(true);
    fixture.componentInstance.control.setValue([]);
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(false);
  });

  it('el error queda fuera de la caja, marca el contenedor y la etiqueta', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.error = 'Requerido';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const wrapper = raiz.querySelector('.tag-input-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('fl-field')).toBe(true);
    expect(wrapper.classList.contains('tag-input--error')).toBe(true);
    expect(raiz.querySelector('.tag-input__error')?.closest('.fl-control')).toBeNull();
    expect(flotante(raiz)?.classList.contains('fl-label--error')).toBe(true);
  });

  it('marca tag-input--elevated sin salto vertical al enfocar vacio, centra verticalmente el input vacio y aplica padding superior extra solo cuando hay chips', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const wrapper = raiz.querySelector('.tag-input-wrapper') as HTMLElement;
    const caja = raiz.querySelector('.tag-input__field') as HTMLElement;
    const etiquetaEl = flotante(raiz) as HTMLElement;
    etiquetaEl.style.transition = 'none';

    expect(wrapper.classList.contains('tag-input--elevated')).toBe(false);
    expect(wrapper.classList.contains('tag-input--has-tags')).toBe(false);
    const estiloCajaReposo = getComputedStyle(caja);
    const paddingReposo = parseFloat(estiloCajaReposo.paddingTop);
    expect(parseFloat(estiloCajaReposo.paddingLeft)).toBeCloseTo(16, 0);
    const altoReposo = caja.getBoundingClientRect().height;

    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(wrapper.classList.contains('tag-input--elevated')).toBe(true);
    expect(wrapper.classList.contains('tag-input--has-tags')).toBe(false);
    expect(parseFloat(getComputedStyle(caja).paddingTop)).toBeCloseTo(paddingReposo, 0);
    const rectCajaVacia = caja.getBoundingClientRect();
    const rectInputVacio = campo(raiz).getBoundingClientRect();
    expect(rectCajaVacia.height).toBeCloseTo(altoReposo, 0);
    expect(
      Math.abs((rectInputVacio.top - rectCajaVacia.top) - (rectCajaVacia.bottom - rectInputVacio.bottom)),
    ).toBeLessThanOrEqual(1);
    expect(rectInputVacio.top).toBeGreaterThanOrEqual(etiquetaEl.getBoundingClientRect().bottom);

    campo(raiz).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(caja.getBoundingClientRect().height).toBeCloseTo(altoReposo, 0);

    fixture.componentInstance.etiquetas.set(['tryghhg', 'uhhjjh', 'rtytyytyt']);
    await fixture.whenStable();
    await fixture.whenStable();
    expect(wrapper.classList.contains('tag-input--elevated')).toBe(true);
    expect(wrapper.classList.contains('tag-input--has-tags')).toBe(true);

    const paddingElevado = parseFloat(getComputedStyle(caja).paddingTop);
    expect(paddingElevado).toBeGreaterThan(paddingReposo);
    expect(paddingElevado).toBeGreaterThanOrEqual(16);

    const primerChip = raiz.querySelector('app-chip') as HTMLElement;
    expect(primerChip.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      etiquetaEl.getBoundingClientRect().bottom,
    );
  });

  it('muestra asterisco de obligatoriedad y aria-required en modos standard, floating y floating-value cuando required es true, y los omite por defecto', async () => {
    const fixture = TestBed.createComponent(TagInputComponent);
    fixture.componentRef.setInput('label', 'Etiquetas');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(raiz.querySelector('.fl-label__required')).toBeNull();
    expect(campo(raiz).hasAttribute('aria-required')).toBe(false);

    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();

    expect(raiz.querySelector('.tag-input__label .fl-label__required')?.textContent).toBe('*');
    expect(campo(raiz).getAttribute('aria-required')).toBe('true');

    for (const variante of ['floating', 'floating-value'] as const) {
      fixture.componentRef.setInput('variant', variante);
      await fixture.whenStable();
      expect(flotante(raiz)?.querySelector('.fl-label__required')?.textContent).toBe('*');
      expect(campo(raiz).getAttribute('aria-required')).toBe('true');
    }
  });

  it('suprime anillo interno (box-shadow/outline) en .tag-input__input al enfocar y aplica peso 700 y contraste legible en la etiqueta flotante', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const inputEl = campo(raiz);
    const etiquetaEl = flotante(raiz) as HTMLElement;
    etiquetaEl.style.transition = 'none';

    const estiloReposo = getComputedStyle(etiquetaEl);
    expect(estiloReposo.fontWeight).toBe('700');

    inputEl.focus();
    inputEl.dispatchEvent(new Event('focus'));
    await fixture.whenStable();

    const estiloInput = getComputedStyle(inputEl);
    expect(estiloInput.boxShadow).toBe('none');
    expect(estiloInput.outlineStyle).toBe('none');

    const estiloElevado = getComputedStyle(etiquetaEl);
    expect(estiloElevado.fontWeight).toBe('700');
    expect(parseFloat(estiloElevado.fontSize)).toBeCloseTo(13, 1);
  });
});
