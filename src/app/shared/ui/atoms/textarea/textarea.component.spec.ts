import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaComponent } from './textarea.component';

@Component({
  selector: 'app-test-textarea-ngmodel',
  imports: [TextareaComponent, FormsModule],
  template: `<app-textarea
    label="Observaciones"
    placeholder="Escriba aqui"
    [variant]="variante()"
    [(ngModel)]="texto"
  ></app-textarea>`,
})
class AnfitrionNgModel {
  readonly texto = signal('');
  readonly variante = signal<'standard' | 'floating' | 'floating-value' | 'outline' | 'material'>(
    'floating',
  );
}

@Component({
  selector: 'app-test-textarea-reactive',
  imports: [TextareaComponent, ReactiveFormsModule],
  template: `<app-textarea
    label="Observaciones"
    placeholder="Escriba aqui"
    variant="floating"
    [error]="error"
    [formControl]="control"
  ></app-textarea>`,
})
class AnfitrionReactivo {
  readonly control = new FormControl('');
  error = '';
}

function etiquetaFlotante(raiz: HTMLElement): HTMLLabelElement | null {
  return raiz.querySelector('label.fl-label--floating');
}

function estaElevada(raiz: HTMLElement): boolean {
  return !!raiz.querySelector('label.fl-label--floating.fl-label--floated');
}

function area(raiz: HTMLElement): HTMLTextAreaElement {
  return raiz.querySelector('textarea') as HTMLTextAreaElement;
}

