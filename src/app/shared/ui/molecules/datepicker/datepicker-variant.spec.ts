import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatepickerComponent } from './datepicker.component';

@Component({
  selector: 'app-test-datepicker-host',
  imports: [DatepickerComponent, ReactiveFormsModule],
  template: `<app-datepicker label="Nacimiento" [variant]="variante()" [formControl]="control" />`,
})
class Anfitrion {
  readonly control = new FormControl<Date | null>(null);
  readonly variante = signal<'standard' | 'floating' | 'floating-value' | 'outline'>('standard');
}

const interno = (raiz: HTMLElement) => raiz.querySelector('app-floating-input') as HTMLElement;
const caja = (raiz: HTMLElement) =>
  raiz.querySelector('.floating-input-wrapper') as HTMLElement;

describe('DatepickerComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('por defecto es standard: etiqueta superior, caja sin etiqueta propia, icono alineado', async () => {
    const fixture = TestBed.createComponent(DatepickerComponent);
    fixture.componentRef.setInput('label', 'Nacimiento');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.variant()).toBe('standard');
    const superior = raiz.querySelector('.datepicker-top-label');
    expect(superior?.textContent?.trim()).toBe('Nacimiento');
    expect(raiz.querySelector('.fl-label')).toBe(superior);
    expect(interno(raiz).querySelector('.floating-label')).toBeNull();
    expect(raiz.querySelector('.datepicker-wrapper--standard')).not.toBeNull();
    // El icono vive dentro de la caja: la etiqueta superior no lo desplaza.
    expect(superior?.closest('.datepicker-wrapper')).toBeNull();
    expect(raiz.querySelector('.datepicker-trigger')?.getAttribute('aria-label')).toBe(
      'Abrir calendario: Nacimiento',
    );
  });

  it('floating: la etiqueta la dibuja el campo interno y sube al enfocar/abrir el disparador o con valor', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const disparador = raiz.querySelector('.datepicker-trigger') as HTMLElement;
    expect(raiz.querySelector('.datepicker-top-label')).toBeNull();
    expect(interno(raiz).querySelector('.floating-label')?.textContent?.trim()).toBe('Nacimiento');
    expect(caja(raiz).classList.contains('focused')).toBe(false);
    expect(caja(raiz).classList.contains('has-value')).toBe(false);

    disparador.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('focused')).toBe(true);

    disparador.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('focused')).toBe(false);

    disparador.click();
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('focused')).toBe(true);

    disparador.click();
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('focused')).toBe(false);

    fixture.componentInstance.control.setValue(new Date(2000, 0, 15));
    await fixture.whenStable();
    await fixture.whenStable();
    expect(caja(raiz).classList.contains('has-value')).toBe(true);
  });

  it('floating-value llega al campo interno como caja flotante de momento solo-valor', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    expect(caja(fixture.nativeElement).classList.contains('label-solo-valor')).toBe(true);
  });

  it('las formas historicas (outline) se siguen aceptando como flotantes', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('outline');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('.datepicker-top-label')).toBeNull();
    expect(caja(raiz).classList.contains('variant-outline')).toBe(true);
  });
});
