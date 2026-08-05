import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';

// `app-table` no tenia ninguna prueba. Su maquetacion de columnas vivia en el
// scroll-overlay, que la aplicaba escribiendo sobre el contenido proyectado y,
// al pasar thead/tbody/tr a display:block|grid, destruia la semantica de tabla
// sin restaurar ningun role: un lector de pantalla dejaba de anunciar filas y
// celdas. Desde 5.5.0 la maquetacion la resuelve este componente, que es el que
// posee el <table>, y estas pruebas fijan que la rejilla no vuelva a costar la
// semantica.
@Component({
  standalone: true,
  imports: [TableComponent],
  template: `
    <app-table [columnTemplate]="columnTemplate" [maxHeight]="maxHeight">
      <thead>
        <tr>
          <th>Identificador</th>
          <th>Nombre</th>
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
class TableHostComponent {
  columnTemplate?: string;
  maxHeight?: number;
}

describe('TableComponent', () => {
  async function createHost(columnTemplate?: string, maxHeight?: number) {
    await TestBed.configureTestingModule({
      imports: [TableHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TableHostComponent);
    fixture.componentInstance.columnTemplate = columnTemplate;
    fixture.componentInstance.maxHeight = maxHeight;
    await fixture.whenStable();
    return fixture;
  }

  it('conserva la semantica de tabla cuando aplica una rejilla de columnas', async () => {
    const fixture = await createHost('70px minmax(150px, 1fr)');
    const table = fixture.nativeElement.querySelector('table.atomic-table') as HTMLElement;
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.classList).toContain('atomic-table--columns');
    // El role explicito es la correccion: la rejilla anterior lo eliminaba de
    // facto al cambiar el display sin declararlo.
    expect(table.getAttribute('role')).toBe('table');
    expect(getComputedStyle(fixture.nativeElement.querySelector('tbody tr')).display).toBe('grid');
  });

  it('no aplica la rejilla cuando no se pide plantilla de columnas', async () => {
    const fixture = await createHost();
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.classList).not.toContain('atomic-table--columns');
    // Sin plantilla, la tabla se maqueta como tabla: es el camino por omision y
    // el que conserva la semantica sin ayuda de nadie.
    expect(getComputedStyle(fixture.nativeElement.querySelector('tbody tr')).display).toBe(
      'table-row',
    );
  });

  it('traslada la plantilla de columnas al elemento que la consume', async () => {
    const template = '70px minmax(150px, 1fr)';
    const fixture = await createHost(template);
    const container = fixture.nativeElement.querySelector('.atomic-table-container') as HTMLElement;

    expect(container.style.getPropertyValue('--atomic-table-columns')).toBe(template);
  });

  it('propaga la altura maxima en pixeles al viewport del overlay', async () => {
    const fixture = await createHost(undefined, 320);
    const overlay = fixture.nativeElement.querySelector('app-scroll-overlay') as HTMLElement;

    // `maxHeight` numerico se coerciona a pixeles: es lo unico que sobrevive de
    // la API anterior, donde se expresaba como `maxBodyHeight`.
    expect(overlay.style.getPropertyValue('--scroll-overlay-viewport-max-height')).toBe('320px');
  });
});
