import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToggleComponent } from './toggle.component';

describe('ToggleComponent', () => {
  let component: ToggleComponent;
  let fixture: ComponentFixture<ToggleComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Label ─────────────────────────────────────────────────────────────────
  describe('label', () => {
    it('should not render label span when label is empty', () => {
      const label = fixture.nativeElement.querySelector('.toggle-label');
      expect(label).toBeNull();
    });

    it('should render label text when label is set', () => {
      setInput('label', 'Activar notificaciones');
      const label = fixture.nativeElement.querySelector('.toggle-label');
      expect(label?.textContent?.trim()).toBe('Activar notificaciones');
    });
  });

  // ── Disabled ──────────────────────────────────────────────────────────────
  describe('disabled', () => {
    it('should apply disabled class on wrapper when disabled is true', () => {
      setInput('disabled', true);
      const wrapper = fixture.nativeElement.querySelector('.toggle-wrapper');
      expect(wrapper.classList.contains('disabled')).toBeTrue();
    });

    it('should disable the checkbox input', () => {
      setInput('disabled', true);
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type=checkbox]');
      expect(input.disabled).toBeTrue();
    });

    it('should set disabled via setDisabledState', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
      component.setDisabledState(false);
      expect(component.disabled).toBeFalse();
    });
  });

  // ── ControlValueAccessor ──────────────────────────────────────────────────
  describe('ControlValueAccessor', () => {
    it('should set checked=true via writeValue(true)', () => {
      component.writeValue(true);
      expect(component.checked).toBeTrue();
    });

    it('should set checked=false via writeValue(false)', () => {
      component.writeValue(false);
      expect(component.checked).toBeFalse();
    });

    it('should treat null/undefined as false in writeValue', () => {
      component.writeValue(null as unknown as boolean);
      expect(component.checked).toBeFalse();
    });

    it('should call onChange callback when toggled', () => {
      let emittedValue: boolean | undefined;
      component.registerOnChange((v) => { emittedValue = v; });

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.checked = true;
      input.dispatchEvent(new Event('change'));

      expect(emittedValue).toBeTrue();
    });

    it('should call onTouched callback when toggled', () => {
      let touched = false;
      component.registerOnTouched(() => { touched = true; });

      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.checked = false;
      input.dispatchEvent(new Event('change'));

      expect(touched).toBeTrue();
    });

    it('should update internal checked state when toggled', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
      input.checked = true;
      input.dispatchEvent(new Event('change'));

      expect(component.checked).toBeTrue();
    });
  });
});
