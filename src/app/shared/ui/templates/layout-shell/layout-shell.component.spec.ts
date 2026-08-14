import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LayoutShellComponent } from './layout-shell.component';

describe('LayoutShellComponent', () => {
  it('reserva el scroll principal al overlay y evita un segundo dueño en el sidebar', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const sidebar = fixture.nativeElement.querySelector('.layout-sidebar') as HTMLElement;
    const contentOverlay = fixture.nativeElement.querySelector(
      '.layout-content > app-scroll-overlay',
    ) as HTMLElement;

    expect(getComputedStyle(sidebar).overflow).toBe('hidden');
    expect(contentOverlay).not.toBeNull();
    expect(
      contentOverlay.querySelector('.so-scroll-area')?.getAttribute('data-so-managed-scrollbar'),
    ).toBe('true');
  });

  /*
    UN CAJON ESCONDIDO POR CSS SIGUE SIENDO TABULABLE si nadie lo declara
    inerte: sus enlaces permanecen en el orden de tabulacion y el lector de
    pantalla los sigue anunciando aunque esten fuera de la pantalla.
  */
  it('declara inerte y oculto el cajon cuando no esta visible', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.componentRef.setInput('sidebarVisible', false);
    fixture.detectChanges();
    await fixture.whenStable();

    const sidebar = fixture.nativeElement.querySelector('.layout-sidebar') as HTMLElement;
    expect(sidebar.hasAttribute('inert')).toBe(true);
    expect(sidebar.getAttribute('aria-hidden')).toBe('true');
  });

  it('no declara inerte el cajon visible, ni le pone aria-hidden', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.componentRef.setInput('sidebarVisible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const sidebar = fixture.nativeElement.querySelector('.layout-sidebar') as HTMLElement;
    expect(sidebar.hasAttribute('inert')).toBe(false);
    expect(sidebar.hasAttribute('aria-hidden')).toBe(false);
  });

  /*
    El enlace de salto tiene que ser ENFOCABLE aunque no se vea: si se ocultara
    con display:none o visibility:hidden saldria del orden de tabulacion, que
    es exactamente lo contrario de para lo que existe.
  */
  it('publica un enlace de salto enfocable que apunta al contenido', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    const enlace = raiz.querySelector('.layout-skip-link') as HTMLAnchorElement;
    const main = raiz.querySelector('main') as HTMLElement;

    expect(enlace).not.toBeNull();
    expect(enlace.getAttribute('href')).toBe('#layout-main-content');
    expect(main.id).toBe('layout-main-content');

    const estilo = getComputedStyle(enlace);
    expect(estilo.display).not.toBe('none');
    expect(estilo.visibility).not.toBe('hidden');
  });

  /*
    Sin `tabindex="-1"` el ancla desplaza la pagina pero NO mueve el foco: la
    siguiente tabulacion seguiria dentro del menu, que es el problema que el
    enlace venia a resolver.
  */
  it('el contenido principal es destino de foco sin entrar en la tabulacion', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    // Consulta que no casa nunca: asi el contenido no es inerte y la prueba no
    // depende del ancho real de la ventana de Karma.
    fixture.componentRef.setInput('compactViewportQuery', '(max-width: 0px)');
    fixture.detectChanges();
    await fixture.whenStable();

    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(main.hasAttribute('inert')).toBe(false);

    main.focus();
    expect(document.activeElement).toBe(main);
  });

  /*
    UN CAJON MODAL QUE NO INERTIZA LO DE DETRAS NO ES MODAL: se puede tabular
    hasta debajo del velo, y el lector de pantalla sigue recorriendo el
    contenido tapado.

    La consulta de medios se fuerza en vez de redimensionar la ventana, para
    que la prueba diga lo mismo en cualquier maquina.
  */
  it('inertiza el contenido cuando el cajon esta abierto y tapa la pantalla', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.componentRef.setInput('compactViewportQuery', '(min-width: 0px)');
    fixture.componentRef.setInput('sidebarVisible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    expect((raiz.querySelector('main') as HTMLElement).hasAttribute('inert')).toBe(true);
    expect((raiz.querySelector('.layout-header') as HTMLElement).hasAttribute('inert')).toBe(true);
    // El cajon, que es lo unico operable, NO puede estar inerte.
    expect((raiz.querySelector('.layout-sidebar') as HTMLElement).hasAttribute('inert')).toBe(false);
  });

  it('no inertiza nada cuando el cajon convive con el contenido', async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutShellComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(LayoutShellComponent);
    fixture.componentRef.setInput('compactViewportQuery', '(max-width: 0px)');
    fixture.componentRef.setInput('sidebarVisible', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const raiz = fixture.nativeElement as HTMLElement;
    expect((raiz.querySelector('main') as HTMLElement).hasAttribute('inert')).toBe(false);
    expect((raiz.querySelector('.layout-sidebar') as HTMLElement).hasAttribute('inert')).toBe(false);
  });
});
