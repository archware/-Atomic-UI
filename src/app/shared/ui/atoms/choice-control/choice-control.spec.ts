import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChoiceControl } from './choice-control';

describe('ChoiceControl', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChoiceControl],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('renders a controlled checkbox and emits its boolean state', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('label', 'Seleccionar cuenta');
    fixture.componentRef.setInput('checked', true);
    let selected = true;
    fixture.componentInstance.changed.subscribe((checked) => (selected = checked));
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBeTrue();
    expect(fixture.nativeElement.classList.contains('choice-control--checked')).toBeTrue();
    expect(input.getAttribute('aria-label')).toBe('Seleccionar cuenta');
    input.checked = false;
    input.dispatchEvent(new Event('change'));
    expect(selected).toBeFalse();
  });

  it('supports an accessible radio without visible text', async () => {
    const fixture = TestBed.createComponent(ChoiceControl);
    fixture.componentRef.setInput('type', 'radio');
    fixture.componentRef.setInput('ariaLabel', 'Cliente registrado');
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('radio');
    expect(fixture.nativeElement.classList.contains('choice-control--disabled')).toBeTrue();
    expect(input.getAttribute('aria-label')).toBe('Cliente registrado');
  });
});
