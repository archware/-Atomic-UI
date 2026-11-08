import { TestBed } from '@angular/core/testing';
import { FloatingTextareaComponent } from './floating-textarea.component';

describe('FloatingTextareaComponent: icono condicional y modos de etiqueta', () => {
  it('presenta el botón y la X únicamente cuando hay valor y conserva el texto', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.componentRef.setInput('clearable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.textarea-icon-btn')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fa-times')).toBeNull();
    fixture.componentInstance.writeValue('Café Mixto');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.textarea-icon-btn')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.fa-times')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('textarea').value).toBe('Café Mixto');
    fixture.componentInstance.writeValue('');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.textarea-icon-btn')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fa-times')).toBeNull();
  });

  it('standard: dibuja etiqueta superior fuera de la caja y marcador siempre visible', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.componentRef.setInput('label', 'Notas');
    fixture.componentRef.setInput('placeholder', 'Detalle aquí');
    fixture.componentRef.setInput('variant', 'standard');
    fixture.detectChanges();
    const raiz: HTMLElement = fixture.nativeElement;
    const superior = raiz.querySelector('label.fl-label') as HTMLLabelElement;
    expect(superior.textContent?.trim()).toBe('Notas');
    expect(superior.closest('.floating-textarea-wrapper')).toBeNull();
    expect(raiz.querySelector('label.floating-label')).toBeNull();
    expect(raiz.querySelector('textarea')?.getAttribute('placeholder')).toBe('Detalle aquí');
  });

  it('floating y floating-value: oculta el marcador en reposo y lo revela cuando la etiqueta sube', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.componentRef.setInput('label', 'Notas');
    fixture.componentRef.setInput('placeholder', 'Detalle aquí');
    fixture.componentRef.setInput('variant', 'floating');
    fixture.detectChanges();
    const area = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(area.hasAttribute('placeholder')).toBe(false);

    area.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(area.getAttribute('placeholder')).toBe('Detalle aquí');

    area.dispatchEvent(new Event('blur'));
    fixture.componentRef.setInput('variant', 'floating-value');
    fixture.detectChanges();
    area.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(area.hasAttribute('placeholder')).toBe(false);

    fixture.componentInstance.writeValue('Texto');
    fixture.detectChanges();
    expect(area.getAttribute('placeholder')).toBe('Detalle aquí');
  });

  it('unifica color y sangría horizontal de la etiqueta elevada en floating, outline, underline y material', () => {
    const medirVariante = (variante: 'floating' | 'outline' | 'underline' | 'material') => {
      const fixture = TestBed.createComponent(FloatingTextareaComponent);
      fixture.componentRef.setInput('label', 'Notas');
      fixture.componentRef.setInput('variant', variante);
      fixture.componentInstance.writeValue('Contenido');
      fixture.detectChanges();
      const computado = getComputedStyle(
        fixture.nativeElement.querySelector('label.floating-label') as HTMLElement,
      );
      return {
        color: computado.color,
        left: computado.left,
        top: computado.top,
      };
    };

    const estiloBase = medirVariante('floating');
    expect(estiloBase.color).toBeTruthy();
    for (const variante of ['outline', 'underline', 'material'] as const) {
      const estilo = medirVariante(variante);
      expect(estilo.color).toBe(estiloBase.color);
      expect(estilo.left).toBe(estiloBase.left);
      if (variante === 'outline') {
        expect(estilo.top).toBe(estiloBase.top);
      } else {
        expect(parseFloat(estilo.top)).toBeGreaterThan(0);
      }
    }
  });

  it('deshabilitado con valor: la etiqueta elevada usa el color de texto inactivo en floating, outline, underline y material', () => {
    for (const variante of ['floating', 'outline', 'underline', 'material'] as const) {
      const fixture = TestBed.createComponent(FloatingTextareaComponent);
      fixture.componentRef.setInput('label', 'Notas');
      fixture.componentRef.setInput('variant', variante);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentInstance.writeValue('Contenido inactivo');
      fixture.detectChanges();
      const etiqueta = fixture.nativeElement.querySelector('label.floating-label') as HTMLElement;
      const area = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
      expect(getComputedStyle(etiqueta).color).toBe(getComputedStyle(area).color);
    }
  });

  it('marca has-custom-width cuando width es fijo y lo omite cuando es porcentual o expresión con %', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector(
      '.floating-textarea-wrapper',
    ) as HTMLElement;
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);

    fixture.componentRef.setInput('width', '220px');
    fixture.detectChanges();
    expect(wrapper.classList.contains('has-custom-width')).toBe(true);

    fixture.componentRef.setInput('width', '50%');
    fixture.detectChanges();
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);

    fixture.componentRef.setInput('width', 'calc(100% - 2rem)');
    fixture.detectChanges();
    expect(wrapper.classList.contains('has-custom-width')).toBe(false);
  });
});