describe('TextareaComponent - modos de etiqueta', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionNgModel, AnfitrionReactivo],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  describe('reactividad del valor (la etiqueta flotante debe seguir al modelo)', () => {
    it('ngModel: valor inicial, cambio programatico y limpieza', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.texto.set('Texto inicial');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.texto.set('');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);

      fixture.componentInstance.texto.set('otro');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
      expect(area(fixture.nativeElement).value).toBe('otro');
    });

    it('ngModel: lo que teclea la persona sube la etiqueta y actualiza el modelo', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      await fixture.whenStable();
      const control = area(fixture.nativeElement);
      control.value = 'tecleado';
      control.dispatchEvent(new Event('input'));
      await fixture.whenStable();

      expect(fixture.componentInstance.texto()).toBe('tecleado');
      expect(estaElevada(fixture.nativeElement)).toBe(true);
    });

    it('FormControl: setValue, reset y valor inicial', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);

      fixture.componentInstance.control.setValue('desde el formulario');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);

      fixture.componentInstance.control.reset();
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
      expect(area(fixture.nativeElement).value).toBe('');
    });

    it('FormControl: el valor inicial ya eleva la etiqueta en el primer render', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.control.setValue('previo');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
    });

    it('FormControl: deshabilitar bloquea el control y marca la etiqueta', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      await fixture.whenStable();
      fixture.componentInstance.control.disable();
      await fixture.whenStable();

      expect(area(fixture.nativeElement).disabled).toBe(true);
      expect(
        fixture.nativeElement.querySelector('label.fl-label--floating.fl-label--disabled'),
      ).not.toBeNull();
    });
  });

  describe('variant', () => {
    it('standard: etiqueta superior fija, sin etiqueta flotante, marcador siempre visible', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('standard');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;

      const superior = raiz.querySelector('label.fl-label:not(.fl-label--floating)');
      expect(superior?.textContent?.trim()).toBe('Observaciones');
      expect(etiquetaFlotante(raiz)).toBeNull();
      expect(area(raiz).getAttribute('placeholder')).toBe('Escriba aqui');
      // La etiqueta superior vive FUERA de la caja del control.
      expect(superior?.closest('.fl-control')).toBeNull();
    });

    it('floating: sube al enfocar y vuelve al desenfocar vacio; el marcador solo aparece arriba', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = area(raiz);

      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(true);
      expect(control.getAttribute('placeholder')).toBe('Escriba aqui');

      control.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);
    });

    it('floating-value: enfocar un campo vacio NO sube la etiqueta ni muestra el marcador; con valor si', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('floating-value');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const control = area(raiz);

      control.dispatchEvent(new Event('focus'));
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(false);
      expect(control.hasAttribute('placeholder')).toBe(false);

      fixture.componentInstance.texto.set('con valor');
      await fixture.whenStable();
      expect(estaElevada(raiz)).toBe(true);
      expect(control.getAttribute('placeholder')).toBe('Escriba aqui');
    });

    it('outline (historica): la etiqueta esta siempre elevada', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('outline');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
    });

    it('material (historica): se comporta como floating', async () => {
      const fixture = TestBed.createComponent(AnfitrionNgModel);
      fixture.componentInstance.variante.set('material');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(false);
      fixture.componentInstance.texto.set('x');
      await fixture.whenStable();
      expect(estaElevada(fixture.nativeElement)).toBe(true);
    });

    it('sin etiqueta no hay etiqueta flotante y el marcador se conserva', async () => {
      const fixture = TestBed.createComponent(TextareaComponent);
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('placeholder', 'Solo marcador');
      await fixture.whenStable();
      expect(etiquetaFlotante(fixture.nativeElement)).toBeNull();
      expect(area(fixture.nativeElement).getAttribute('placeholder')).toBe('Solo marcador');
    });

    it('el valor por defecto es standard (el mismo que Input y Select)', async () => {
      const fixture = TestBed.createComponent(TextareaComponent);
      fixture.componentRef.setInput('label', 'Notas');
      await fixture.whenStable();
      expect(etiquetaFlotante(fixture.nativeElement)).toBeNull();
      expect(fixture.nativeElement.querySelector('label.fl-label')).not.toBeNull();
    });
  });

  describe('geometria con ayuda y error', () => {
    it('la etiqueta flotante se ancla a la caja del control y el mensaje queda fuera de ella', async () => {
      const fixture = TestBed.createComponent(AnfitrionReactivo);
      fixture.componentInstance.error = 'Campo obligatorio';
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;

      const etiqueta = etiquetaFlotante(raiz);
      const mensaje = raiz.querySelector('.textarea-message--error');
      expect(etiqueta).not.toBeNull();
      expect(mensaje?.textContent?.trim()).toBe('Campo obligatorio');
      // Centrado correcto: `top` se mide contra `.fl-control`, que NO contiene el mensaje.
      expect(etiqueta?.parentElement?.classList.contains('fl-control')).toBe(true);
      expect(mensaje?.closest('.fl-control')).toBeNull();
      expect(area(raiz).getAttribute('aria-describedby')).toBe(mensaje?.id);
      expect(area(raiz).getAttribute('aria-invalid')).toBe('true');
      expect(etiqueta?.classList.contains('fl-label--error')).toBe(true);
    });

    it('la ayuda se relaciona por aria-describedby y tambien queda fuera de la caja', async () => {
      const fixture = TestBed.createComponent(TextareaComponent);
      fixture.componentRef.setInput('label', 'Notas');
      fixture.componentRef.setInput('variant', 'floating');
      fixture.componentRef.setInput('hint', 'Maximo 200 caracteres');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      const ayuda = raiz.querySelector('.textarea-message:not(.textarea-message--error)');

      expect(ayuda?.textContent?.trim()).toBe('Maximo 200 caracteres');
      expect(ayuda?.closest('.fl-control')).toBeNull();
      expect(area(raiz).getAttribute('aria-describedby')).toBe(ayuda?.id);
    });

    it('asocia la etiqueta con el textarea mediante for/id', async () => {
      const fixture = TestBed.createComponent(TextareaComponent);
      fixture.componentRef.setInput('label', 'Notas');
      fixture.componentRef.setInput('variant', 'floating');
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      expect(etiquetaFlotante(raiz)?.htmlFor).toBe(area(raiz).id);
    });
  });
});
