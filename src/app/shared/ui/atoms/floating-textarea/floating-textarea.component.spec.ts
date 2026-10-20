import { TestBed } from '@angular/core/testing';
import { FloatingTextareaComponent } from './floating-textarea.component';

describe('FloatingTextareaComponent: icono condicional y modos de etiqueta', () => {
  it('presenta la X únicamente cuando hay valor y conserva el texto', () => {
    const fixture = TestBed.createComponent(FloatingTextareaComponent);
    fixture.componentRef.setInput('clearable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fa-times')).toBeNull();
    fixture.componentInstance.writeValue('Café Mixto');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.fa-times')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('textarea').value).toBe('Café Mixto');
    fixture.componentInstance.writeValue('');
    fixture.detectChanges();
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
});
