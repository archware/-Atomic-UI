import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ButtonComponent, ButtonVariant, ButtonSize } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant classes', () => {
    const variants: ButtonVariant[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'outline', 'ghost'];

    variants.forEach(variant => {
      it(`should apply btn-${variant} class when variant is ${variant}`, () => {
        component.variant = variant;
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('button');
        expect(button.classList.contains(`btn-${variant}`)).toBeTrue();
      });
    });
  });

  describe('size classes', () => {
    it('should apply btn-sm class for small size', () => {
      component.size = 'sm';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-sm')).toBeTrue();
    });

    it('should apply btn-lg class for large size', () => {
      component.size = 'lg';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-lg')).toBeTrue();
    });

    it('should not add size class for medium (default)', () => {
      component.size = 'md';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-md')).toBeFalse();
    });
  });

  describe('disabled state', () => {
    it('should set disabled attribute when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeTrue();
    });

    it('should not be disabled by default', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeFalse();
    });
  });

  describe('click event', () => {
    it('should emit onClick event when clicked', () => {
      spyOn(component.onClick, 'emit');

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(component.onClick.emit).toHaveBeenCalled();
    });
  });

  describe('button type', () => {
    it('should default to type="button"', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('button');
    });

    it('should set type="submit" when specified', () => {
      component.type = 'submit';
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('submit');
    });
  });

  describe('icon', () => {
    it('should display emoji icon when provided', () => {
      component.icon = '🔍';
      component.iconPosition = 'left';
      fixture.detectChanges();

      const iconSpan = fixture.nativeElement.querySelector('.btn-icon--emoji');
      expect(iconSpan?.textContent?.trim()).toBe('🔍');
    });
  });
});
