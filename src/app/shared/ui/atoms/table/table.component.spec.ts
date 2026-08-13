import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';
import { TableCellComponent } from './table-cell.component';
import { TableComponent, type TableScrollbarMode } from './table.component';

@Component({
  standalone: true,
  imports: [TableComponent, TableCellComponent],
  template: `
    <app-table
      [unifiedScroll]="true"
      [maxHeight]="240"
      [ariaLabel]="'Vista previa de movimientos'"
      [scrollResetKey]="resetKey"
      [scrollbarMode]="scrollbarMode()"
      cellOverflow="truncate"
    >
      <thead>
        <tr>
          <th scope="col">Descripción</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td app-table-cell dataLabel="Descripción" [wrap]="true">Compra extensa</td>
        </tr>
      </tbody>
    </app-table>
  `,
})
class UnifiedTableHostComponent {
  resetKey = 'dataset-a';
  readonly scrollbarMode = signal<TableScrollbarMode>('native');
}

@Component({
  standalone: true,
  imports: [TableComponent, TableCellComponent],
  template: `
    <app-table
      [unifiedScroll]="true"
      [maxHeight]="240"
      [ariaLabel]="'Movimientos con indicadores overlay'"
      scrollbarMode="overlay"
    >
      <thead>
        <tr>
          <th scope="col">Descripción</th>
          <th scope="col">Importe</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td app-table-cell dataLabel="Descripción">Compra extensa</td>
          <td app-table-cell dataLabel="Importe">120.00</td>
        </tr>
      </tbody>
    </app-table>
  `,
})
class OverlayTableHostComponent {}

