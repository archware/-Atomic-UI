import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Select2Component } from './select2.component';

const OPCIONES = [
  { label: 'Arequipa', value: 'ARE' },
  { label: 'Cusco', value: 'CUS' },
  { label: 'Puno', value: 'PUN' },
];

@Component({
  selector: 'app-test-select2-host',
  imports: [Select2Component, FormsModule],
  template: `<app-select2
    label="Region"
    placeholder="Seleccione una region"
    [options]="opciones"
    [variant]="variante()"
    [multiple]="multiple()"
    [(ngModel)]="valor"
  ></app-select2>`,
})
class Anfitrion {
  readonly opciones = OPCIONES;
  readonly valor = signal<string | string[] | null>(null);
  readonly multiple = signal(false);
  readonly variante = signal<'standard' | 'floating' | 'floating-value'>('floating');
}

function etiquetaFlotante(raiz: HTMLElement): HTMLElement | null {
  return raiz.querySelector('.fl-label--floating');
}

function estaElevada(raiz: HTMLElement): boolean {
  return !!raiz.querySelector('.fl-label--floating.fl-label--floated');
}

function marcador(raiz: HTMLElement): HTMLElement | null {
  return raiz.querySelector('.placeholder');
}

function disparador(raiz: HTMLElement): HTMLElement {
  return raiz.querySelector('.select2-trigger') as HTMLElement;
}

