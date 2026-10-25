import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';
import { Input } from '../form-input/input';

@Component({
  selector: 'app-test-input-ngmodel',
  imports: [InputComponent, FormsModule],
  template: `<app-input
    label="Nombre"
    placeholder="Escriba su nombre"
    [variant]="variante()"
    [(ngModel)]="texto"
  ></app-input>`,
})
class AnfitrionNgModel {
  readonly texto = signal('');
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
}

@Component({
  selector: 'app-test-input-reactive',
  imports: [InputComponent, ReactiveFormsModule],
  template: `<app-input
    label="Nombre"
    placeholder="Escriba su nombre"
    variant="floating"
    [hint]="ayuda"
    [error]="error"
    [formControl]="control"
  ></app-input>`,
})
class AnfitrionReactivo {
  readonly control = new FormControl('');
  ayuda = '';
  error = '';
}

function etiquetaFlotante(raiz: HTMLElement): HTMLLabelElement | null {
  return raiz.querySelector('label.fl-label--floating');
}

function estaElevada(raiz: HTMLElement): boolean {
  return !!raiz.querySelector('label.fl-label--floating.fl-label--floated');
}

function campo(raiz: HTMLElement): HTMLInputElement {
  return raiz.querySelector('input') as HTMLInputElement;
}

describe('InputComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionNgModel, AnfitrionReactivo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('es la misma clase que el alias historico `Input` (una sola implementacion)', () => {
    expect(Input).toBe(InputComponent);
  });

  it('el valor por defecto es standard: etiqueta superior y marcador visible', async () => {
    const fixture = TestBed.createComponent(InputComponent);
    fixture.componentRef.setInput('label', 'Correo');
    fixture.componentRef.setInput('placeholder', 'nombre@correo.pe');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(etiquetaFlotante(raiz)).toBeNull();
    const superior = raiz.querySelector('label.fl-label');
    expect(superior?.textContent?.trim()).toBe('Correo');
    expect(superior?.closest('.fl-control')).toBeNull();
    expect(campo(raiz).getAttribute('placeholder')).toBe('nombre@correo.pe');
  });

  describe('reactividad del valor', () => {
    it('ngModel: valor inicial, cambio programatico y limpieza', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.texto.set('Ana');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.texto.set('');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
    });

    it('FormControl: setValue y reset mueven la etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);

      fixture.componentInstance.control.setValue('Luis');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.control.reset();
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
    });

    it('FormControl: reconcilia un valor nativo que llega sin evento input', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      const control = campo(fixture.nativeElement);

      control.value = 'Valor restaurado';
      control.dispatchEvent(new Event('change'));
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('Valor restaurado');
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.control.reset();
      await fixture.whenStable();
      control.value = 'Valor al perder foco';
      control.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('Valor al perder foco');

      fixture.componentInstance.control.setValue('Valor anterior');
      await fixture.whenStable();
      control.value = 'Valor restaurado sobre modelo previo';
      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(fixture.componentInstance.control.value).toBe('Valor restaurado sobre modelo previo');
    });
  });

  describe('variant', () => {
    it('floating: sube al enfocar y el marcador solo aparece cuando la etiqueta ya subio', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = campo(raiz);

      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(true);
      expect(control.getAttribute('placeholder')).toBe('Escriba su nombre');

      control.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);
    });

    it('floating-value: enfocar vacio no sube la etiqueta; con valor si', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('floating-value');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = campo(raiz);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);

      control.value = 'Marta';
      control.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(fixture.componentInstance.texto()).toBe('Marta');
      expect(estaElevada(raiz)).toBe(true);
      expect(control.getAttribute('placeholder')).toBe('Escriba su nombre');
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

    it('type=date en modo flotante: la etiqueta sube siempre (la mascara nativa ocuparia su sitio)', async () => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.componentRef.setInput('label', 'Fecha');
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('type', 'date');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
    });

    it('sin etiqueta no hay etiqueta flotante y el marcador se conserva', async () => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('placeholder', 'Buscar');
      await fixture.whenStable();
      expect(etiquetaFlotante(fixture.nativeElement)).toBeNull();
      expect(campo(fixture.nativeElement).getAttribute('placeholder')).toBe('Buscar');
    });
  });

  describe('geometria con ayuda y error', () => {
    it('el error queda FUERA de la caja del control: la etiqueta se centra solo contra el campo', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.error = 'Dato obligatorio';
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;

      const etiqueta = etiquetaFlotante(raiz);
      const mensaje = raiz.querySelector('.form-error');
      expect(etiqueta?.parentElement?.classList.contains('fl-control')).toBe(true);
      expect(mensaje?.closest('.fl-control')).toBeNull();
      expect(campo(raiz).getAttribute('aria-describedby')).toBe(mensaje?.id);
      expect(campo(raiz).getAttribute('aria-invalid')).toBe('true');
      expect(etiqueta?.classList.contains('fl-label--error')).toBe(true);
    });

    it('la ayuda tambien queda fuera de la caja y se enlaza por aria-describedby', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.ayuda = 'Como figura en su DNI';
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const ayuda = raiz.querySelector('.field__message');

      expect(ayuda?.textContent?.trim()).toBe('Como figura en su DNI');
      expect(ayuda?.closest('.fl-control')).toBeNull();
      expect(campo(raiz).getAttribute('aria-describedby')).toBe(ayuda?.id);
    });
  });

  describe('estado y accesibilidad', () => {
    it('deshabilitado por FormControl marca control y etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      fixture.componentInstance.control.disable();
      await fixture.whenStable();

      expect(campo(fixture.nativeElement).disabled).toBe(true);
      expect(
        fixture.nativeElement.querySelector('label.fl-label--floating.fl-label--disabled'),
      ).not.toBeNull();
    });

    it('la etiqueta flotante se asocia al input por for/id y marca la obligatoriedad', async () => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.componentRef.setInput('controlId', 'nombre-completo');
      fixture.componentRef.setInput('label', 'Nombre');
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('required', true);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;

      expect(etiquetaFlotante(raiz)?.htmlFor).toBe('nombre-completo');
      expect(campo(raiz).id).toBe('nombre-completo');
      expect(raiz.querySelector('label.fl-label--floating .field__required')?.textContent).toBe('*');
      expect(campo(raiz).getAttribute('aria-required')).toBe('true');
    });

    it('con icono, la etiqueta en reposo se desplaza para no solapar el icono', async () => {
      const fixture = TestBed.createComponent(InputComponent);
      fixture.componentRef.setInput('label', 'Buscar');
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('icon', '?');
      await fixture.whenStable();
      expect(fixture.nativeElement.querySelector('.field__control--icon')).not.toBeNull();
    });
  });
});