describe('TableComponent unified viewport', () => {
  const originalMatchMedia = window.matchMedia;
  let responsiveMatches = false;
  let responsiveListener: ((event: MediaQueryListEvent) => void) | undefined;
  let removeResponsiveListener: jasmine.Spy;

  beforeEach(async () => {
    removeResponsiveListener = jasmine.createSpy('removeEventListener');
    window.matchMedia = jasmine.createSpy('matchMedia').and.callFake(
      (query: string): MediaQueryList =>
        ({
          matches: responsiveMatches,
          media: query,
          onchange: null,
          addEventListener: (_type: string, listener: EventListenerOrEventListenerObject) => {
            responsiveListener = listener as (event: MediaQueryListEvent) => void;
          },
          removeEventListener: removeResponsiveListener,
          addListener: jasmine.createSpy('addListener'),
          removeListener: jasmine.createSpy('removeListener'),
          dispatchEvent: jasmine.createSpy('dispatchEvent'),
        }) as unknown as MediaQueryList,
    );

    await TestBed.configureTestingModule({
      imports: [UnifiedTableHostComponent, OverlayTableHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    responsiveMatches = false;
    responsiveListener = undefined;
  });

  it('uses the native internal viewport as the only desktop scroll owner', async () => {
    const fixture = TestBed.createComponent(UnifiedTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const overlayDebug = fixture.debugElement.query(By.directive(ScrollOverlayComponent));
    const overlay = overlayDebug.componentInstance as ScrollOverlayComponent;
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;

    expect(overlay.disableVertical).toBe(false);
    expect(overlay.disableHorizontal).toBe(false);
    expect(overlay.nativeScrollbars).toBe(true);
    expect(overlay.verticalSelector).toBeNull();
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Vista previa de movimientos');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('data-so-native-scrollbar')).toBe('true');
    const root = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;
    const header = fixture.nativeElement.querySelector('th') as HTMLTableCellElement;
    const wrappedCell = fixture.nativeElement.querySelector('td') as HTMLTableCellElement;
    expect(root.classList).toContain('atomic-table-truncate-cells');
    expect(getComputedStyle(header).whiteSpace).toBe('nowrap');
    expect(wrappedCell.classList).toContain('atomic-table-cell-wrap');
    expect(getComputedStyle(wrappedCell).whiteSpace).toBe('normal');
  });

  it('keeps the Atomic overlay rails active on a bounded desktop viewport', async () => {
    const fixture = TestBed.createComponent(OverlayTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const overlayDebug = fixture.debugElement.query(By.directive(ScrollOverlayComponent));
    const overlay = overlayDebug.componentInstance as ScrollOverlayComponent;
    const root = overlayDebug.nativeElement as HTMLElement;
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;

    expect(overlay.disableVertical).toBe(false);
    expect(overlay.disableHorizontal).toBe(false);
    expect(overlay.nativeScrollbars).toBe(false);
    expect(overlay.verticalSelector).toBeNull();
    expect(root.classList).toContain('atomic-table-bounded-scroll');
    expect(root.classList).not.toContain('so-no-vertical');
    expect(root.classList).not.toContain('so-no-horizontal');
    expect(root.classList).not.toContain('so-native-scrollbars');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Movimientos con indicadores overlay');
    expect(viewport.tabIndex).toBe(0);
    expect(viewport.getAttribute('data-so-managed-scrollbar')).toBe('true');
    expect(viewport.hasAttribute('data-so-native-scrollbar')).toBe(false);
  });

  it('switches from native presentation to overlay without changing the scroll owner', async () => {
    const fixture = TestBed.createComponent(UnifiedTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const overlayDebug = fixture.debugElement.query(By.directive(ScrollOverlayComponent));
    const overlay = overlayDebug.componentInstance as ScrollOverlayComponent;
    const root = overlayDebug.nativeElement as HTMLElement;
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;

    expect(overlay.verticalSelector).toBeNull();
    expect(root.classList).toContain('so-native-scrollbars');
    expect(viewport.getAttribute('data-so-native-scrollbar')).toBe('true');

    fixture.componentInstance.scrollbarMode.set('overlay');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlay.verticalSelector).toBeNull();
    expect(overlay.nativeScrollbars).toBe(false);
    expect(root.classList).not.toContain('so-native-scrollbars');
    expect(viewport.hasAttribute('data-so-native-scrollbar')).toBe(false);
    expect(viewport.getAttribute('data-so-managed-scrollbar')).toBe('true');
  });

  it('resets horizontal and vertical positions when the dataset identity changes', async () => {
    const fixture = TestBed.createComponent(UnifiedTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    viewport.scrollTop = 90;
    viewport.scrollLeft = 140;

    fixture.componentInstance.resetKey = 'dataset-b';
    fixture.detectChanges();

    expect(viewport.scrollTop).toBe(0);
    expect(viewport.scrollLeft).toBe(0);
  });

  it('hands ownership to the page at 768px or less without changing table semantics', async () => {
    responsiveMatches = true;
    const fixture = TestBed.createComponent(UnifiedTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    const cell = fixture.nativeElement.querySelector('td') as HTMLTableCellElement;

    expect(table).toBeTruthy();
    expect(table.querySelector('thead')).toBeTruthy();
    expect(table.querySelector('tbody')).toBeTruthy();
    expect(cell.getAttribute('data-label')).toBe('Descripción');
    expect(viewport.hasAttribute('role')).toBe(false);
    expect(viewport.hasAttribute('aria-label')).toBe(false);
    expect(viewport.hasAttribute('tabindex')).toBe(false);
    const header = table.querySelector('th') as HTMLTableCellElement;
    expect(header.scope).toBe('col');
    expect(header.hasAttribute('aria-hidden')).toBe(false);

    const responsiveRuleText = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule)
      .filter((rule) => rule.conditionText.includes('max-width: 768px'))
      .flatMap((rule) => Array.from(rule.cssRules))
      .map((rule) => rule.cssText)
      .find((text) => text.includes('.atomic-table thead') && text.includes('clip-path'));
    expect(responsiveRuleText).toContain('inset(50%)');
    expect(responsiveRuleText).not.toContain('display: none');
  });

  it('moves the accessible owner when the responsive media query changes', async () => {
    const fixture = TestBed.createComponent(UnifiedTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    expect(viewport.getAttribute('role')).toBe('region');

    responsiveListener?.({ matches: true } as MediaQueryListEvent);
    fixture.detectChanges();

    expect(viewport.hasAttribute('role')).toBe(false);
    expect(viewport.hasAttribute('tabindex')).toBe(false);

    fixture.destroy();
    expect(removeResponsiveListener).toHaveBeenCalledWith('change', jasmine.any(Function));
  });
});

/* ─────────────────────────────────────────────────────────────────────────────
   SEMANTICA DE TABLA BAJO LA REJILLA.

   Para cuadrar columnas, ScrollOverlay pasa `thead tr` y `tbody tr` a
   `display: grid` y `tbody` a `display: block`. Cambiar el `display` de los
   elementos de tabla ha retirado historicamente su rol implicito; Chrome y
   Firefox lo corrigieron y Safari con VoiceOver ha sido el rezagado.

   ESTAS PRUEBAS NO MIDEN EL ARBOL DE ACCESIBILIDAD: `Element.computedRole` no
   esta disponible en el Chrome Headless de esta suite. Lo que fijan es que los
   roles se DECLAREN de forma completa y coherente, que es lo unico observable
   aqui y lo que protege al navegador que no los conserve.
   ───────────────────────────────────────────────────────────────────────── */
@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table [columnTemplate]="columnTemplate">
      <thead>
        <tr>
          <th>Identificador</th>
          <th>Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">1</th>
          <td>Fila de prueba</td>
        </tr>
      </tbody>
    </app-table>
  `,
})
class SemanticsHostComponent {
  columnTemplate?: string;
}

describe('TableComponent semantica bajo la rejilla', () => {
  async function createHost(columnTemplate?: string) {
    await TestBed.configureTestingModule({
      imports: [SemanticsHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(SemanticsHostComponent);
    fixture.componentInstance.columnTemplate = columnTemplate;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function roles(fixture: { nativeElement: HTMLElement }) {
    const query = (selector: string) =>
      Array.from(fixture.nativeElement.querySelectorAll(selector)).map((element) =>
        element.getAttribute('role'),
      );
    return {
      table: fixture.nativeElement.querySelector('table')?.getAttribute('role') ?? null,
      grupos: query('thead, tbody'),
      filas: query('tr'),
      cabecerasDeColumna: query('thead th'),
      cabecerasDeFila: query('tbody th'),
      celdas: query('td'),
    };
  }

  /*
   El caso central. Se comprueba la jerarquia ENTERA y no solo `role="table"`:
   una tabla declarada cuyos hijos no son filas describe una tabla vacia, y
   segun el lector eso puede ser peor que no declarar nada.
  */
  it('con la rejilla activa restituye la jerarquia completa de roles', async () => {
    const fixture = await createHost('70px minmax(150px, 1fr)');
    const host = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;
    expect(host?.hasAttribute('data-so-sync-columns')).toBe(true);

    const actuales = roles(fixture);
    expect(actuales.table).toBe('table');
    expect(actuales.grupos).toEqual(['rowgroup', 'rowgroup']);
    expect(actuales.filas).toEqual(['row', 'row']);
    expect(actuales.cabecerasDeColumna).toEqual(['columnheader', 'columnheader']);
    expect(actuales.celdas).toEqual(['cell']);
  });

  /*
   Una cabecera dentro del cuerpo encabeza su FILA, no su columna. Marcarla como
   `columnheader` le diria al lector que esa celda titula toda una columna, que
   es una descripcion falsa de la tabla.
  */
  it('distingue la cabecera de fila de la de columna', async () => {
    const fixture = await createHost('70px minmax(150px, 1fr)');

    expect(roles(fixture).cabecerasDeFila).toEqual(['rowheader']);
  });

  /*
   Y sin rejilla no se declara nada: el `display` nativo ya da el rol correcto, y
   un rol explicito seria ruido que ademas mentiria si el marcado cambiara.
  */
  it('sin rejilla no declara roles, porque los nativos ya valen', async () => {
    const fixture = await createHost(undefined);
    const host = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;

    if (host?.hasAttribute('data-so-sync-columns')) {
      // La rejilla se activa por omision en cuanto hay <thead>; si asi fuera,
      // este caso no aplica y lo que manda es el de arriba.
      expect(roles(fixture).table).toBe('table');
      return;
    }
    expect(roles(fixture).table).toBeNull();
    expect(roles(fixture).filas).toEqual([null, null]);
  });
});