describe('Select2Component - modos de etiqueta', () => {
  beforeEach(async () => {
    // jsdom no implementa scrollIntoView; el componente lo invoca al abrir la lista.
    Element.prototype.scrollIntoView = () => undefined;
    await TestBed.configureTestingModule({
      imports: [Anfitrion, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('el valor por defecto es standard (igual que Input, Select y Textarea)', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('label', 'Region');
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();
    expect(fixture.componentInstance.variant()).toBe('standard');
    expect(etiquetaFlotante(fixture.nativeElement)).toBeNull();
    // El combobox se asocia por aria-labelledby; su etiqueta visual no requiere un label nativo.
    const raiz: HTMLElement = fixture.nativeElement;
    const etiqueta = raiz.querySelector('.fl-label');
    expect(etiqueta).not.toBeNull();
    if (!etiqueta) throw new Error('Falta la etiqueta estándar de Select2');
    expect(etiqueta.textContent?.trim()).toBe('Region');
  });

  it('standard: la etiqueta superior y el marcador siempre visibles', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('standard');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(etiquetaFlotante(raiz)).toBeNull();
    expect(marcador(raiz)?.textContent?.trim()).toBe('Seleccione una region');
  });

  it('floating: en reposo oculta el marcador; abrir la lista sube la etiqueta y lo muestra', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(estaElevada(raiz)).toBe(false);
    expect(marcador(raiz)).toBeNull();
    // La etiqueta flotante se ancla al disparador (la caja), nunca a la lista ni a un mensaje.
    expect(etiquetaFlotante(raiz)?.closest('.select2-trigger')).not.toBeNull();

    disparador(raiz).click();
    await fixture.whenStable();
    expect(estaElevada(raiz)).toBe(true);
    expect(marcador(raiz)?.textContent?.trim()).toBe('Seleccione una region');
  });

  it('floating: el foco del teclado en el disparador tambien sube la etiqueta y marca focused en el wrapper', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const wrapper = raiz.querySelector('.select2-wrapper') as HTMLElement;

    disparador(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(estaElevada(raiz)).toBe(true);
    expect(wrapper.classList.contains('focused')).toBe(true);

    disparador(raiz).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(estaElevada(raiz)).toBe(false);
    expect(wrapper.classList.contains('focused')).toBe(false);
  });

  it('floating-value: abrir la lista vacia NO sube la etiqueta; con valor si', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.variante.set('floating-value');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    disparador(raiz).click();
    await fixture.whenStable();
    expect(estaElevada(raiz)).toBe(false);
    expect(marcador(raiz)).toBeNull();

    fixture.componentInstance.valor.set('CUS');
    await fixture.whenStable();
    expect(estaElevada(raiz)).toBe(true);
  });

  it('ngModel: valor inicial eleva la etiqueta y mostrarlo no deja el marcador', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.valor.set('PUN');
    await fixture.whenStable();
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(estaElevada(raiz)).toBe(true);
    expect(raiz.querySelector('.select2-value')?.textContent?.trim()).toBe('Puno');
    expect(marcador(raiz)).toBeNull();
  });

  it('seleccion multiple con etiqueta flotante: las etiquetas (tags) conviven con la etiqueta elevada', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.valor.set(['ARE', 'CUS']);
    await fixture.whenStable();
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;

    expect(estaElevada(raiz)).toBe(true);
    expect(raiz.querySelectorAll('.select2-tag').length).toBe(2);
    expect(marcador(raiz)).toBeNull();
  });

  it('seleccion multiple vacia con floating: etiqueta en reposo, sin marcador y sin salto de altura al enfocar', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.multiple.set(true);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(estaElevada(raiz)).toBe(false);
    expect(marcador(raiz)).toBeNull();
    expect(raiz.querySelectorAll('.select2-tag').length).toBe(0);

    const altoReposo = disparador(raiz).getBoundingClientRect().height;
    disparador(raiz).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(disparador(raiz).getBoundingClientRect().height).toBeCloseTo(altoReposo, 0);
  });

  it('sin etiqueta, floating no oculta el marcador y expone aria-label', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('options', OPCIONES);
    fixture.componentRef.setInput('variant', 'floating');
    fixture.componentRef.setInput('ariaLabel', 'Region de atencion');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(etiquetaFlotante(raiz)).toBeNull();
    expect(marcador(raiz)).not.toBeNull();
    expect(disparador(raiz).getAttribute('aria-label')).toBe('Region de atencion');
  });

  it('deshabilitado marca la etiqueta flotante y alinea el fondo del disparador con el parche de la etiqueta elevada', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('options', OPCIONES);
    fixture.componentRef.setInput('label', 'Region');
    fixture.componentRef.setInput('variant', 'floating');
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.writeValue('ARE');
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const etiqueta = raiz.querySelector(
      '.fl-label--floating.fl-label--floated.fl-label--disabled',
    ) as HTMLElement;
    expect(etiqueta).not.toBeNull();
    expect(getComputedStyle(etiqueta).backgroundColor).toBe(
      getComputedStyle(disparador(raiz)).backgroundColor,
    );
  });

  it('el disparador referencia la etiqueta por aria-labelledby', async () => {
    const fixture = TestBed.createComponent(Anfitrion);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const id = disparador(raiz).getAttribute('aria-labelledby');
    expect(id).toBeTruthy();
    expect(raiz.querySelector('#' + id)?.textContent?.trim()).toBe('Region');
  });

  it('required: standard muestra el asterisco decorativo en la etiqueta superior y aria-required', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('label', 'Region');
    fixture.componentRef.setInput('options', OPCIONES);
    fixture.componentRef.setInput('required', true);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    const etiqueta = raiz.querySelector('.fl-label');
    expect(etiqueta).not.toBeNull();
    if (!etiqueta) throw new Error('Falta la etiqueta estándar de Select2');
    const asterisco = etiqueta.querySelector('.field__required');
    expect(asterisco?.textContent).toBe('*');
    expect(asterisco?.getAttribute('aria-hidden')).toBe('true');
    expect(disparador(raiz).getAttribute('aria-required')).toBe('true');
    expect(disparador(raiz).getAttribute('aria-labelledby')).toBe(etiqueta.id);
  });

  it('required: floating y floating-value muestran el asterisco en la etiqueta flotante', async () => {
    for (const variante of ['floating', 'floating-value'] as const) {
      const fixture = TestBed.createComponent(Select2Component);
      fixture.componentRef.setInput('label', 'Region');
      fixture.componentRef.setInput('options', OPCIONES);
      fixture.componentRef.setInput('variant', variante);
      fixture.componentRef.setInput('required', true);
      await fixture.whenStable();
      const raiz: HTMLElement = fixture.nativeElement;
      expect(etiquetaFlotante(raiz)?.querySelector('.field__required')?.textContent).toBe('*');
      expect(disparador(raiz).getAttribute('aria-required')).toBe('true');
    }
  });

  it('sin required no hay asterisco ni aria-required', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('label', 'Region');
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();
    const raiz: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.required()).toBe(false);
    expect(raiz.querySelector('.field__required')).toBeNull();
    expect(disparador(raiz).hasAttribute('aria-required')).toBe(false);
  });

  it('no eleva la etiqueta ni marca valor cuando existe una opción centinela vacía (value: null o "") y permite restablecer al elegirla', async () => {
    const opcionesConCentinela = [
      { label: 'Seleccionar...', value: null },
      ...OPCIONES,
    ];
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('label', 'Estado');
    fixture.componentRef.setInput('variant', 'floating');
    fixture.componentRef.setInput('options', opcionesConCentinela);
    fixture.componentInstance.writeValue(null);
    await fixture.whenStable();

    const raiz: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.selectedOption()).toBeNull();
    expect(estaElevada(raiz)).toBe(false);

    fixture.componentInstance.selectOption(opcionesConCentinela[1]);
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedOption()?.value).toBe('ARE');
    expect(estaElevada(raiz)).toBe(true);

    fixture.componentInstance.selectOption(opcionesConCentinela[0]);
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedOption()).toBeNull();
    expect(estaElevada(raiz)).toBe(false);
  });

  it('conserva el valor escrito cuando options y writeValue cambian en el mismo ciclo de cascada', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('label', 'Subfiltro');
    fixture.componentRef.setInput('variant', 'floating');
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();

    const nuevasOpciones = [
      { label: 'Activo', value: 'ACTIVO' },
      { label: 'Inactivo', value: 'INACTIVO' },
    ];
    // Simula el orden de actualización en cascada donde writeValue llega antes de que corra el effect de options
    fixture.componentInstance.writeValue('ACTIVO');
    fixture.componentRef.setInput('options', nuevasOpciones);
    await fixture.whenStable();

    expect(fixture.componentInstance.selectedOption()?.value).toBe('ACTIVO');
    expect(estaElevada(fixture.nativeElement)).toBe(true);
  });

  it('marca has-custom-width cuando width es fijo y lo omite cuando es porcentual o expresión con %', async () => {
    const fixture = TestBed.createComponent(Select2Component);
    fixture.componentRef.setInput('options', OPCIONES);
    await fixture.whenStable();
    const wrapper = fixture.nativeElement.querySelector('.select2-wrapper') as HTMLElement;
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);

    fixture.componentRef.setInput('width', '180px');
    await fixture.whenStable();
    expect(wrapper.classList.contains('has-custom-width')).toBe(true);

    fixture.componentRef.setInput('width', '50%');
    await fixture.whenStable();
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);

    fixture.componentRef.setInput('width', 'calc(100% - 2rem)');
    await fixture.whenStable();
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);
  });
});
