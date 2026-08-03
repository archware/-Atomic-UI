import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Input } from './input';

describe('Input', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders programmatic CVA values and disabled state without ZoneJS', async () => {
    const fixture = TestBed.createComponent(Input);
    fixture.componentInstance.writeValue('12345678');
    fixture.componentInstance.setDisabledState(true);
    await fixture.whenStable();

    const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(element.value).toBe('12345678');
    expect(element.disabled).toBeTrue();
  });

  it('associates label, constraints and errors with the native input', async () => {
    const fixture = TestBed.createComponent(Input);
    fixture.componentRef.setInput('controlId', 'start-date');
    fixture.componentRef.setInput('label', 'Fecha de inicio');
    fixture.componentRef.setInput('type', 'date');
    fixture.componentRef.setInput('min', '2026-07-22');
    fixture.componentRef.setInput('required', true);
    fixture.componentRef.setInput('error', 'Ingrese una fecha válida.');
    await fixture.whenStable();

    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const element = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(label.htmlFor).toBe('start-date');
    expect(element.min).toBe('2026-07-22');
    expect(element.required).toBeTrue();
    expect(element.getAttribute('aria-describedby')).toBe('start-date-error');
  });
});
