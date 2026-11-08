import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { IconButtonComponent } from './icon-button.component';

describe('IconButtonComponent', () => {
  let component: IconButtonComponent;
  let fixture: ComponentFixture<IconButtonComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('tiene animación "none" por defecto y aplica clase .icon-anim-none', () => {
    expect(component.animation()).toBe('none');
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-anim-none')).toBe(true);
    expect(button.classList.contains('icon-anim-rotate')).toBe(false);
  });

  it('aplica clase .icon-anim-rotate y .icon-anim-grow solo cuando se solicitan explícitamente', () => {
    setInput('animation', 'rotate');
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-anim-rotate')).toBe(true);
    expect(button.classList.contains('icon-anim-none')).toBe(false);

    setInput('animation', 'grow');
    expect(button.classList.contains('icon-anim-grow')).toBe(true);
    expect(button.classList.contains('icon-anim-rotate')).toBe(false);
  });

  it('la variante "close" incluye el aspa estándar con clase .close.blades.heavy', () => {
    setInput('variant', 'close');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-btn--close')).toBe(true);

    const closeSpan = button.querySelector('span.close.blades.heavy');
    expect(closeSpan).not.toBeNull();
  });

  it('la variante "close-ghost" aplica .icon-btn--close-ghost e incluye el aspa estándar .close.blades.heavy', () => {
    setInput('variant', 'close-ghost');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-btn--close-ghost')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Cerrar');
    expect(button.getAttribute('title')).toBe('Cerrar');

    const closeSpan = button.querySelector('span.close.blades.heavy');
    expect(closeSpan).not.toBeNull();
  });

  it('la variante "close-soft" aplica .icon-btn--close-soft e incluye el aspa estándar .close.blades.heavy', () => {
    setInput('variant', 'close-soft');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-btn--close-soft')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Cerrar');
    expect(button.getAttribute('title')).toBe('Cerrar');

    const closeSpan = button.querySelector('span.close.blades.heavy');
    expect(closeSpan).not.toBeNull();
  });

  it('la variante "hanging-close" incluye el aspa estándar con clase .close.blades.heavy y host binding', () => {
    setInput('variant', 'hanging-close');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-btn--hanging-close')).toBe(true);
    expect(fixture.nativeElement.classList.contains('is-hanging-close')).toBe(true);

    const closeSpan = button.querySelector('span.close.blades.heavy');
    expect(closeSpan).not.toBeNull();
  });

  it('emite el evento clicked al ser pulsado', () => {
    let emitido = false;
    component.clicked.subscribe(() => {
      emitido = true;
    });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitido).toBe(true);
  });

  it('no emite el evento clicked cuando está deshabilitado', () => {
    let emitido = false;
    setInput('disabled', true);
    component.clicked.subscribe(() => {
      emitido = true;
    });

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(emitido).toBe(false);
  });

  it('muestra el badge cuando el conteo es mayor a cero', () => {
    setInput('badge', 5);

    const badge = fixture.nativeElement.querySelector('.icon-btn__badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('5');
  });

  it('asigna "Cerrar" como aria-label por defecto en variantes de cierre cuando no se especifica etiqueta', () => {
    setInput('variant', 'close');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Cerrar');
    expect(button.getAttribute('title')).toBe('Cerrar');
  });

  it('respeta aria-label y tooltip explícitos cuando se proporcionan', () => {
    setInput('variant', 'close-soft');
    setInput('ariaLabel', 'Eliminar documento');
    setInput('tooltip', 'Quitar este archivo');

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Eliminar documento');
    expect(button.getAttribute('title')).toBe('Quitar este archivo');
  });

  it('aplica clases de tamaño "sm" y "lg" según el input size', () => {
    setInput('size', 'sm');
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('icon-btn--sm')).toBe(true);

    setInput('size', 'lg');
    expect(button.classList.contains('icon-btn--lg')).toBe(true);
  });

  it('normaliza clases Font Awesome shorthand para renderizar correctamente', () => {
    setInput('icon', 'trash');
    const iconEl = fixture.nativeElement.querySelector('i');
    expect(iconEl).not.toBeNull();
    expect(iconEl.className).toBe('fa-solid fa-trash');

    setInput('icon', 'fa-times');
    const iconEl2 = fixture.nativeElement.querySelector('i');
    expect(iconEl2.className).toBe('fa-solid fa-times');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark', 'theme-dark', 'theme-light');
  });

  it('conserva --text-color-on-primary y gradiente de alto contraste (--button-primary-bg) en variante "avatar" (reposo y hover) en los 3 temas sin teñir el icono con el color del fondo', () => {
    setInput('variant', 'avatar');
    setInput('icon', 'fa-solid fa-user');

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const iconEl: HTMLElement = fixture.nativeElement.querySelector('i');
    expect(button.classList.contains('icon-btn--avatar')).toBe(true);
    expect(iconEl).not.toBeNull();

    for (const theme of ['light', 'dark', 'brand-dark']) {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme !== 'light');
      document.documentElement.classList.toggle('theme-dark', theme !== 'light');
      document.documentElement.classList.toggle('theme-light', theme === 'light');
      for (const anim of ['none', 'grow', 'rotate', 'custom'] as const) {
        setInput('animation', anim);
        const restingBtnColor = getComputedStyle(button).color;
        const restingIconColor = getComputedStyle(iconEl).color;
        expect(restingIconColor).toBe(restingBtnColor);
      }
    }

    // Inspeccionar las reglas CSS compiladas (document.styleSheets y document.adoptedStyleSheets)
    const allRules: string[] = [];
    const sheets = [
      ...Array.from(document.styleSheets),
      ...Array.from(document.adoptedStyleSheets ?? []),
    ];
    for (const sheet of sheets) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          allRules.push(rule.cssText);
        }
      } catch {
        // Ignorar hojas externas con restricción CORS si existieran
      }
    }

    const baseHoverIdx = allRules.findIndex(
      (r) =>
        r.includes('.icon-btn') &&
        !r.includes('.icon-btn--') &&
        r.includes(':hover:not(:disabled)')
    );
    const avatarRestRule = allRules.find(
      (r) => r.includes('.icon-btn--avatar') && !r.includes(':hover') && r.includes('linear-gradient')
    );
    const avatarHoverIdx = allRules.findIndex(
      (r) =>
        r.includes('.icon-btn--avatar') &&
        r.includes(':hover:not(:disabled)') &&
        r.includes('linear-gradient')
    );
    expect(avatarRestRule).toBeDefined();
    expect(avatarRestRule).toContain('var(--button-primary-bg');
    expect(avatarHoverIdx).toBeGreaterThan(baseHoverIdx);

    const avatarHoverRule = allRules[avatarHoverIdx];
    expect(avatarHoverRule).toContain('var(--text-color-on-primary)');
    expect(avatarHoverRule).toContain('var(--button-primary-bg');
    expect(avatarHoverRule).toContain('filter: none');

    const animRules = allRules.filter(
      (r) =>
        (r.includes('.icon-anim-none') ||
          r.includes('.icon-anim-grow') ||
          r.includes('.icon-anim-rotate')) &&
        r.includes(':hover')
    );
    expect(animRules.length).toBeGreaterThanOrEqual(3);
    for (const ruleText of animRules) {
      expect(ruleText).not.toContain('var(--primary-color)');
    }
  });
});
