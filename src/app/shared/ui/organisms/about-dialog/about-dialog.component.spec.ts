import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AboutDialogComponent,
  type AboutCreditItem,
  type AboutLinkItem,
  type AboutTechBadge,
} from './about-dialog.component';

describe('AboutDialogComponent', () => {
  let component: AboutDialogComponent;
  let fixture: ComponentFixture<AboutDialogComponent>;

  const sampleCredits: AboutCreditItem[] = [
    {
      label: 'Autoría Principal',
      value: 'Ing. Havel CONTRERAS TAPAHUASCO (@archware)',
      subtext:
        'Arquitecto de Software Full-Stack y creador de herramientas propias de ingeniería, sistemas de diseño y doctrinas de arquitectura empresarial',
      icon: 'fa-solid fa-user-shield',
      badge: 'Marca Personal',
    },
    {
      label: 'Doctrina Mangosta',
      value: 'Suite Mangosta — Arquitectura Hexagonal & CQRS Estricto',
      subtext:
        'Vertical Slicing, dominio rico en español, persistencia limpia sin micro-ORMs, fronteras IPC/HTTP tipadas y seguridad por diseño',
      icon: 'fa-solid fa-diagram-project',
      badge: 'Backend Canon',
    },
    {
      label: 'Doctrina Barracuda',
      value: 'Suite Barracuda — Chasis Frontend Reactivo con Signals',
      subtext:
        'Andamiaje modular en Angular 22 + Signals, control flow nativo, plantillas gobernadas, accesibilidad estricta y cero deuda visual',
      icon: 'fa-solid fa-bolt',
      badge: 'Frontend Canon',
    },
    {
      label: 'Sistema de Diseño',
      value: 'Atomic UI (@atomic-ui/core v5.22.0) — Signals & OnPush',
      subtext:
        'Librería de autor con tokens semánticos puros, desplazamiento gobernado y fidelidad visual anti-alucinación',
      icon: 'fa-solid fa-cubes',
      badge: 'ADN Visual',
    },
    {
      label: 'Co-Ingeniería IA',
      value: 'Asistencia de IA Agéntica & Orquestación Doctrinal',
      subtext:
        'Aceleración de entrega con agentes especializados gobernados por reglas de arquitectura, auditoría adversarial y compuertas deterministas',
      icon: 'fa-solid fa-wand-magic-sparkles',
      badge: 'IA Agéntica',
    },
    {
      label: 'Arquitectura y Seguridad',
      value: 'Procesamiento 100% local en memoria sin subida a servidores',
      subtext:
        'Frontera nativa Tauri + Rust (RespuestaSistemaV1), privacidad institucional absoluta y ejecución de alto rendimiento',
      icon: 'fa-solid fa-shield-halved',
      badge: 'Privacidad',
    },
  ];

  const sampleTechStack: AboutTechBadge[] = [
    { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
    { label: 'Angular 22 + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
    { label: 'Atomic UI v5.22.0', icon: 'fa-solid fa-layer-group', variant: 'info' },
    { label: 'Doctrina Mangosta', icon: 'fa-solid fa-diagram-project', variant: 'primary' },
    { label: 'Doctrina Barracuda', icon: 'fa-solid fa-bolt', variant: 'secondary' },
    { label: 'PDF.js + pdf-lib', icon: 'fa-solid fa-file-pdf', variant: 'warning' },
    { label: '100% Local', icon: 'fa-solid fa-shield-halved', variant: 'success' },
  ];

  const sampleLinks: AboutLinkItem[] = [
    {
      label: 'Portafolio & GitHub @archware',
      url: 'https://github.com/archware',
      icon: 'fa-brands fa-github',
      external: true,
    },
    {
      label: 'Repositorio Atomic UI',
      url: 'https://github.com/archware/-Atomic-UI',
      icon: 'fa-solid fa-code-branch',
      external: true,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutDialogComponent);
    component = fixture.componentInstance;
  });

  it('no debe renderizar el modal cuando variant="modal" y open=false', () => {
    fixture.componentRef.setInput('variant', 'modal');
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-modal')).toBeNull();
    expect(host.querySelector('.about-surface')).toBeNull();
  });

  it('debe renderizar el diálogo modal con autoría, GitHub, co-ingeniería IA, créditos y stack cuando open=true', () => {
    fixture.componentRef.setInput('variant', 'modal');
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('dialogTitle', 'Acerca de Editor PDF Studio');
    fixture.componentRef.setInput('appName', 'Editor PDF Studio');
    fixture.componentRef.setInput('version', 'v0.5.1');
    fixture.componentRef.setInput('environment', 'LOCAL & SEGURO');
    fixture.componentRef.setInput('runtimeInfo', 'Tauri + Rust Desktop');
    fixture.componentRef.setInput('credits', sampleCredits);
    fixture.componentRef.setInput('techStack', sampleTechStack);
    fixture.componentRef.setInput('links', sampleLinks);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('app-modal')).not.toBeNull();
    expect(host.textContent).toContain('Editor PDF Studio');
    expect(host.textContent).toContain('v0.5.1');
    expect(host.textContent).toContain('LOCAL & SEGURO');
    expect(host.textContent).toContain('Tauri + Rust Desktop');
    expect(host.textContent).toContain('Ing. Havel CONTRERAS TAPAHUASCO');
    expect(host.textContent).toContain('@archware');
    expect(host.textContent).toContain('co-ingeniería con IA Agéntica');
    expect(host.textContent).toContain('Autoría Principal');
    expect(host.textContent).toContain('Marca Personal');
    expect(host.textContent).toContain('Doctrina Mangosta');
    expect(host.textContent).toContain('Doctrina Barracuda');
    expect(host.textContent).toContain('Tauri 1.5 + Rust');
    expect(host.textContent).toContain('Angular 22 + Signals');
    expect(host.textContent).toContain('Atomic UI v5.22.0');
    expect(host.textContent).toContain('Repositorio Atomic UI');

    const githubLink = host.querySelector<HTMLAnchorElement>('a.about-github-pill');
    expect(githubLink).not.toBeNull();
    expect(githubLink?.getAttribute('href')).toBe('https://github.com/archware');
    expect(githubLink?.getAttribute('target')).toBe('_blank');
    expect(githubLink?.getAttribute('rel')).toContain('noopener');
  });

  it('debe emitir closed cuando se pulsa el botón de cierre en modo modal y restaurar foco al disparador', async () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Acerca de';
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    try {
      let closedCount = 0;
      component.closed.subscribe(() => {
        closedCount += 1;
        fixture.componentRef.setInput('open', false);
      });

      fixture.componentRef.setInput('variant', 'modal');
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const footerButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
        '.about-dialog__footer-actions button'
      );
      expect(footerButton).not.toBeNull();
      expect(document.activeElement).toBe(footerButton);

      footerButton?.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(closedCount).toBe(1);
      expect(document.activeElement).toBe(triggerButton);
    } finally {
      triggerButton.remove();
    }
  });

  it('debe gestionar foco inicial, trampa de Tab, cierre con Escape sobre activeElement y restauración de foco en la variante popup', async () => {
    const triggerButton = document.createElement('button');
    triggerButton.textContent = 'Abrir Popup';
    document.body.appendChild(triggerButton);
    triggerButton.focus();
    expect(document.activeElement).toBe(triggerButton);

    try {
      let closedCount = 0;
      component.closed.subscribe(() => {
        closedCount += 1;
        fixture.componentRef.setInput('open', false);
      });

      fixture.componentRef.setInput('variant', 'popup');
      fixture.componentRef.setInput('links', sampleLinks);
      fixture.componentRef.setInput('open', true);
      fixture.detectChanges();
      await fixture.whenStable();

      const host = fixture.nativeElement as HTMLElement;
      const popupEl = host.querySelector<HTMLElement>('.about-popup');
      const hangingCloseBtn = host.querySelector<HTMLButtonElement>(
        'app-icon-button.about-popup__close button'
      );
      const footerCloseBtn = host.querySelector<HTMLButtonElement>(
        '.about-popup__footer button'
      );
      expect(popupEl).not.toBeNull();
      expect(hangingCloseBtn).not.toBeNull();
      expect(footerCloseBtn).not.toBeNull();

      // El foco inicial debe haberse movido automáticamente al botón primario de cierre del pie
      expect(document.activeElement).toBe(footerCloseBtn);

      // Al pulsar Tab desde el último elemento enfocable (footerCloseBtn), el foco cicla al primero (hangingCloseBtn)
      footerCloseBtn?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
      );
      expect(document.activeElement).toBe(hangingCloseBtn);

      // Al pulsar Shift+Tab desde el primer elemento enfocable, cicla al último
      hangingCloseBtn?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        })
      );
      expect(document.activeElement).toBe(footerCloseBtn);

      // Al pulsar Escape sobre document.activeElement, el popup se cierra y restaura foco al botón disparador
      (document.activeElement as HTMLElement)?.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(closedCount).toBe(1);
      expect(host.querySelector('.about-popup')).toBeNull();
      expect(document.activeElement).toBe(triggerButton);
    } finally {
      triggerButton.remove();
    }
  });

  it('debe renderizar la variante card en línea incluso cuando open=false', () => {
    fixture.componentRef.setInput('variant', 'card');
    fixture.componentRef.setInput('open', false);
    fixture.componentRef.setInput('appName', 'Atomic UI Blueprint');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.about-card-surface')).not.toBeNull();
    expect(host.textContent).toContain('Atomic UI Blueprint');
    expect(host.textContent).toContain('Ing. Havel CONTRERAS TAPAHUASCO');
  });

  it('debe ajustar limpiamente authorRole extendido y las 6 tarjetas de Doctrina Mangosta / Barracuda sin desborde horizontal en anchos lg (832px), intermedio (640px) y móvil (360px) en temas light, dark y brand-dark', () => {
    const previousTheme = document.documentElement.getAttribute('data-theme');
    const host = fixture.nativeElement as HTMLElement;

    try {
      fixture.componentRef.setInput('variant', 'card');
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput(
        'authorRole',
        'Arquitecto de Software Principal & Creador del Ecosistema @archware (Atomic UI · Doctrina Barracuda · Doctrina Mangosta)'
      );
      fixture.componentRef.setInput(
        'aiDisclosure',
        'Desarrollado en co-ingeniería con IA Agéntica bajo el ecosistema de autor @archware: una suite propia de ingeniería de software que integra Doctrina Mangosta (Arquitectura Hexagonal y CQRS estricto), Doctrina Barracuda (Chasis Frontend reactivo con Signals) y el sistema de diseño Atomic UI (@atomic-ui/core), logrando productos de calidad empresarial verificados por compuertas deterministas.'
      );
      fixture.componentRef.setInput('credits', sampleCredits);
      fixture.componentRef.setInput('techStack', sampleTechStack);
      fixture.componentRef.setInput('links', sampleLinks);

      for (const theme of ['light', 'dark', 'brand-dark'] as const) {
        document.documentElement.setAttribute('data-theme', theme);

        for (const [widthPx, sizeMode] of [
          [832, 'lg'],
          [640, 'md'],
          [360, 'sm'],
        ] as const) {
          host.style.width = `${widthPx}px`;
          fixture.componentRef.setInput('size', sizeMode);
          fixture.detectChanges();

          const cardSurface = host.querySelector<HTMLElement>('.about-card-surface')!;
          const authorCard = host.querySelector<HTMLElement>('.about-author-card')!;
          const authorRoleEl = host.querySelector<HTMLElement>('.about-author-card__role')!;
          const creditItems = Array.from(host.querySelectorAll<HTMLElement>('.about-credit-item'));

          expect(cardSurface).not.toBeNull();
          expect(authorCard).not.toBeNull();
          expect(authorRoleEl).not.toBeNull();
          expect(creditItems.length).toBe(6);

          const surfaceRect = cardSurface.getBoundingClientRect();
          const authorRect = authorCard.getBoundingClientRect();
          const roleRect = authorRoleEl.getBoundingClientRect();

          expect(authorRect.right).toBeLessThanOrEqual(surfaceRect.right + 1);
          expect(roleRect.right).toBeLessThanOrEqual(authorRect.right + 1);
          expect(authorCard.scrollWidth).toBeLessThanOrEqual(authorCard.clientWidth + 1);

          for (const item of creditItems) {
            const itemRect = item.getBoundingClientRect();
            const valueEl = item.querySelector<HTMLElement>('.about-credit-item__value')!;
            const valueRect = valueEl.getBoundingClientRect();
            expect(itemRect.right).toBeLessThanOrEqual(surfaceRect.right + 1);
            expect(valueRect.right).toBeLessThanOrEqual(itemRect.right + 1);
            expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth + 1);
          }

          // En lg (832px) las 6 tarjetas forman 2 filas simétricas de 3 columnas; en 640px (md) forman 3 filas simétricas de 2 columnas
          if (widthPx === 832) {
            expect(Math.abs(creditItems[0].getBoundingClientRect().top - creditItems[1].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
            expect(Math.abs(creditItems[1].getBoundingClientRect().top - creditItems[2].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
            expect(Math.abs(creditItems[3].getBoundingClientRect().top - creditItems[4].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
            expect(Math.abs(creditItems[4].getBoundingClientRect().top - creditItems[5].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
          } else if (widthPx === 640) {
            expect(Math.abs(creditItems[0].getBoundingClientRect().top - creditItems[1].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
            expect(Math.abs(creditItems[2].getBoundingClientRect().top - creditItems[3].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
            expect(Math.abs(creditItems[4].getBoundingClientRect().top - creditItems[5].getBoundingClientRect().top)).toBeLessThanOrEqual(2);
          }

          expect(getComputedStyle(authorCard).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    } finally {
      host.style.width = '';
      if (previousTheme === null) {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', previousTheme);
      }
    }
  });
});
