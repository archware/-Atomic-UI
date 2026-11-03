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
      subtext: 'Dirección de Arquitectura y Desarrollo',
      icon: 'fa-solid fa-user-shield',
      badge: 'Autor',
    },
    {
      label: 'Co-Ingeniería IA',
      value: 'Asistencia de IA Agéntica & Orquestación Doctrinal',
      icon: 'fa-solid fa-wand-magic-sparkles',
    },
  ];

  const sampleTechStack: AboutTechBadge[] = [
    { label: 'Tauri 1.5 + Rust', icon: 'fa-solid fa-gears', variant: 'primary' },
    { label: 'Angular + Signals', icon: 'fa-brands fa-angular', variant: 'secondary' },
    { label: '100% Local', icon: 'fa-solid fa-shield-halved', variant: 'success' },
  ];

  const sampleLinks: AboutLinkItem[] = [
    {
      label: 'GitHub @archware',
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
    expect(host.textContent).toContain('Tauri 1.5 + Rust');
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
});
