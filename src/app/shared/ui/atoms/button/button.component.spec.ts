import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ButtonComponent, ButtonTone, ButtonVariant } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('variant classes', () => {
    const variants: ButtonVariant[] = [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'soft',
      'outline',
      'ghost',
    ];

    variants.forEach((variant) => {
      it(`should apply btn-${variant} class when variant is ${variant}`, () => {
        setInput('variant', variant);

        const button = fixture.nativeElement.querySelector('button');
        expect(button.classList.contains(`btn-${variant}`)).toBeTrue();
      });
    });
  });

  describe('semantic tones', () => {
    const tones: ButtonTone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

    tones.forEach((tone) => {
      it(`should apply btn-tone-${tone} when tone is ${tone}`, () => {
        setInput('variant', 'soft');
        setInput('tone', tone);

        const button = fixture.nativeElement.querySelector('button');
        expect(button.classList.contains(`btn-tone-${tone}`)).toBeTrue();
      });
    });

    it('should keep auxiliary actions neutral by default', () => {
      setInput('variant', 'outline');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-tone-neutral')).toBeTrue();
    });
  });

  describe('size classes', () => {
    it('should apply btn-sm class for small size', () => {
      setInput('size', 'sm');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-sm')).toBeTrue();
    });

    it('should apply btn-lg class for large size', () => {
      setInput('size', 'lg');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-lg')).toBeTrue();
    });

    it('should not add size class for medium (default)', () => {
      setInput('size', 'md');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.classList.contains('btn-md')).toBeFalse();
    });
  });

  describe('dialog close contract', () => {
    it('keeps the projected close control square and centered', () => {
      fixture.nativeElement.setAttribute('dialog-close', '');
      fixture.detectChanges();

      const host = fixture.nativeElement as HTMLElement;
      const button = host.querySelector('button') as HTMLButtonElement;
      host.style.setProperty('--control-height', '44px');

      expect(getComputedStyle(host).display).toBe('inline-flex');
      expect(['44px', 'var(--control-height)']).toContain(getComputedStyle(host).width);
      expect(['44px', 'var(--control-height)']).toContain(getComputedStyle(host).height);
      expect(getComputedStyle(button).paddingLeft).toBe('0px');
      expect(getComputedStyle(button).paddingRight).toBe('0px');
    });
  });

  describe('disabled state', () => {
    it('should set disabled attribute when disabled is true', () => {
      setInput('disabled', true);

      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeTrue();
    });

    it('should not be disabled by default', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.disabled).toBeFalse();
    });
  });

  describe('click event', () => {
    it('should emit buttonClick event when clicked', () => {
      spyOn(component.buttonClick, 'emit');

      const button = fixture.nativeElement.querySelector('button');
      button.click();

      expect(component.buttonClick.emit).toHaveBeenCalled();
    });
  });

  describe('button type', () => {
    it('should default to type="button"', () => {
      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('button');
    });

    it('should set type="submit" when specified', () => {
      setInput('type', 'submit');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.type).toBe('submit');
    });
  });

  describe('font icon class', () => {
    [
      ['save', 'fa-solid fa-save'],
      ['fa-save', 'fa-solid fa-save'],
      ['fa-solid fa-save', 'fa-solid fa-save'],
    ].forEach(([iconClass, expected]) => {
      it(`normalizes the Font Awesome contract for ${iconClass}`, () => {
        setInput('iconClass', iconClass);

        const icon = fixture.nativeElement.querySelector('i');
        expect(icon?.classList.contains('fa-solid')).toBeTrue();
        expect(icon?.classList.contains('fa-save')).toBeTrue();
        expect(new Set(icon?.className.split(/\s+/))).toEqual(new Set(expected.split(/\s+/)));
        expect(icon?.className).not.toContain('fa-fa-');
      });
    });
  });

  describe('icon', () => {
    it('should display emoji icon when provided', () => {
      setInput('icon', '🔍');
      setInput('iconPosition', 'left');

      const iconSpan = fixture.nativeElement.querySelector('.btn-icon--emoji');
      expect(iconSpan?.textContent?.trim()).toBe('🔍');
    });
  });
});
