import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';
import { TableCellComponent } from './table-cell.component';
import {
  TableComponent,
  type TableMobileScrollMode,
  type TableScrollbarMode,
} from './table.component';

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

@Component({
  standalone: true,
  imports: [TableComponent, TableCellComponent],
  template: `
    <app-table
      [maxHeight]="240"
      [ariaLabel]="'Evaluaciones desplazables en móvil'"
      [mobileScrollMode]="mobileScrollMode"
      scrollbarMode="overlay"
    >
      <thead>
        <tr>
          <th scope="col">Periodo</th>
        </tr>
      </thead>
      <tbody>
        @for (row of rows; track row) {
          <tr>
            <td app-table-cell dataLabel="Periodo">{{ row }}/2026</td>
          </tr>
        }
      </tbody>
    </app-table>
  `,
})
class BoundedMobileTableHostComponent {
  readonly mobileScrollMode: TableMobileScrollMode = 'bounded';
  readonly rows = Array.from({ length: 12 }, (_, index) => index + 1);
}

describe('TableComponent unified viewport', () => {
  const originalMatchMedia = window.matchMedia;
  let responsiveMatches = false;
  let responsiveListener: ((event: MediaQueryListEvent) => void) | undefined;
  let removeResponsiveListener: jasmine.Spy;
  let constrainedFrame: { element: HTMLElement; previousWidth: string } | undefined;

  function constrainViewportToMobile(): void {
    const frame = window.frameElement as HTMLElement | null;
    expect(frame).withContext('la prueba responsive necesita el iframe de Karma').not.toBeNull();
    if (!frame) {
      return;
    }

    constrainedFrame = { element: frame, previousWidth: frame.style.width };
    frame.style.width = '390px';
    frame.getBoundingClientRect();
    expect(window.innerWidth).toBeLessThanOrEqual(768);
  }

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
      imports: [
        UnifiedTableHostComponent,
        OverlayTableHostComponent,
        BoundedMobileTableHostComponent,
      ],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  afterEach(() => {
    if (constrainedFrame) {
      constrainedFrame.element.style.width = constrainedFrame.previousWidth;
      constrainedFrame.element.getBoundingClientRect();
      constrainedFrame = undefined;
    }
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
    expect(overlay.verticalSelector()).toBeNull();
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
    expect(overlay.verticalSelector()).toBeNull();
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

    expect(overlay.verticalSelector()).toBeNull();
    expect(root.classList).toContain('so-native-scrollbars');
    expect(viewport.getAttribute('data-so-native-scrollbar')).toBe('true');

    fixture.componentInstance.scrollbarMode.set('overlay');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlay.verticalSelector()).toBeNull();
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

  it('hands ownership to the page at 48rem or less without changing table semantics', async () => {
    responsiveMatches = true;
    constrainViewportToMobile();
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
    const root = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;
    expect(root.classList).not.toContain('atomic-table-mobile-scroll-bounded');
    expect(getComputedStyle(viewport).maxHeight).toBe('none');
    expect(getComputedStyle(viewport).overflowY).toBe('visible');
    const header = table.querySelector('th') as HTMLTableCellElement;
    expect(header.scope).toBe('col');
    expect(header.hasAttribute('aria-hidden')).toBe(false);

    const responsiveRuleText = Array.from(document.styleSheets)
      .flatMap((sheet) => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule)
      // El corte va en rem, no en px: rem sigue el tamaño de letra del navegador,
      // asi que quien lo aumenta recibe la vista compacta ANTES y no en el mismo
      // ancho fisico. Capitulo 11 de la doctrina.
      .filter((rule) => rule.conditionText.includes('max-width: 48rem'))
      .flatMap((rule) => Array.from(rule.cssRules))
      .map((rule) => rule.cssText)
      .find((text) => text.includes('.atomic-table thead') && text.includes('clip-path'));
    expect(responsiveRuleText).toContain('inset(50%)');
    expect(responsiveRuleText).not.toContain('display: none');
  });

  it('keeps one bounded and accessible ScrollOverlay viewport on mobile when opted in', async () => {
    responsiveMatches = true;
    constrainViewportToMobile();
    const fixture = TestBed.createComponent(BoundedMobileTableHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const overlayDebug = fixture.debugElement.query(By.directive(ScrollOverlayComponent));
    const overlay = overlayDebug.componentInstance as ScrollOverlayComponent;
    const root = overlayDebug.nativeElement as HTMLElement;
    const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;
    const body = fixture.nativeElement.querySelector('tbody') as HTMLTableSectionElement;

    expect(root.classList).toContain('atomic-table-mobile-scroll-bounded');
    expect(overlay.maxBodyHeight).toBe(240);
    expect(overlay.verticalSelector()).toBeNull();
    expect(viewport.getAttribute('data-so-vertical')).toBe('true');
    expect(viewport.getAttribute('data-so-managed-scrollbar')).toBe('true');
    expect(viewport.getAttribute('role')).toBe('region');
    expect(viewport.getAttribute('aria-label')).toBe('Evaluaciones desplazables en móvil');
    expect(viewport.tabIndex).toBe(0);
    expect(getComputedStyle(viewport).maxHeight).toBe('240px');
    expect(getComputedStyle(viewport).overflowY).toBe('auto');
    expect(body.hasAttribute('data-so-vertical')).toBe(false);
    expect(body.style.overflowY).toBe('');
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight + 1);

    viewport.scrollTop = 9999;
    expect(viewport.scrollTop).toBeGreaterThan(0);
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
   MAQUETACION DE COLUMNAS. Rescatado de la rama PREST-20260805-194 (3669a5e y
   e6c8b5d) y REESCRITO contra el DOM de main.

   Los asertos originales no transferian: buscaban la clase
   `atomic-table--columns` y la variable `--atomic-table-columns` sobre
   `.atomic-table-container`, y en main ninguna de las dos existe. La rama habia
   movido la maquetacion al propio componente; main la resuelve en
   ScrollOverlay, que publica `--so-column-template` sobre su host y la consume
   con `.so-root[data-so-table][data-so-sync-columns] thead tr | tbody tr`.

   Se conserva la INTENCION de cada caso y se mide geometria real donde el
   original la medía: cambiar una medicion por «existe la clase X» seria perder
   la prueba y quedarse con su titulo. Del lote original se descarta uno —«aplica
   el ancho fijo declarado»— porque salia verde con el comportamiento roto.

   ATENCION AL ANCHO DE VENTANA: el iframe de Karma mide 749px y por debajo de
   768px app-table apila tarjetas a proposito, regimen en el que cabecera y
   celda NO deben alinearse. El unico caso que necesita el modo escritorio se
   ensancha el iframe a si mismo y lo restaura al salir; no se toca la
   configuracion de Karma porque CI pasa `--browsers` y pisaria cualquier
   customLauncher, dejando el caso verde en local y rojo en CI.
   ───────────────────────────────────────────────────────────────────────── */
@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table [columnTemplate]="columnTemplate" [maxHeight]="320">
      <thead>
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Nombre</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Fila de prueba</td>
        </tr>
      </tbody>
    </app-table>
  `,
})
class ColumnGridHostComponent {
  columnTemplate?: string;
}

describe('TableComponent maquetacion de columnas', () => {
  /*
    `[maxHeight]` no es decoracion: sin el, el scroller vertical es el <tbody> y
    syncColumnTemplate() automide la plantilla en pixeles, con lo que «sin
    plantilla» dejaria de significar «sin plantilla».
  */
  async function createHost(columnTemplate?: string) {
    await TestBed.configureTestingModule({
      imports: [ColumnGridHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(ColumnGridHostComponent);
    fixture.componentInstance.columnTemplate = columnTemplate;
    const host = fixture.nativeElement as HTMLElement;
    host.style.display = 'block';
    host.style.width = '600px';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = host.querySelector('app-scroll-overlay') as HTMLElement;
    const viewport = host.querySelector('.so-scroll-area') as HTMLElement;
    /* Mide en vivo: los casos que ensanchan el contenedor necesitan volver a
       preguntar despues del reflujo, no quedarse con una foto. */
    const widths = (selector: string) =>
      Array.from(host.querySelectorAll<HTMLElement>(selector)).map(
        (cell) => cell.getBoundingClientRect().width,
      );
    return { fixture, host, root, viewport, widths };
  }

  // ---------------------------------------------------------------------------
  // ORIGINAL (82bf8de): comprobaba `container.classList` contiene
  // 'atomic-table--columns', `table[role=table]` y `tbody tr` en display:grid.
  // La premisa de la rama era: "la rejilla cambia el display y de facto borra el
  // rol de tabla, por eso hay que declarar role='table'".
  //
  // MEDIDO EN MAIN (Chrome Headless 151, con la rejilla puesta: table/thead/tbody
  // en display:block, thead tr y tbody tr en display:grid, th y td blockificados
  // a display:block): los roles de accesibilidad calculados siguen siendo
  // table / row / columnheader / row / cell, IDENTICOS a los de una <table>
  // nativa de control montada en la misma fixture. O sea: en el navegador donde
  // corre la suite la rejilla NO cuesta la semantica y `role="table"` no tiene
  // nada que proteger; transplantar ese aserto seria rojo sin defecto detras.
  //
  // Lo que en main SI puede costar la semantica —y sin que se note ni en la
  // pantalla ni en los anchos— es que el nodo sobre el que corre la rejilla deje
  // de ser una tabla de verdad: envolver el contenido proyectado en un <div>
  // dentro de la <table>, o cambiar la <table> por un <div>. Verificado: con un
  // <div> envolviendo el <ng-content>, la rejilla sigue puesta y la primera
  // columna sigue midiendo 70px, pero los roles calculados de los cinco nodos
  // pasan a estar VACIOS: la tabla desaparece del arbol de accesibilidad.
  //
  // Por eso este caso empareja las dos mitades:
  //   (a) la rejilla esta puesta y GOBIERNA de verdad -> se mide, no se supone;
  //   (b) los nodos que la llevan siguen siendo alcanzables por la interfaz
  //       HTMLTableElement (tHead / tBodies / rows) y nadie los ha silenciado.
  // Ninguna mitad es redundante: las mutaciones de maquetacion tumban solo (a) y
  // las de estructura tumban solo (b).
  //
  // Se mide sobre `thead tr` a proposito: es la unica fila que esta en grid en
  // las dos anchuras de ventana, asi que el caso pasa tal cual en el Karma por
  // defecto (749px, con el layout de tarjetas activo) y con ventana ancha
  // (1369px). No exige tocar la configuracion de Karma.
  it('conserva la semantica de tabla cuando aplica una rejilla de columnas', async () => {
    const { host, root } = await createHost('70px minmax(150px, 1fr)');

    const headerRow = host.querySelector('thead tr') as HTMLTableRowElement;
    const bodyRow = host.querySelector('tbody tr') as HTMLTableRowElement;
    const table = headerRow.closest('table.atomic-table') as HTMLTableElement | null;

    // (a) La rejilla esta activa y manda: la primera columna mide los 70px
    //     declarados, no lo que pida el contenido (sin plantilla mide 66.59).
    expect(root.getAttribute('data-so-table')).toBe('true');
    expect(root.getAttribute('data-so-sync-columns')).toBe('true');
    expect(getComputedStyle(headerRow).display).toBe('grid');
    expect(Math.round(headerRow.cells[0].getBoundingClientRect().width)).toBe(70);

    // (b) ...y lo hace sobre una tabla de verdad: las filas se alcanzan por la
    //     interfaz de tabla, no solo por querySelector. Es lo unico que detecta
    //     un <div> intercalado que deja la pantalla intacta y vacia el arbol de
    //     accesibilidad.
    expect(table instanceof HTMLTableElement).toBe(true);
    expect(table?.tHead).toBe(headerRow.parentElement as HTMLTableSectionElement);
    expect(table?.tBodies[0]?.rows[0]).toBe(bodyRow);
    expect(table?.rows.length).toBe(2);
    expect(table?.rows[1]?.cells.length).toBe(2);

    // Y nadie apaga esa semantica "para que el lector no lea una tabla rota":
    // role=presentation/none o aria-hidden sobre cualquiera de los nodos.
    const silenciada = (el: Element | null | undefined) =>
      !!el &&
      (el.getAttribute('role') === 'presentation' ||
        el.getAttribute('role') === 'none' ||
        el.hasAttribute('aria-hidden'));
    expect([table, headerRow, bodyRow, headerRow.cells[0], bodyRow.cells[0]].some(silenciada)).toBe(
      false,
    );
  });

  // ─── Host auxiliar (necesario para el caso) ──────────────────────────────────
  const HOST_WIDTH = 600;

  @Component({
    standalone: true,
    imports: [TableComponent],
    template: `
      <!-- Sin <thead>: es lo unico que apaga la deteccion de tabla del overlay.
           El [maxHeight] es LOAD-BEARING, no decorativo: sin el, verticalSelector
           pasa a 'tbody' (table.component.ts:33), el tbody se vuelve el scroller y
           la tabla nativa encoge a su contenido (medido: celdas 39.5 + 135.5 = 175
           en vez de 600), con lo que la medicion de abajo dejaria de significar
           "el contenido reparte los 600px del contenedor". -->
      <app-table [columnTemplate]="columnTemplate" [maxHeight]="320">
        <tbody>
          <tr>
            <td>1</td>
            <td>Fila de prueba</td>
          </tr>
        </tbody>
      </app-table>
    `,
  })
  class TableWithoutHeadHostComponent {
    columnTemplate?: string;
  }

  async function createHeadlessHost(columnTemplate: string) {
    await TestBed.configureTestingModule({
      imports: [TableWithoutHeadHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TableWithoutHeadHostComponent);
    fixture.componentInstance.columnTemplate = columnTemplate;
    const host = fixture.nativeElement as HTMLElement;
    host.style.display = 'block';
    host.style.width = `${HOST_WIDTH}px`; // sin ancho definido, 1fr tomaria el del iframe
    fixture.detectChanges(); // ngAfterViewInit es sincrono
    await fixture.whenStable();

    return {
      fixture,
      host,
      root: host.querySelector('app-scroll-overlay') as HTMLElement,
      row: host.querySelector('tbody tr') as HTMLElement,
      cellWidths: Array.from(host.querySelectorAll<HTMLElement>('tbody td')).map(
        (cell) => cell.getBoundingClientRect().width,
      ),
    };
  }

  // ─── Caso adaptado ───────────────────────────────────────────────────────────
  // Original (82bf8de): 'no aplica la rejilla cuando no se pide plantilla de columnas'
  //   expect(container.classList).not.toContain('atomic-table--columns');
  //   expect(getComputedStyle(tbody tr).display).toBe('table-row');
  //
  // LA PREMISA DEL ORIGINAL ES FALSA EN MAIN, por eso el caso se RE-ANCLA en vez de
  // traducirse literalmente. En la rama la rejilla la encendia `columnTemplate`; en
  // main la enciende LA TABLA: scroll-overlay marca su propio host con
  // data-so-table + data-so-sync-columns cuando encuentra un <thead>
  // (scroll-overlay.component.ts:452-472) y solo entonces casa
  // `.so-root[data-so-table][data-so-sync-columns] thead tr, ... tbody tr { display:grid }`
  // (scroll-overlay.component.css:283-292). MEDIDO en Chrome: con <thead>, thead tr y
  // tbody tr son display:grid CON plantilla ('70px 528px') y SIN ella (fallback
  // auto-fit '40px 135.672px 0px ...'). O sea: "sin plantilla no hay rejilla" no existe
  // en main; escribirlo seria un aserto falso, y suavizarlo a "no esta la clase X" seria
  // quedarse con el titulo y perder la prueba.
  //
  // LO QUE SI EXISTE —y es lo que el caso original protegia de verdad: que la rejilla no
  // sea incondicional y quede un camino en el que la tabla se maqueta como tabla— es la
  // tabla SIN CABECERAS. Ahi no hay columnas que alinear, el host no se marca y el layout
  // nativo sobrevive. Esta version declara ADEMAS la plantilla, con lo que prueba mas que
  // la original: la plantilla LLEGA al host (applyColumnTemplate no depende de la
  // deteccion de tabla) y aun asi NO SE APLICA. Y se mide, no se mira una clase: la
  // primera celda no vale los 70px declarados y el reparto lo hace el contenido.
  //
  // ENTORNO: el iframe de Karma mide 749px y dispara el modo tarjeta de
  // table.component.ts:172-272, cuyo selector
  // `.atomic-table tbody tr { display:flex; flex-direction:column }` NO exige
  // [data-so-table] y por tanto alcanza tambien a esta tabla (medido a 749px:
  // display 'flex', celdas apiladas 566+566=1132).
  //
  // Se ensancha el iframe DESDE EL PROPIO CASO, como sus hermanos, y no con un
  // customLauncher de Karma: CI pasa `--browsers` por linea de comandos y eso
  // pisa el `browsers` del fichero de configuracion, con lo que el caso
  // quedaria verde en local y rojo en CI. Ensancharse a si mismo funciona con
  // la configuracion tal cual esta.
  it('sin cabeceras que alinear no hay rejilla: la tabla se maqueta como tabla y la plantilla declarada no deja huella', async () => {
    const frame = window.frameElement as HTMLIFrameElement | null;
    expect(frame).withContext('el caso mide columnas y necesita el modo escritorio').not.toBeNull();
    if (!frame) {
      return;
    }
    const previousWidth = frame.style.width;
    frame.style.width = '1400px';
    frame.getBoundingClientRect();

    try {
      const template = '70px minmax(150px, 1fr)';
      const { root, row, cellWidths } = await createHeadlessHost(template);

      // Guarda: la plantilla SI llega al overlay. Sin este aserto, la ausencia de
      // rejilla podria deberse a que la entrada nunca llego, y el caso seria vacuo.
      expect(root.style.getPropertyValue('--so-column-template')).toBe(template);
      expect(root.classList).toContain('so-lock-template');

      // La rejilla la gobierna el <thead>, no la plantilla: sin cabeceras el overlay
      // no se marca y su regla CSS no puede casar.
      expect(root.getAttribute('data-so-table')).toBeNull();
      expect(root.getAttribute('data-so-sync-columns')).toBeNull();

      const rowStyle = getComputedStyle(row);
      expect(rowStyle.display).toBe('table-row'); // [>768px] la fila sigue siendo fila de tabla
      expect(rowStyle.gridTemplateColumns).toBe('none');

      // Y lo que ve el usuario: los 70px declarados no aparecen por ninguna parte; el
      // ancho lo reparte el contenido sobre los 600px del contenedor (medido: 135.41 +
      // 464.59). Con la rejilla puesta serian exactamente 70 + 528 = 598 (2px de borde
      // de .so-root[data-so-table]), asi que ambos asertos discriminan.
      expect(cellWidths.length).toBe(2);
      expect(cellWidths[0]).toBeGreaterThan(70);
      expect(Math.round(cellWidths[0] + cellWidths[1])).toBe(HOST_WIDTH); // [>768px]
    } finally {
      frame.style.width = previousWidth;
      frame.getBoundingClientRect();
    }
  });

  // Adaptacion de 'traslada la plantilla de columnas al elemento que la consume'
  // (82bf8de), que afirmaba
  //     container.style.getPropertyValue('--atomic-table-columns') === template
  // sobre `.atomic-table-container`. En main ni esa clase-con-variable ni esa
  // propiedad existen: la plantilla la escribe scroll-overlay como custom
  // property INLINE `--so-column-template` sobre SU PROPIO host
  // (<app-scroll-overlay>, .so-root; applyColumnTemplate,
  // scroll-overlay.component.ts:324-334) y la consume la regla
  // `.so-root[data-so-table][data-so-sync-columns] thead tr|tbody tr`
  // (scroll-overlay.component.css:283-292).
  //
  // El caso sigue siendo el de "la plantilla LLEGA" (el original lo separaba
  // expresamente de los de geometria), pero cubre las dos mitades del trayecto,
  // que se rompen por separado:
  //  (a) llega VERBATIM —sin resolver— y AL NODO CORRECTO. El nodo es lo que de
  //      verdad protege este caso y nadie mas: mover el setProperty al
  //      .so-scroll-area deja los anchos medidos IDENTICOS (la custom property
  //      se hereda), asi que ninguna prueba de layout lo ve; solo el style
  //      inline del host lo fija.
  //  (b) el elemento que la consume la recibe y la USA: la fila de cabecera la
  //      hereda y su grid-template-columns resuelto arranca en la pista fija
  //      declarada (70px), no en el fallback auto-fit. Sin (b), (a) seria un eco
  //      de string: la variable podria estar puesta y la regla CSS leer otro
  //      nombre.
  //
  // Se mide sobre `thead tr` a proposito: es display:grid con las dos anchuras
  // de ventana, mientras que `tbody tr` pasa a flex-column bajo la media query
  // responsive de table.component.ts:172, activa en el iframe de 749px de Karma.
  // Este caso, por tanto, NO necesita ensanchar la ventana de pruebas.
  // Medido: theadGTC '70px 150px' a 749px y '70px 528px' a 1369px; sin plantilla,
  // '66.59px ...' y '133.19px 90.63px 0px...' respectivamente.
  it('traslada la plantilla de columnas al elemento que la consume', async () => {
    const template = '70px minmax(150px, 1fr)';
    const { host, root } = await createHost(template);

    // (a) Viaja tal cual, sin resolver, al host del overlay que la publica.
    expect(root.style.getPropertyValue('--so-column-template')).toBe(template);

    // (b) Y aterriza en el elemento que la consume, que la aplica de verdad.
    const headerRow = host.querySelector('thead tr') as HTMLElement;
    const headerStyle = getComputedStyle(headerRow);
    expect(headerStyle.getPropertyValue('--so-column-template').trim()).toBe(template);
    expect(headerStyle.display).toBe('grid');
    expect(headerStyle.gridTemplateColumns.split(' ')[0]).toBe('70px');
  });

  // ---------------------------------------------------------------------------
  // FIXTURES QUE NECESITA EL CASO
  // Las 30 filas no son adorno: sin contenido que desborde, un viewport acotado y
  // uno libre miden lo mismo y la medicion no probaria nada.
  // ---------------------------------------------------------------------------
  @Component({
    standalone: true,
    imports: [TableComponent],
    template: `
      <app-table [maxHeight]="maxHeight">
        <thead>
          <tr>
            <th scope="col">Identificador</th>
            <th scope="col">Nombre</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row) {
            <tr>
              <td>{{ row }}</td>
              <td>Fila de prueba {{ row }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  })
  class BoundedTableHostComponent {
    maxHeight?: number;
    readonly rows = Array.from({ length: 30 }, (_, index) => index + 1);
  }

  // Tabla sin <thead>: es la unica forma de medir la altura a cualquier ancho de
  // ventana (ver el comentario del segundo caso).
  @Component({
    standalone: true,
    imports: [TableComponent],
    template: `
      <app-table [maxHeight]="320">
        <tbody>
          @for (row of rows; track row) {
            <tr>
              <td>{{ row }}</td>
              <td>Fila de prueba {{ row }}</td>
            </tr>
          }
        </tbody>
      </app-table>
    `,
  })
  class HeadlessBoundedTableHostComponent {
    readonly rows = Array.from({ length: 30 }, (_, index) => index + 1);
  }

  describe('TableComponent altura maxima', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [BoundedTableHostComponent, HeadlessBoundedTableHostComponent],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();
    });

    async function createBoundedHost(maxHeight?: number): Promise<HTMLElement> {
      const fixture = TestBed.createComponent(BoundedTableHostComponent);
      fixture.componentInstance.maxHeight = maxHeight;
      fixture.detectChanges(); // el ngAfterViewInit del overlay es sincrono
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    // ===========================================================================
    // CASO ADAPTADO (equivale al viejo 'propaga la altura maxima en pixeles al
    // viewport del overlay', que leia --scroll-overlay-viewport-max-height).
    //
    // QUE PROTEGE: la cadena entera del numero 320 hasta el elemento que de
    // verdad hace de viewport. En main esa variable no existe (cero ocurrencias);
    // la altura viaja como [maxBodyHeight] (table.component.ts:29),
    // normalizeCssSize() la coerciona a pixeles (scroll-overlay.component.ts:1055
    // -1075) y aterriza en DOS sitios: el host .so-root, como data-so-max-height
    // + --so-max-height/--so-body-height (:350-352), y el div .so-scroll-area,
    // como estilo EN LINEA (updateVerticalMaxHeight, :949-966).
    //
    // Se comprueba tambien QUE elemento la recibe: con maxHeight, verticalSelector
    // pasa a null (table.component.ts:33) y el scroller deja de ser el <tbody>.
    // Poner la altura en el <tbody> tambien "acotaria" la tabla, asi que sin este
    // par de asertos el caso no distinguiria el viewport del cuerpo.
    //
    // El bloque final (sin maxHeight) es el contraste que impide que el caso pase
    // por casualidad: sin el, un valor por defecto en el binding lo dejaria verde.
    //
    // POR QUE ESTILO EN LINEA Y NO getComputedStyle: por debajo de 768px app-table
    // devuelve el scroll a la pagina con `max-height: none !important` sobre
    // .so-scroll-area (media query table.component.ts:181-190) y el calculado da
    // 'none'. La ventana del Chrome headless de CI mide 749px, asi que el efecto
    // geometrico de esta altura se comprueba en el caso companero de abajo.
    // ===========================================================================
    it('propaga la altura maxima en pixeles al viewport del overlay', async () => {
      const host = await createBoundedHost(320);
      const root = host.querySelector('app-scroll-overlay') as HTMLElement;
      const viewport = host.querySelector('.so-scroll-area') as HTMLElement;
      const body = host.querySelector('tbody') as HTMLElement;

      // El numero se coerciona a pixeles y marca el host del overlay.
      expect(root.getAttribute('data-so-max-height')).toBe('true');
      expect(root.style.getPropertyValue('--so-max-height')).toBe('320px');
      expect(root.style.getPropertyValue('--so-body-height')).toBe('320px');

      // ...y se declara sobre el viewport, que es quien posee el scroll vertical.
      expect(viewport.getAttribute('data-so-vertical')).toBe('true');
      expect(body.hasAttribute('data-so-vertical')).toBe(false);
      expect(viewport.style.maxHeight).toBe('320px');
      expect(viewport.style.height).toBe('320px');
      expect(viewport.style.minHeight).toBe('320px');

      // Sin maxHeight no hay ni marca ni declaraciones: los 320px de arriba solo
      // pueden venir de la entrada.
      const sinAltura = await createBoundedHost(undefined);
      const rootSinAltura = sinAltura.querySelector('app-scroll-overlay') as HTMLElement;
      const viewportSinAltura = sinAltura.querySelector('.so-scroll-area') as HTMLElement;
      expect(rootSinAltura.hasAttribute('data-so-max-height')).toBe(false);
      expect(rootSinAltura.style.getPropertyValue('--so-max-height')).toBe('');
      expect(viewportSinAltura.style.maxHeight).toBe('');
    });

    // ===========================================================================
    // COMPANERO MEDIDO (recomendado pegarlo junto al anterior).
    //
    // El caso de arriba prueba que la altura LLEGA con su unidad y al elemento
    // correcto; este prueba que PRODUCE un viewport acotado de verdad: 320px
    // medidos con getBoundingClientRect, contenido que desborda y scroll que se
    // mueve. Hace falta porque la declaracion en linea puede quedar anulada por
    // CSS sin que el caso anterior se entere (verificado: una regla
    // `max-height: none !important` sobre .so-scroll-area lo deja verde y solo
    // tumba este).
    //
    // POR QUE UNA TABLA SIN <thead>: sin thead el overlay no marca data-so-table,
    // y TODAS las reglas de tarjetas de app-table que a <=768px anulan la altura
    // (table.component.ts:181-190) cuelgan de `.so-root[data-so-table]`. Asi la
    // medida vale a cualquier ancho, incluidos los 749px del headless de CI. Con
    // <thead> esta misma medida solo es cierta por encima de 768px: a 749px main
    // libera la altura A PROPOSITO y el viewport mide 3505px, no 320.
    // ===========================================================================
    it('la altura maxima produce un viewport acotado y desplazable', async () => {
      const fixture = TestBed.createComponent(HeadlessBoundedTableHostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const viewport = fixture.nativeElement.querySelector('.so-scroll-area') as HTMLElement;

      expect(Math.round(viewport.getBoundingClientRect().height)).toBe(320);
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight + 1);
      viewport.scrollTop = 9999;
      expect(viewport.scrollTop).toBeGreaterThan(0);
    });
  });

  it('alinea cada celda con su cabecera, que es la razon de existir de la rejilla', async () => {
    // QUE PROTEGE: que cada columna del cuerpo caiga exactamente bajo su cabecera.
    // En main esa alineacion NO la da la tabla nativa —scroll-overlay pasa thead y
    // tbody a display:block—, sino la rejilla que impone a `thead tr` y a `tbody tr`
    // con la MISMA --so-column-template (scroll-overlay.component.css:283-292). Si
    // una de las dos filas deja de ser rejilla, o deja de recibir la plantilla, las
    // celdas se descuelgan de sus cabeceras aunque el resto del DOM siga intacto.
    // Por eso se mide geometria real (borde izquierdo y ancho de cada caja) y no
    // clases ni variables: la propiedad se hereda y una variable en el nodo
    // equivocado seguiria alineando, asi que solo la medicion prueba el efecto.
    //
    // PRECONDICION DE ENTORNO: el iframe de Karma mide 749px y por debajo de 768px
    // app-table cambia a tarjetas A PROPOSITO (table.component.ts:172-272: thead
    // con clip-path:inset(50%) y `tbody tr` a flex-column), modo en el que cabecera
    // y celda NO deben alinearse —medido: th [70,150] frente a td [566,566]—. Para
    // medir el modo escritorio se ensancha el iframe #context durante el caso y se
    // restaura al salir. Si el iframe no existe el caso se pone ROJO, nunca se
    // salta en silencio.
    const frame = window.frameElement as HTMLIFrameElement | null;
    expect(frame)
      .withContext('el caso necesita ensanchar el iframe #context de Karma')
      .not.toBeNull();
    if (!frame) {
      return;
    }
    const previousWidth = frame.style.width;
    frame.style.width = '1400px';

    try {
      expect(window.matchMedia('(max-width: 768px)').matches)
        .withContext('a <=768px app-table apila tarjetas y la alineacion no aplica')
        .toBe(false);

      const { host } = await createHost('70px minmax(150px, 1fr)');
      const boxes = (selector: string) =>
        Array.from(host.querySelectorAll<HTMLElement>(selector)).map((cell) =>
          cell.getBoundingClientRect(),
        );
      const headers = boxes('thead th');
      const cells = boxes('tbody td');

      // Conteo exacto: `headers.length === cells.length` (lo que hacia el original)
      // pasa tambien con cero celdas, que es la puerta clasica a un caso vacuo.
      expect(headers.length).toBe(2);
      expect(cells.length).toBe(2);
      // Anti-vacuidad: si las dos columnas midieran lo mismo, «alinean» seria cierto
      // por accidente. La plantilla declara 70px y el resto, luego el reparto tiene
      // que ser desigual (medido: 70 y 528 en un host de 600px).
      expect(headers[1].width).toBeGreaterThan(headers[0].width * 2);

      headers.forEach((header, index) => {
        expect(Math.abs(cells[index].left - header.left))
          .withContext(`columna ${index}: borde izquierdo`)
          .toBeLessThan(1);
        expect(Math.abs(cells[index].width - header.width))
          .withContext(`columna ${index}: ancho`)
          .toBeLessThan(1);
      });
    } finally {
      frame.style.width = previousWidth;
    }
  });

  // Protege lo unico que justifica admitir unidades flexibles en la plantilla:
  // que `1fr` se reparta sobre el ANCHO DEL CONTENEDOR y no sobre el texto de
  // las celdas. Quien lo consigue en main no es app-table sino la fila-rejilla
  // del overlay (`.so-root[data-so-table][data-so-sync-columns] thead tr` con
  // `width: max-content; min-width: 100%`, scroll-overlay.component.css:283-292),
  // que app-table enciende con `[columnTemplate]` + `[lockColumnTemplate]`.
  // No vale comparar las dos columnas entre si: si la rejilla se dimensionara
  // por contenido la fila entera encogeria y la proporcion se conservaria. Por
  // eso se miden contra el viewport que las contiene y se vuelven a medir con
  // el contenedor 300px mas ancho; solo una pista `fr` sigue al contenedor.
  it('la columna flexible absorbe el espacio restante', async () => {
    // Por debajo de 768px app-table renuncia a las columnas y apila tarjetas
    // (media query de table.component.ts:172), luego alli no hay espacio
    // sobrante que repartir. El iframe de Karma mide 749px: el caso ensancha su
    // propio viewport para pedir el layout de escritorio y lo deja como estaba.
    const testFrame = window.frameElement as HTMLElement | null;
    const previousFrameWidth = testFrame ? testFrame.style.width : '';
    try {
      if (testFrame) {
        testFrame.style.width = '1400px';
        testFrame.getBoundingClientRect(); // fuerza el reflujo del contenedor
      }
      expect(window.innerWidth)
        .withContext('el caso mide columnas: por debajo de 768px app-table apila tarjetas')
        .toBeGreaterThan(768);

      const { host, viewport, widths } = await createHost('70px minmax(150px, 1fr)');
      const available = viewport.getBoundingClientRect().width;
      const [fixed, flexible] = widths('thead th');

      // La flexible se queda con todo lo que sobra: entre las dos cubren el
      // viewport entero, no el ancho de su propio contenido.
      expect(Math.round(fixed)).toBe(70);
      expect(flexible).toBeGreaterThan(fixed * 3);
      expect(Math.round(fixed + flexible)).toBe(Math.round(available));

      // Y manda el contenedor: 300px mas de sitio son 300px mas para la
      // flexible y ni uno para la fija. La primera asercion comprueba que el
      // ensanche llego de verdad, para que la segunda no pueda salir 0 === 0.
      host.style.width = '900px';
      const widerAvailable = viewport.getBoundingClientRect().width;
      const [fixedWider, flexibleWider] = widths('thead th');
      expect(Math.round(widerAvailable - available)).toBe(300);
      expect(Math.round(fixedWider)).toBe(70);
      expect(Math.round(flexibleWider - flexible)).toBe(300);
    } finally {
      if (testFrame) {
        testFrame.style.width = previousFrameWidth;
        testFrame.getBoundingClientRect();
      }
    }
  });

  // Contraste que da valor a los casos de arriba: sin plantilla NO aparece por
  // ninguna parte el 70px declarado. Cuidado, porque en main "sin plantilla" NO
  // es "sin rejilla" (la rejilla la enciende el <thead>, no columnTemplate): es
  // que no se escribe --so-column-template y los tracks caen al fallback
  // repeat(auto-fit, minmax(var(--so-min-column-width), max-content)) de
  // scroll-overlay.component.css:283-292, donde el ancho lo decide el contenido.
  // Por eso no basta con mirar la propiedad: se MIDE. Se alarga el texto de la
  // cabecera y su columna tiene que seguirlo; y como control del regimen
  // contrario, con plantilla declarada ese mismo texto no la mueve ni un pixel.
  // El [maxHeight] del host es carga util: sin el, el scroller vertical es el
  // <tbody>, syncColumnTemplate() automide y congela --so-column-template en
  // pixeles, con lo que "sin plantilla" dejaria de significar "sin plantilla".
  // Medido en Chrome Headless: 66.59 -> 337.92 px a 749px de iframe (el ancho
  // por defecto de Karma) y 133.19 -> 428.55 px con ventana ancha; la columna
  // declarada vale 70 en ambos. El caso no necesita tocar la config de Karma.
  it('sin plantilla, los anchos los decide el contenido y no son los declarados', async () => {
    const TEXTO_LARGO = 'Identificador larguisimo de la fila con texto de sobra';

    const sinPlantilla = await createHost();
    const cabecera = sinPlantilla.host.querySelector('thead th') as HTMLElement;

    // Nada declarado llega al DOM: ni la variable de la rejilla ni el bloqueo.
    expect(sinPlantilla.root.style.getPropertyValue('--so-column-template')).toBe('');
    expect(sinPlantilla.root.classList).not.toContain('so-lock-template');

    const anchoTextoCorto = cabecera.getBoundingClientRect().width;
    expect(Math.round(anchoTextoCorto)).not.toBe(70);

    // Mismo DOM, solo cambia el contenido: la columna lo sigue.
    cabecera.textContent = TEXTO_LARGO;
    expect(cabecera.getBoundingClientRect().width).toBeGreaterThan(anchoTextoCorto * 2);

    // Control del regimen contrario, dentro del mismo caso para que la medicion
    // de arriba no pueda pasar por casualidad: con plantilla, el ancho es el
    // declarado y el texto largo le da exactamente igual.
    TestBed.resetTestingModule();
    const conPlantilla = await createHost('70px 200px');
    const anclada = conPlantilla.host.querySelector('thead th') as HTMLElement;

    expect(Math.round(anclada.getBoundingClientRect().width)).toBe(70);
    anclada.textContent = TEXTO_LARGO;
    expect(Math.round(anclada.getBoundingClientRect().width)).toBe(70);
  });
});
