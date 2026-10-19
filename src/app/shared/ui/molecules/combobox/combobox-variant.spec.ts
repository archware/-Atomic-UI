import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComboboxComponent } from './combobox.component';

const OPCIONES = [
  { label: 'Arequipa', value: 'ARE' },
  { label: 'Cusco', value: 'CUS' },
];

@Component({
  selector: 'app-test-combobox-host',
  imports: [ComboboxComponent, FormsModule],
  template: `<app-combobox
    label="Region"
    placeholder="Busque una region"
    [options]="opciones"
    [variant]="variante()"
    [error]="error"
    [(ngModel)]="valor"
  ></app-combobox>`,
})
class Anfitrion {
  readonly opciones = OPCIONES;
  readonly valor = signal<string | null>(null);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
  error = '';
}

@Component({
  selector: 'app-test-combobox-reactive',
  imports: [ComboboxComponent, ReactiveFormsModule],
  template: `<app-combobox label="Region" variant="floating" [options]="opciones" [formControl]="control" />`,
})
class AnfitrionReactivo {
  readonly opciones = OPCIONES;
  readonly control = new FormControl<string | null>(null);
}

const elevada = (raiz: HTMLElement) => !!raiz.querySelector('label.fl-label--floating.fl-label--floated');
const flotante = (raiz: HTMLElement) => raiz.querySelector('label.fl-label--floating');
const campo = (raiz: HTMLElement) => raiz.querySelector('input') as HTMLInputElement;

describe('ComboboxComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Anfitrion, AnfitrionReactivo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('por defecto es standard: etiqueta superior fuera de la caja y marcador visible', async () => {
    const fixture = TestBed.createComponent(ComboboxComponent);
    fixture.componentRef.setInput('label', 'Region');
    fixture.componentRef.setInput('placeholder', 'Busque');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(flotante(raiz)).toBeNull();
    expect(raiz.querySelector('label.fl-label')?.closest('.fl-control')).toBeNull();
    expect(campo(raiz).getAttribute('placeholder')).toBe('Busque');
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
    expect(campo(raiz).getAttribute('placeholder')).toBe('Busque una region');
  });

  it('floating-value: enfocar vacio no sube la etiqueta; con valor si', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    campo(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(elevada(raiz)).toBe(false);
    expect(campo(raiz).hasAttribute('placeholder')).toBe(false);

    fixture.componentInstance.valor.set('CUS');
    await fixture.whenStable();
    await fixture.whenStable();
    expect(campo(raiz).value).toBe('Cusco');
    expect(elevada(raiz)).toBe(true);
  });

  it('FormControl: setValue y reset mueven la etiqueta', async () => {
    const fixture = TestBed.createComponent(AnfitrionReactivo);
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(false);
    fixture.componentInstance.control.setValue('ARE');
    await fixture.whenStable();
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(true);
    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    await fixture.whenStable();
    expect(elevada(fixture.nativeElement)).toBe(false);
  });

  it('el error queda fuera de la caja del control y marca la etiqueta flotante', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.error = 'Requerido';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const mensaje = raiz.querySelector('.combobox-error');
    expect(mensaje?.closest('.fl-control')).toBeNull();
    expect(flotante(raiz)?.classList.contains('fl-label--error')).toBe(true);
  });

  it('sin etiqueta floating no oculta el marcador', async () => {
    const fixture = TestBed.createComponent(ComboboxComponent);
    fixture.componentRef.setInput('variant', 'floating');
    fixture.componentRef.setInput('placeholder', 'Busque');
    await fixture.whenStable();
    expect(flotante(fixture.nativeElement)).toBeNull();
    expect(campo(fixture.nativeElement).getAttribute('placeholder')).toBe('Busque');
  });
});
