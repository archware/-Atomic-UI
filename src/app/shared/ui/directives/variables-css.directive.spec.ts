import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariablesCss, VariablesCssDirective } from './variables-css.directive';

@Component({
  standalone: true,
  imports: [VariablesCssDirective],
  template: `<div [appVariablesCss]="variables()"></div>`,
})
class AnfitrionVariablesCss {
  readonly variables = signal<VariablesCss>({
    '--ancho-prueba': '12rem',
    '--orden-prueba': 3,
  });
}

describe('VariablesCssDirective', () => {
  let fixture: ComponentFixture<AnfitrionVariablesCss>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionVariablesCss],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionVariablesCss);
    fixture.detectChanges();
  });

  it('transporta valores dinámicos solo mediante propiedades personalizadas', () => {
    const elemento = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(elemento.style.getPropertyValue('--ancho-prueba')).toBe('12rem');
    expect(elemento.style.getPropertyValue('--orden-prueba')).toBe('3');
    expect(elemento.style.width).toBe('');
  });

  it('retira propiedades que dejan de formar parte del contrato', () => {
    fixture.componentInstance.variables.set({ '--otro-valor': 'activo' });
    fixture.detectChanges();

    const elemento = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(elemento.style.getPropertyValue('--ancho-prueba')).toBe('');
    expect(elemento.style.getPropertyValue('--orden-prueba')).toBe('');
    expect(elemento.style.getPropertyValue('--otro-valor')).toBe('activo');
  });
});
