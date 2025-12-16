import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatingInputComponent, FloatingInputVariant, FloatingInputType } from './floating-input.component';

describe('FloatingInputComponent', () => {
  let component: FloatingInputComponent;
  let fixture: ComponentFixture<FloatingInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingInputComponent, FormsModule],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant classes', () => {
    const variants: FloatingInputVariant[] = ['floating', 'underline', 'material', 'outline'];

    variants.forEach(variant => {
      it(`should apply variant-${variant} class when variant is ${variant}`, () => {
        component.variant = variant;
        fixture.detectChanges();

        const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
        expect(wrapper.classList.contains(`variant-${variant}`)).toBeTrue();
      });
    });
  });

  describe('label', () => {
    it('should display label text', () => {
      component.label = 'Email';
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.floating-label');
      expect(label.textContent).toBe('Email');
    });
  });

  describe('focus state', () => {
    it('should add focused class on focus', () => {
      component.onFocus();
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('focused')).toBeTrue();
    });

    it('should remove focused class on blur', () => {
      component.onFocus();
      fixture.detectChanges();

      component.onBlur();
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('focused')).toBeFalse();
    });
  });

  describe('has-value state', () => {
    it('should add has-value class when input has value', () => {
      component.value = 'test';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-value')).toBeTrue();
    });

    it('should not have has-value class when empty', () => {
      component.value = '';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-value')).toBeFalse();
    });
  });

  describe('error state', () => {
    it('should add has-error class when error is provided', () => {
      component.error = 'Campo requerido';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('has-error')).toBeTrue();
    });

    it('should display error message', () => {
      component.error = 'Campo requerido';
      fixture.detectChanges();

      const errorEl = fixture.nativeElement.querySelector('.input-error');
      expect(errorEl.textContent).toBe('Campo requerido');
    });
  });

  describe('disabled state', () => {
    it('should add disabled class when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.classList.contains('disabled')).toBeTrue();
    });

    it('should set disabled attribute on input', () => {
      component.disabled = true;
      fixture.detectChanges();

      const input = fixture.nativeElement.querySelector('.floating-input');
      expect(input.disabled).toBeTrue();
    });
  });

  describe('password toggle', () => {
    it('should show password toggle button for password type', () => {
      component.type = 'password';
      fixture.detectChanges();

      const toggleBtn = fixture.nativeElement.querySelector('.input-icon-btn');
      expect(toggleBtn).toBeTruthy();
    });

    it('should toggle password visibility', () => {
      component.type = 'password';
      fixture.detectChanges();

      expect(component.actualType()).toBe('password');

      component.togglePassword();
      fixture.detectChanges();

      expect(component.actualType()).toBe('text');
    });
  });

  describe('ControlValueAccessor', () => {
    it('should write value', () => {
      component.writeValue('test value');
      expect(component.value).toBe('test value');
    });

    it('should handle null value', () => {
      component.writeValue(null as any);
      expect(component.value).toBe('');
    });

    it('should register onChange callback', () => {
      const fn = jasmine.createSpy('onChange');
      component.registerOnChange(fn);

      component.onChange('new value');

      expect(fn).toHaveBeenCalledWith('new value');
    });

    it('should register onTouched callback', () => {
      const fn = jasmine.createSpy('onTouched');
      component.registerOnTouched(fn);

      component.onBlur();

      expect(fn).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBeTrue();
    });
  });

  describe('width', () => {
    it('should apply custom width', () => {
      component.width = '200px';
      fixture.detectChanges();

      const wrapper = fixture.nativeElement.querySelector('.floating-input-wrapper');
      expect(wrapper.style.width).toBe('200px');
    });
  });
});
