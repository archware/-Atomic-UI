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

  it('el error queda fuera de la caja y marca la etiqueta', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.error = 'Requerido';
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(raiz.querySelector('.tag-input__error')?.closest('.fl-control')).toBeNull();
    expect(flotante(raiz)?.classList.contains('fl-label--error')).toBe(true);
  });
});
