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

  it('el error queda fuera de la caja y pinta la etiqueta flotante', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating');
    fixture.componentInstance.error = 'Fuera de rango';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('.number-input__error')?.closest('.fl-control')).toBeNull();
    expect(flotante(raiz)?.classList.contains('fl-label--error')).toBe(true);
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
});

