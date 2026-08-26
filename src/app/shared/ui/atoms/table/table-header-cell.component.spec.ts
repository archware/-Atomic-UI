import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SortDirection, TableHeaderCellComponent } from './table-header-cell.component';

/*
  UNA CABECERA ORDENABLE QUE SOLO RESPONDE AL RATON NO ES UNA CABECERA
  ORDENABLE: ES UN ADORNO PARA QUIEN NAVEGA CON TECLADO.

  El componente ordenaba con un `@HostListener('click')` sobre el `th`, sin
  entrar en el recorrido del tabulador y sin tecla asociada. Se podia ver el
  indicador de orden y no habia forma de accionarlo. Estas pruebas fijan las
  tres piezas del arreglo —alcanzable, accionable y anunciada— y una cuarta que
  es la que se olvida: que la barra espaciadora NO desplace la pagina.
*/
@Component({
  standalone: true,
  imports: [TableHeaderCellComponent],
  template: `
    <table>
      <thead>
        <tr>
          <th
            app-table-header-cell
            [sortable]="ordenable()"
            [sortDirection]="direccion()"
            (sortChange)="recibida.set($event)">
            Importe
          </th>
        </tr>
      </thead>
    </table>
  `,
})
class AnfitrionDePrueba {
  readonly ordenable = signal(true);
  readonly direccion = signal<SortDirection>(null);
  readonly recibida = signal<SortDirection | 'sin-emitir'>('sin-emitir');
}

describe('TableHeaderCellComponent — accesibilidad de la ordenacion', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionDePrueba],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  function montar() {
    const fixture = TestBed.createComponent(AnfitrionDePrueba);
    fixture.detectChanges();
    const celda: HTMLTableCellElement =
      fixture.nativeElement.querySelector('th[app-table-header-cell]');
    return { fixture, celda };
  }

  it('entra en el recorrido del tabulador cuando ordena', () => {
    const { celda } = montar();

    expect(celda.getAttribute('tabindex')).toBe('0');
  });

  it('NO es enfocable cuando no ordena, para no obligar a tabular por columnas mudas', () => {
    const { fixture, celda } = montar();

    fixture.componentInstance.ordenable.set(false);
    fixture.detectChanges();

    expect(celda.getAttribute('tabindex')).toBeNull();
  });

  it('conserva su papel de encabezado de columna y anuncia el orden con aria-sort', () => {
    const { fixture, celda } = montar();

    /* `role="button"` habria sacado la celda de la tabla: el lector de pantalla
       dejaria de decir «columna Importe» al recorrer las celdas de abajo. */
    expect(celda.getAttribute('role')).toBeNull();
    expect(celda.getAttribute('aria-sort')).toBe('none');

    fixture.componentInstance.direccion.set('asc');
    fixture.detectChanges();
    expect(celda.getAttribute('aria-sort')).toBe('ascending');

    fixture.componentInstance.direccion.set('desc');
    fixture.detectChanges();
    expect(celda.getAttribute('aria-sort')).toBe('descending');
  });

  it('no anuncia orden si la columna no es ordenable', () => {
    const { fixture, celda } = montar();

    fixture.componentInstance.ordenable.set(false);
    fixture.detectChanges();

    expect(celda.getAttribute('aria-sort')).toBeNull();
  });

  (['Enter', ' '] as const).forEach(tecla => {
    it(`ordena con «${tecla === ' ' ? 'Espacio' : tecla}» igual que con el raton`, () => {
      const { fixture, celda } = montar();

      celda.dispatchEvent(new KeyboardEvent('keydown', { key: tecla, bubbles: true }));
      fixture.detectChanges();

      expect(fixture.componentInstance.recibida()).toBe('asc');
    });

    it(`cancela el comportamiento predeterminado de «${tecla === ' ' ? 'Espacio' : tecla}»`, () => {
      const { fixture, celda } = montar();
      const evento = new KeyboardEvent('keydown', {
        key: tecla,
        bubbles: true,
        cancelable: true,
      });

      celda.dispatchEvent(evento);
      fixture.detectChanges();

      /* Sin esto, la barra espaciadora desplaza la pagina en cada pulsacion y
         el listado salta justo mientras se intenta ordenarlo. */
      expect(evento.defaultPrevented).toBeTrue();
    });
  });

  it('el teclado no ordena una columna que no es ordenable', () => {
    const { fixture, celda } = montar();

    fixture.componentInstance.ordenable.set(false);
    fixture.detectChanges();

    celda.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.recibida()).toBe('sin-emitir');
  });

  it('el tercer paso devuelve el orden de la consulta', () => {
    const { fixture, celda } = montar();

    celda.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.recibida()).toBe('asc');

    fixture.componentInstance.direccion.set('asc');
    fixture.detectChanges();
    celda.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.recibida()).toBe('desc');

    fixture.componentInstance.direccion.set('desc');
    fixture.detectChanges();
    celda.click();
    fixture.detectChanges();
    /* Sin este tercer paso, quien ordena por error no tiene forma de volver a
       lo que estaba viendo. */
    expect(fixture.componentInstance.recibida()).toBeNull();
  });
});
