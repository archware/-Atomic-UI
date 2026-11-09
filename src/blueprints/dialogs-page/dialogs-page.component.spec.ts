import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { DialogsPageComponent } from './dialogs-page.component';

describe('DialogsPageComponent — Patrón interactivo de tarjeta de documento PDF', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark', 'theme-dark', 'theme-light');
  });

  it('apila .attached-file-main sobre .file-row-inline-controls, iguala el fondo con .floating-label y mantiene controles alineados sin recorte en contenedores estrechos y con nombres largos', async () => {
    await TestBed.configureTestingModule({
      imports: [DialogsPageComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient()],
    }).compileComponents();

    const fixture = TestBed.createComponent(DialogsPageComponent);
    const component = fixture.componentInstance;
    component.pdfDemoFiles.update((files) => [
      {
        ...files[0],
        name: 'expediente_clinico_consentimiento_informado_hospitalario_2026_firmado_digitalmente.pdf',
      },
      ...files.slice(1),
    ]);
    fixture.detectChanges();

    // 1. Verificar que la cadena completa de contenedores Grid/Flex se encoge en un viewport estrecho (20rem / 320px)
    const surfaceEl = fixture.nativeElement.querySelector('.blueprint-surface') as HTMLElement;
    surfaceEl.style.width = '20rem';
    fixture.detectChanges();

    const pdfCard = fixture.nativeElement.querySelector('.attached-file-row--pdf-card') as HTMLElement;
    expect(pdfCard).not.toBeNull();

    const surfaceRect = surfaceEl.getBoundingClientRect();
    const cardRectAt320 = pdfCard.getBoundingClientRect();
    expect(cardRectAt320.right).toBeLessThanOrEqual(surfaceRect.right + 1);

    // 2. Acotar explícitamente .pdf-demo-list a 13.75rem / 220px (escenario estrecho de la captura 1)
    const listEl = pdfCard.closest('.pdf-demo-list') as HTMLElement;
    listEl.style.width = '13.75rem';
    fixture.detectChanges();

    const mainEl = pdfCard.querySelector('.attached-file-main') as HTMLElement;
    const controlsEl = pdfCard.querySelector('.file-row-inline-controls') as HTMLElement;
    const inputEl = pdfCard.querySelector('app-floating-input.pdf-demo-page-input') as HTMLElement;
    const nativeInputEl = inputEl.querySelector('.floating-input') as HTMLElement;
    const floatingLabelEl = inputEl.querySelector('.floating-label') as HTMLElement;
    const closeBtnEl = pdfCard.querySelector('.file-row-inline-controls app-icon-button') as HTMLElement;

    expect(mainEl).not.toBeNull();
    expect(controlsEl).not.toBeNull();
    expect(inputEl).not.toBeNull();
    expect(nativeInputEl).not.toBeNull();
    expect(floatingLabelEl).not.toBeNull();
    expect(closeBtnEl).not.toBeNull();

    // El fondo de la tarjeta PDF coincide con el fondo de .floating-label (sin parche bicolor en el borde superior)
    expect(getComputedStyle(pdfCard).backgroundColor).toBe(
      getComputedStyle(floatingLabelEl).backgroundColor
    );

    const cardRect = pdfCard.getBoundingClientRect();
    const mainRect = mainEl.getBoundingClientRect();
    const controlsRect = controlsEl.getBoundingClientRect();
    const inputRect = inputEl.getBoundingClientRect();
    const nativeInputRect = nativeInputEl.getBoundingClientRect();
    const closeRect = closeBtnEl.getBoundingClientRect();

    // La fila de controles se apila debajo de la cabecera del documento
    expect(controlsRect.top).toBeGreaterThanOrEqual(mainRect.bottom - 1);
    // Ningún elemento hijo desborda el borde derecho de la tarjeta PDF
    expect(mainRect.right).toBeLessThanOrEqual(cardRect.right + 1);
    expect(controlsRect.right).toBeLessThanOrEqual(cardRect.right + 1);
    expect(closeRect.right).toBeLessThanOrEqual(cardRect.right + 1);
    expect(inputRect.width).toBeGreaterThan(100);
    // El botón close-ghost se alinea con la caja .floating-input
    expect(Math.abs(closeRect.top - nativeInputRect.top)).toBeLessThanOrEqual(2);

    // 3. Si app-floating-input muestra mensaje de error debajo del input, close-ghost permanece alineado con la caja .floating-input
    const wrapperEl = inputEl.querySelector('.floating-input-wrapper') as HTMLElement;
    const errorSpan = document.createElement('span');
    errorSpan.className = 'input-error';
    errorSpan.textContent = 'Rango de páginas inválido';
    wrapperEl.appendChild(errorSpan);

    const nativeInputRectWithError = nativeInputEl.getBoundingClientRect();
    const closeRectWithError = closeBtnEl.getBoundingClientRect();
    expect(Math.abs(closeRectWithError.top - nativeInputRectWithError.top)).toBeLessThanOrEqual(2);
  });

  it('muestra "Angular 22 + Signals" (y nunca "Angular 19 + Signals") en el organismo app-about-dialog de la Sección 5', async () => {
    await TestBed.configureTestingModule({
      imports: [DialogsPageComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideHttpClient()],
    }).compileComponents();

    const fixture = TestBed.createComponent(DialogsPageComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.aboutTechStack.map((b) => b.label)).toContain('Angular 22 + Signals');
    expect(fixture.componentInstance.aboutTechStack.map((b) => b.label)).toContain('Doctrina Mangosta');
    expect(fixture.componentInstance.aboutTechStack.map((b) => b.label)).toContain('Doctrina Barracuda');
    expect(fixture.componentInstance.aboutTechStack.map((b) => b.label)).not.toContain('Angular 19 + Signals');
    expect(fixture.componentInstance.aboutCredits.map((c) => c.label)).toContain('Doctrina Mangosta');
    expect(fixture.componentInstance.aboutCredits.map((c) => c.label)).toContain('Doctrina Barracuda');
    expect(host.textContent).toContain('Angular 22 + Signals');
    expect(host.textContent).toContain('Doctrina Mangosta');
    expect(host.textContent).toContain('Doctrina Barracuda');
    expect(host.textContent).toContain('Creador del Ecosistema @archware');
    expect(host.textContent).not.toContain('Angular 19 + Signals');

    const previewDialog = host.querySelector<HTMLElement>('.about-blueprint-preview app-about-dialog')!;
    expect(previewDialog).not.toBeNull();
    const creditItems = Array.from(previewDialog.querySelectorAll<HTMLElement>('.about-credit-item'));
    const techItems = Array.from(previewDialog.querySelectorAll<HTMLElement>('.about-tech-list__item'));
    expect(creditItems.length).toBe(6);
    expect(techItems.length).toBe(7);
  });
});
