import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DropdownComponent } from './dropdown.component';

const OPCIONES = [
  { value: 'a', label: 'Alfa' },
  { value: 'b', label: 'Beta' },
];

@Component({
  selector: 'app-test-dropdown-host',
  imports: [DropdownComponent, ReactiveFormsModule],
  template: `<app-dropdown
    label="Letra"
    placeholder="Elija una letra"
    [options]="opciones"
    [variant]="variante()"
    [formControl]="control"
  ></app-dropdown>`,
})
class Anfitrion {
  readonly opciones = OPCIONES;
  readonly control = new FormControl<string | null>(null);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
}

const elevada = (raiz: HTMLElement) => !!raiz.querySelector('.fl-label--floating.fl-label--floated');
const flotante = (raiz: HTMLElement) => raiz.querySelector('.fl-label--floating');
const marcador = (raiz: HTMLElement) => raiz.querySelector('.placeholder');
const disparador = (raiz: HTMLElement) => raiz.querySelector('button.dropdown-trigger') as HTMLButtonElement;

describe('DropdownComponent - etiqueta y modos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('por defecto es standard: etiqueta superior, marcador visible y nombre accesible por aria-labelledby', async () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    fixture.componentRef.setInput('label', 'Letra');
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(flotante(raiz)).toBeNull();
    const etiqueta = raiz.querySelector('.fl-label') as HTMLElement;
    expect(etiqueta.closest('.fl-control')).toBeNull();
    expect(disparador(raiz).getAttribute('aria-labelledby')).toBe(etiqueta.id);
    expect(marcador(raiz)).not.toBeNull();
  });

  it('floating: reposo sin marcador; abrir sube la etiqueta y muestra el marcador', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(elevada(raiz)).toBe(false);
    expect(marcador(raiz)).toBeNull();
    expect(flotante(raiz)?.parentElement?.classList.contains('fl-control')).toBe(true);

    disparador(raiz).click();
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(true);
    expect(marcador(raiz)?.textContent?.trim()).toBe('Elija una letra');
    expect(disparador(raiz).getAttribute('aria-labelledby')).toBe(flotante(raiz)?.id);
  });

  it('floating-value: abrir vacio no sube la etiqueta; con valor si', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    disparador(raiz).click();
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(false);
    expect(marcador(raiz)).toBeNull();

    fixture.componentInstance.control.setValue('b');
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(true);
    expect(raiz.querySelector('.dropdown-value')?.textContent?.trim()).toBe('Beta');
  });

  it('FormControl: reset devuelve la etiqueta a su reposo y deshabilitar la marca', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.control.setValue('a');
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(true);
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(false);
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('.fl-label--floating.fl-label--disabled'),
    ).not.toBeNull();
  });

  it('sin etiqueta usa ariaLabel como nombre accesible', async () => {
    const fixture = TestBed.createComponent(DropdownComponent);
    fixture.componentRef.setInput('ariaLabel', 'Letra');
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();
    expect(disparador(fixture.nativeElement).getAttribute('aria-label')).toBe('Letra');
    expect(disparador(fixture.nativeElement).hasAttribute('aria-labelledby')).toBe(false);
  });
});
