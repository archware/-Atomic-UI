import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckboxComponent } from './checkbox.component';

describe('CheckboxComponent: estado deshabilitado', () => {
  let fixture: ComponentFixture<CheckboxComponent>;
  let component: CheckboxComponent;

  const colorFondo = 'rgb(17, 34, 51)';
  const colorTexto = 'rgb(238, 239, 240)';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxComponent);
    component = fixture.componentInstance;
    const anfitrion = fixture.nativeElement as HTMLElement;
    anfitrion.style.setProperty('--input-disabled-bg', '#112233');
    anfitrion.style.setProperty('--input-disabled-text', '#eeeff0');
    fixture.componentRef.setInput('label', 'Opción');
  });

  it('aplica la señal deshabilitada a la etiqueta y al control no marcado', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const entrada = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const caja = fixture.nativeElement.querySelector('.checkbox-box') as HTMLElement;
    const etiqueta = fixture.nativeElement.querySelector('.checkbox-label') as HTMLElement;

    expect(entrada.disabled).toBeTrue();
    expect(getComputedStyle(etiqueta).color).toBe(colorTexto);
    expect(getComputedStyle(caja).backgroundColor).toBe(colorFondo);
    expect(getComputedStyle(caja).borderTopColor).toBe(colorTexto);
    expect(getComputedStyle(etiqueta).opacity).toBe('1');
    expect(getComputedStyle(caja).opacity).toBe('1');
  });

  it('conserva una marca distinguible cuando está marcado y deshabilitado', () => {
    component.writeValue(true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const caja = fixture.nativeElement.querySelector('.checkbox-box') as HTMLElement;
    const marca = fixture.nativeElement.querySelector('.checkbox-check') as SVGElement;

    expect(getComputedStyle(caja).backgroundColor).toBe(colorTexto);
    expect(getComputedStyle(caja).borderTopColor).toBe(colorTexto);
    expect(getComputedStyle(marca).color).toBe(colorFondo);
    expect(getComputedStyle(marca).opacity).toBe('1');
  });
});
