import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NumberInputComponent } from './number-input.component';

@Component({
  selector: 'app-test-number-host',
  imports: [NumberInputComponent, FormsModule],
  template: `<app-number-input
    label="Cantidad"
    [variant]="variante()"
    [labelHidden]="oculta()"
    [error]="error"
    [(ngModel)]="cantidad"
  ></app-number-input>`,
})
class Anfitrion {
  readonly cantidad = signal(3);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('standard');
  readonly oculta = signal(false);
  error = '';
}

const flotante = (raiz: HTMLElement) => raiz.querySelector('label.fl-label--floating');

describe('NumberInputComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('por defecto es standard: etiqueta superior asociada al campo', async () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('label', 'Cantidad');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const etiqueta = raiz.querySelector('label.number-input__label') as HTMLLabelElement;
    expect(etiqueta.classList.contains('fl-label')).toBe(true);
    expect(etiqueta.htmlFor).toBe((raiz.querySelector('input') as HTMLInputElement).id);
    expect(flotante(raiz)).toBeNull();
  });

  it('floating y floating-value: un campo numerico siempre tiene valor, la etiqueta queda elevada sobre el borde', async () => {
    for (const variante of ['floating', 'floating-value'] as const) {
      const fixture = TestBed.createComponent(Anfitrion);
      fixture.componentInstance.variante.set(variante);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const etiqueta = flotante(raiz);
      expect(etiqueta?.classList.contains('fl-label--floated')).toBe(true);
      expect(etiqueta?.parentElement?.classList.contains('fl-control')).toBe(true);
      expect(raiz.querySelector('label.number-input__label')).toBeNull();
      expect((etiqueta as HTMLLabelElement).htmlFor).toBe(
        (raiz.querySelector('input') as HTMLInputElement).id,
      );
    }
  });

  it('el error queda fuera de la caja, marca el contenedor y pinta la etiqueta', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating');
    fixture.componentInstance.error = 'Fuera de rango';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const wrapper = raiz.querySelector('.number-input-wrapper') as HTMLElement;
    const etiquetaFlotanteEl = flotante(raiz) as HTMLElement;
    expect(wrapper.classList.contains('number-input--error')).toBe(true);
    expect(raiz.querySelector('.number-input__error')?.closest('.fl-control')).toBeNull();
    expect(etiquetaFlotanteEl.classList.contains('fl-label--error')).toBe(true);
    const colorErrorFlotante = getComputedStyle(etiquetaFlotanteEl).color;

    fixture.componentInstance.variante.set('standard');
    await fixture.whenStable();
    const etiquetaSuperior = raiz.querySelector('label.number-input__label') as HTMLElement;
    expect(etiquetaSuperior.classList.contains('fl-label--error')).toBe(true);
    expect(getComputedStyle(etiquetaSuperior).color).toBe(colorErrorFlotante);
  });

  it('labelHidden conserva la etiqueta como nombre accesible sin ::ng-deep del consumidor', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.oculta.set(true);
    await fixture.whenStable();
    const etiqueta = fixture.nativeElement.querySelector('label.number-input__label--hidden');
    expect(etiqueta?.textContent?.trim()).toBe('Cantidad');
  });

  it('muestra asterisco de obligatoriedad y aria-required en modos standard, floating y floating-value cuando required es true, y los omite por defecto', async () => {
    const fixture = TestBed.createComponent(NumberInputComponent);
    fixture.componentRef.setInput('label', 'Cantidad');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const inputEl = raiz.querySelector('input') as HTMLInputElement;

    expect(raiz.querySelector('.fl-label__required')).toBeNull();
    expect(inputEl.hasAttribute('aria-required')).toBe(false);
    expect(inputEl.required).toBe(false);

    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();

    expect(raiz.querySelector('.number-input__label .fl-label__required')?.textContent).toBe('*');
    expect(inputEl.getAttribute('aria-required')).toBe('true');
    expect(inputEl.required).toBe(true);

    for (const variante of ['floating', 'floating-value'] as const) {
      fixture.componentRef.setInput('variant', variante);
      await fixture.whenStable();
      expect(flotante(raiz)?.querySelector('.fl-label__required')?.textContent).toBe('*');
      expect(inputEl.getAttribute('aria-required')).toBe('true');
    }
  });

  it('floating: conserva el alto canonico (--control-height), centra verticalmente los botones sin solapar la etiqueta elevada y elimina divisores verticales', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('standard');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const control = raiz.querySelector('.number-input__control') as HTMLElement;
    const altoStandard = control.getBoundingClientRect().height;

    fixture.componentInstance.variante.set('floating');
    await fixture.whenStable();
    const inputEl = raiz.querySelector('.number-input__field') as HTMLElement;
    const botonDecrementar = raiz.querySelector('.number-input__btn') as HTMLElement;
    const etiquetaEl = flotante(raiz) as HTMLElement;
    etiquetaEl.style.transition = 'none';

    const estiloInput = getComputedStyle(inputEl);
    expect(estiloInput.borderLeftWidth).toBe('0px');
    expect(estiloInput.borderRightWidth).toBe('0px');
    expect(estiloInput.boxShadow).toBe('none');

    inputEl.focus();
    inputEl.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(getComputedStyle(inputEl).boxShadow).toBe('none');
    expect(getComputedStyle(etiquetaEl).fontWeight).toBe('700');
    expect(parseFloat(getComputedStyle(etiquetaEl).fontSize)).toBeCloseTo(13, 1);

    const rectControl = control.getBoundingClientRect();
    const rectEtiqueta = etiquetaEl.getBoundingClientRect();
    const rectBoton = botonDecrementar.getBoundingClientRect();

    expect(rectControl.height).toBeCloseTo(altoStandard, 0);
    expect(rectBoton.top).toBeGreaterThanOrEqual(rectEtiqueta.bottom);
    const holguraSuperior = rectBoton.top - rectControl.top;
    const holguraInferior = rectControl.bottom - rectBoton.bottom;
    expect(Math.abs(holguraSuperior - holguraInferior)).toBeLessThanOrEqual(1);

    botonDecrementar.focus();
    await fixture.whenStable();
    expect(getComputedStyle(botonDecrementar).boxShadow).toBe('none');

    const hojas = Array.from(document.head.querySelectorAll('style'))
      .map((s) => s.textContent ?? '')
      .join('\n');
    expect(hojas).not.toContain('var(--surface-hover, var(--primary-color))');
  });
});
