import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection } from '@angular/core';
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

  describe('width contract', () => {
    it('stretches the host and native control when fullWidth is enabled', () => {
      const host = fixture.nativeElement as HTMLElement;
      host.style.width = '326px';
      setInput('fullWidth', true);
      const button = host.querySelector('button') as HTMLButtonElement;

      expect(host.classList).toContain('atomic-button--full-width');
      expect(getComputedStyle(button).width).toBe('326px');
    });

    it('keeps the native control intrinsic by default', () => {
      const host = fixture.nativeElement as HTMLElement;
      host.style.width = '326px';
      const button = host.querySelector('button') as HTMLButtonElement;

      expect(host.classList).not.toContain('atomic-button--full-width');
      expect(getComputedStyle(button).width).not.toBe('326px');
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

  describe('loading state', () => {
    it('announces progress, disables the native control and renders a decorative spinner', () => {
      setInput('loading', true);

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      const spinner = button.querySelector('.btn-spinner') as HTMLElement;

      expect(button.disabled).toBeTrue();
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(spinner).not.toBeNull();
      expect(spinner.getAttribute('aria-hidden')).toBe('true');
    });

    it('prevents a second activation after the consumer marks the first one as loading', () => {
      let emissions = 0;
      component.buttonClick.subscribe(() => {
        emissions += 1;
        setInput('loading', true);
      });

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      button.click();

      expect(emissions).toBe(1);
      expect(button.disabled).toBeTrue();
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
        expect(icon?.closest('.btn-icon-wrapper')?.getAttribute('aria-hidden')).toBe('true');
      });
    });
  });

  describe('icon', () => {
    it('should display emoji icon when provided', () => {
      setInput('icon', '🔍');
      setInput('iconPosition', 'left');

      const iconSpan = fixture.nativeElement.querySelector('.btn-icon--emoji');
      expect(iconSpan?.textContent?.trim()).toBe('🔍');
      expect(iconSpan?.getAttribute('aria-hidden')).toBe('true');
    });
  });
});

/*
ARIA del control, no del envoltorio.

Sin estas entradas, quien necesita un boton de divulgacion solo podia poner
`aria-expanded` sobre `<app-button>`, que es un elemento sin rol: el atributo
quedaba inerte y el lector anunciaba un boton corriente que nunca decia si
estaba abierto o cerrado. Se veia bien, se pulsaba bien, y no informaba.
*/
describe('ButtonComponent aria de divulgacion', () => {
  let fixture: ComponentFixture<ButtonComponent>;

  const nativo = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const set = (name: string, value: unknown) => {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
  });

  it('pone el aria en el <button> real y no en el elemento anfitrion', () => {
    set('ariaLabel', 'Abrir menu');
    set('ariaControls', 'cajon');
    set('ariaExpanded', false);

    expect(nativo().getAttribute('aria-label')).toBe('Abrir menu');
    expect(nativo().getAttribute('aria-controls')).toBe('cajon');
    expect(nativo().getAttribute('aria-expanded')).toBe('false');
    // Y no se queda en el anfitrion, que es donde no sirve para nada.
    expect((fixture.nativeElement as HTMLElement).getAttribute('aria-expanded')).toBeNull();
  });

  it('refleja el cambio de estado', () => {
    set('ariaExpanded', false);
    expect(nativo().getAttribute('aria-expanded')).toBe('false');

    set('ariaExpanded', true);
    expect(nativo().getAttribute('aria-expanded')).toBe('true');
  });

  /*
   `null` no declara el atributo. `aria-expanded="false"` sobre un boton que no
   despliega nada es una promesa falsa: el lector anuncia que hay algo que abrir.
  */
  it('sin estado de divulgacion no declara el atributo', () => {
    set('ariaExpanded', null);

    expect(nativo().getAttribute('aria-expanded')).toBeNull();
  });
});
