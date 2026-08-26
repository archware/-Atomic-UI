import { Component, HostBinding, HostListener, ChangeDetectionStrategy, ViewEncapsulation, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'th[app-table-header-cell]',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="th-content" [class.sortable]="sortable()">
      <ng-content></ng-content>
      @if (sortable()) {
        <span class="sort-indicator" [class.active]="sortDirection() !== null">
          @if (sortDirection() === 'asc') {
            <i class="fa-solid fa-sort-up"></i>
          } @else if (sortDirection() === 'desc') {
            <i class="fa-solid fa-sort-down"></i>
          } @else {
            <i class="fa-solid fa-sort"></i>
          }
        </span>
      }
    </div>
  `,
  styleUrl: './table-header-cell.component.css'
})
export class TableHeaderCellComponent {
  readonly sortable = input(false);
  readonly sortDirection = input<SortDirection>(null);
  readonly sortChange = output<SortDirection>();

  @HostBinding('class.sortable-cell') get isSortable() {
    return this.sortable();
  }

  /**
   * Entra en el recorrido del tabulador SOLO si de verdad hace algo.
   *
   * Una cabecera que no ordena no es interactiva, y darle foco obligaria a
   * tabular por todas las columnas para llegar a la unica que responde.
   */
  @HostBinding('attr.tabindex') get indiceDeTabulacion(): number | null {
    return this.sortable() ? 0 : null;
  }

  /**
   * Estado de ordenacion anunciado por el lector de pantalla.
   *
   * AQUI NO VA `role="button"`, Y NO ES UN DESCUIDO. El anfitrion es un `th`:
   * su papel implicito es `columnheader`, y eso es lo que hace que un lector de
   * pantalla diga «columna Importe» al recorrer las celdas de abajo. Ponerle
   * `role="button"` lo saca de la tabla: se gana el anuncio de «boton» y se
   * pierde la unica pista que da contexto a cada celda de la columna.
   *
   * El equivalente semantico correcto para una cabecera ordenable es conservar
   * `columnheader` y publicar el estado con `aria-sort`, que es exactamente
   * para esto. Lo que faltaba no era el papel, era poder accionarla.
   */
  @HostBinding('attr.aria-sort') get ordenAnunciado(): string | null {
    if (!this.sortable()) return null;

    const direccion = this.sortDirection();
    if (direccion === 'asc') return 'ascending';
    if (direccion === 'desc') return 'descending';
    return 'none';
  }

  @HostListener('click')
  onClick() {
    this.alternarOrden();
  }

  /**
   * Enter y Espacio ordenan igual que el raton.
   *
   * SE ESCUCHA EN `keydown` Y SE CANCELA EL PREDETERMINADO. En `keyup` la
   * barra espaciadora ya habria hecho lo suyo: desplazar la pagina. Quien
   * ordena una tabla larga con el teclado veria saltar el listado en cada
   * pulsacion, que es peor que no poder ordenar. Cancelarlo en `keydown` es lo
   * que hace un boton nativo, y aqui hay que hacerlo a mano porque el
   * anfitrion sigue siendo un `th`.
   *
   * El parametro se tipa `Event` y no `KeyboardEvent` porque eso es lo que
   * `$event` entrega bajo compilacion estricta, y aqui basta: lo unico que se
   * usa es `preventDefault()`, que ya vive en `Event`. Estrechar el tipo solo
   * para leerlo mejor rompia la compilacion de los consumidores.
   */
  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  alPulsarTecla(evento: Event) {
    if (!this.sortable()) return;

    evento.preventDefault();
    this.alternarOrden();
  }

  /**
   * Ninguna → ascendente → descendente → ninguna.
   *
   * El tercer paso devuelve el orden de la consulta, y por eso existe: sin el,
   * quien ordena por error no tiene forma de volver a lo que estaba viendo.
   */
  private alternarOrden(): void {
    if (!this.sortable()) return;

    const direccion = this.sortDirection();
    const siguiente: SortDirection =
      direccion === 'asc' ? 'desc' : direccion === 'desc' ? null : 'asc';

    this.sortChange.emit(siguiente);
  }
}
