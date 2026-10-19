import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectComponent } from './select.component';
import { Select } from '../form-select/select';

const OPCIONES = [
  { value: 'A', label: 'Activo' },
  { value: 'I', label: 'Inactivo' },
];

@Component({
  selector: 'app-test-select-ngmodel',
  imports: [SelectComponent, FormsModule],
  template: `<app-select
    label="Estado"
    placeholder="Seleccione un estado"
    [options]="opciones"
    [variant]="variante()"
    [(ngModel)]="estado"
  ></app-select>`,
})
class AnfitrionNgModel {
  readonly opciones = OPCIONES;
  readonly estado = signal<string | null>(null);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
}

@Component({
  selector: 'app-test-select-reactive',
  imports: [SelectComponent, ReactiveFormsModule],
  template: `<app-select
    label="Estado"
    variant="floating"
    [options]="opciones"
    [hint]="ayuda"
    [error]="error"
    [formControl]="control"
  ></app-select>`,
})
class AnfitrionReactivo {
  readonly opciones = OPCIONES;
  readonly control = new FormControl<string | null>(null);
  ayuda = '';
  error = '';
}

function etiquetaFlotante(raiz: HTMLElement): HTMLLabelElement | null {
  return raiz.querySelector('label.fl-label--floating');
}

function estaElevada(raiz: HTMLElement): boolean {
  return !!raiz.querySelector('label.fl-label--floating.fl-label--floated');
}

function nativo(raiz: HTMLElement): HTMLSelectElement {
  return raiz.querySelector('select') as HTMLSelectElement;
}

describe('SelectComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionNgModel, AnfitrionReactivo, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('es la misma clase que el alias historico `Select` (una sola implementacion)', () => {
    expect(Select).toBe(SelectComponent);
  });

  it('el valor por defecto es standard: etiqueta superior fuera de la caja del control', async () => {
    const fixture = TestBed.createComponent(SelectComponent);
    fixture.componentRef.setInput('label', 'Tipo');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(etiquetaFlotante(raiz)).toBeNull();
    const superior = raiz.querySelector('label.fl-label');
    expect(superior?.textContent?.trim()).toBe('Tipo');
    expect(superior?.closest('.fl-control')).toBeNull();
    expect(nativo(raiz).classList.contains('field__select--resting')).toBe(false);
  });

  describe('reactividad del valor', () => {
    it('ngModel: valor inicial y limpieza mueven la etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.estado.set('I');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
      expect(nativo(fixture.nativeElement).value).toBe('I');

      fixture.componentInstance.estado.set(null);
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
    });

    it('FormControl: setValue y reset mueven la etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);

      fixture.componentInstance.control.setValue('A');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.control.reset();
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
    });
  });

  describe('variant', () => {
    it('floating en reposo oculta el texto del marcador; al enfocar lo muestra y la etiqueta sube', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = nativo(raiz);

      expect(estaElevada(raiz)).toBe(false);
      expect(control.classList.contains('field__select--resting')).toBe(true);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(true);
      expect(control.classList.contains('field__select--resting')).toBe(false);

      control.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.classList.contains('field__select--resting')).toBe(true);
    });

    it('floating-value: enfocar vacio mantiene el marcador oculto; elegir una opcion sube la etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('floating-value');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = nativo(raiz);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.classList.contains('field__select--resting')).toBe(true);

      control.value = 'A';
      control.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(fixture.componentInstance.estado()).toBe('A');
      expect(estaElevada(raiz)).toBe(true);
      expect(control.classList.contains('field__select--resting')).toBe(false);
    });

    it('cambiar variant en caliente cambia de etiqueta superior a flotante', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('standard');
      await fixture.whenStable();
      expect(etiquetaFlotante(fixture.nativeElement)).toBeNull();
      fixture.componentInstance.variante.set('floating');
      await fixture.whenStable();
      expect(etiquetaFlotante(fixture.nativeElement)).not.toBeNull();
    });

    it('sin etiqueta no hay etiqueta flotante, el marcador no se oculta y hay aria-label', async () => {
      const fixture = TestBed.createComponent(SelectComponent);
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('placeholder', 'Elija');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      expect(etiquetaFlotante(raiz)).toBeNull();
      expect(nativo(raiz).classList.contains('field__select--resting')).toBe(false);
      expect(nativo(raiz).getAttribute('aria-label')).toBe('Elija');
    });
  });

  describe('geometria con ayuda y error', () => {
    it('error y ayuda quedan FUERA de la caja del control y se enlazan por aria-describedby', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.error = 'Seleccione un estado';
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;

      const etiqueta = etiquetaFlotante(raiz);
      const mensaje = raiz.querySelector('.form-error');
      expect(etiqueta?.parentElement?.classList.contains('fl-control')).toBe(true);
      expect(mensaje?.closest('.fl-control')).toBeNull();
      expect(nativo(raiz).getAttribute('aria-describedby')).toBe(mensaje?.id);
      expect(nativo(raiz).getAttribute('aria-invalid')).toBe('true');
      expect(etiqueta?.classList.contains('fl-label--error')).toBe(true);
    });

    it('la ayuda queda fuera de la caja del control', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.ayuda = 'Estado del registro';
      await fixture.whenStable();
      const ayuda = fixture.nativeElement.querySelector(
        '.field__message',
      );
      expect(ayuda?.textContent?.trim()).toBe('Estado del registro');
      expect(ayuda?.closest('.fl-control')).toBeNull();
      expect(nativo(fixture.nativeElement).getAttribute('aria-describedby')).toBe(ayuda?.id);
    });
  });

  it('deshabilitado por FormControl marca control y etiqueta', async () => {
    const fixture = TestBed.createComponent(AnfitrionReactivo);
    await fixture.whenStable();
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    expect(nativo(fixture.nativeElement).disabled).toBe(true);
    expect(
      fixture.nativeElement.querySelector('label.fl-label--floating.fl-label--disabled'),
    ).not.toBeNull();
  });
});
