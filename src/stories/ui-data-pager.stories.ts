import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { DataPagerComponent } from '../app/shared/ui/organisms/data-pager/data-pager.component';

/*
  EL PAGINADOR NO SE PAGINA SOLO.

  `DataPagerComponent` es un componente CONTROLADO: `total`, `page` y `pageSize`
  entran, `pageChange` y `pageSizeChange` salen, y quien manda es el consumidor.
  Pulsar «siguiente» en una historia de argumentos fijos emite el evento y no
  cambia nada, y eso es exactamente lo que hay que enseñar; por eso la historia
  del salto de tamaño monta un anfitrion con estado propio y las demas se quedan
  en una foto de una posicion concreta del recorrido.

  Lo que estas historias fijan es el CALCULO Y EL BLOQUEO, que es donde un
  paginador se rompe sin que nadie lo note:

  - `totalPages()` es `max(1, ceil(total / pageSize))`. Con `total = 0` sigue
    diciendo «Página 1 de 1»: no hay estado vacio propio, y por eso la historia
    de cero registros existe.
  - «Primera» y «anterior» se deshabilitan con `page === 1`; «siguiente» y
    «última», con `page === totalPages()`. Con una sola pagina las cuatro caen a
    la vez, que es el caso que casi nunca se prueba.
  - Cambiar el tamaño de pagina cambia el numero de paginas bajo los pies. El
    consumidor tiene que devolver la pagina a 1 o se queda mirando un tramo que
    ya no existe; el anfitrion de la ultima historia lo hace a la vista.

  UNA ADVERTENCIA SOBRE LOS CUATRO BOTONES. La plantilla del componente escribe
  `title="Primera página"` sobre `<app-icon-button>`, pero ese atomo no publica
  entrada `title`: publica `tooltip`. El texto se queda entonces como atributo
  nativo del ANFITRION -sirve de globo al pasar el raton- y el `<button>` de
  dentro recibe `aria-label=""`, porque `[attr.aria-label]="ariaLabel() ||
  tooltip()"` resuelve a cadena vacia. Su unico contenido es un glifo de Font
  Awesome. Resultado: cuatro botones sin nombre accesible utilizable.

  Por eso las comprobaciones de aqui abajo localizan los controles por
  `app-icon-button[title="…"]` y no por su rol y su nombre: no es una preferencia
  de estilo, es que ese nombre hoy no existe. Pasar `tooltip=` en vez de `title=`
  lo arregla, y eso es tocar el componente, que no es cosa de este frente.
*/

/** Anfitrion con estado: lo que un consumidor real tiene que escribir alrededor del paginador. */
@Component({
  selector: 'app-story-data-pager-anfitrion',
  standalone: true,
  imports: [DataPagerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="anfitrion">
      <p class="anfitrion__tramo">
        Mostrando {{ primerRegistro() }}–{{ ultimoRegistro() }} de {{ total }} comprobantes.
      </p>

      <app-data-pager
        [total]="total"
        [page]="pagina()"
        [pageSize]="tamano()"
        [pageSizeOptions]="opciones"
        (pageChange)="cambiarPagina($event)"
        (pageSizeChange)="cambiarTamano($event)"
      />

      <p class="anfitrion__evento" role="status">{{ ultimoEvento() }}</p>
    </div>
  `,
  styles: [
    `
      .anfitrion {
        display: grid;
        gap: var(--space-3);
      }

      .anfitrion__tramo,
      .anfitrion__evento {
        margin: 0;
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }

      .anfitrion__evento {
        min-height: var(--space-5);
      }
    `,
  ],
})
class DataPagerAnfitrionStory {
  protected readonly total: number = 248;
  protected readonly opciones: number[] = [10, 25, 50, 100];

  protected readonly pagina = signal(1);
  protected readonly tamano = signal(10);
  protected readonly ultimoEvento = signal('Sin eventos todavía. Pulse un control o cambie el tamaño.');

  protected readonly primerRegistro = computed(() =>
    this.total === 0 ? 0 : (this.pagina() - 1) * this.tamano() + 1,
  );

  protected readonly ultimoRegistro = computed(() =>
    Math.min(this.total, this.pagina() * this.tamano()),
  );

  protected cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.ultimoEvento.set(`pageChange → ${pagina}`);
  }

  /*
    EL SALTO DE TAMANO DEVUELVE LA PAGINA A 1.

    Con 248 registros, pasar de 10 a 100 por pagina deja 3 paginas donde habia
    25. Quien estaba en la 18 se queda apuntando a un tramo inexistente: el
    paginador lo pintaria como «Página 18 de 3» sin quejarse, porque `page` no
    se recorta contra `totalPages()`. Corregirlo es responsabilidad de quien
    tiene el estado, y es esta linea.
  */
  protected cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(1);
    this.ultimoEvento.set(`pageSizeChange → ${tamano} (la página vuelve a 1)`);
  }
}

/** Localiza el `<button>` de un control del paginador por el `title` de su anfitrion. */
function control(canvasElement: HTMLElement, titulo: string): HTMLButtonElement {
  const boton = canvasElement.querySelector<HTMLButtonElement>(
    `app-icon-button[title="${titulo}"] button`,
  );
  if (!boton) {
    throw new Error(`No se encontró el control «${titulo}» del paginador.`);
  }
  return boton;
}

const meta: Meta<DataPagerComponent> = {
  title: '3. Organisms/DataPager',
  component: DataPagerComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DataPagerAnfitrionStory],
    }),
  ],
  argTypes: {
    total: { control: { type: 'number', min: 0 } },
    page: { control: { type: 'number', min: 1 } },
    pageSize: { control: { type: 'number', min: 1 } },
    pageSizeOptions: { control: 'object' },
  },
  args: {
    total: 248,
    page: 1,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Pie de recorrido de una tabla. Componente controlado: no guarda página ni tamaño, ' +
          'los recibe y los emite.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<DataPagerComponent>;

export const PrimeraPagina: Story = {
  name: 'Primera página: retroceder no lleva a ninguna parte',
  args: { total: 248, page: 1, pageSize: 10 },
  play: async ({ canvasElement }) => {
    expect(control(canvasElement, 'Primera página')).toBeDisabled();
    expect(control(canvasElement, 'Página anterior')).toBeDisabled();
    expect(control(canvasElement, 'Página siguiente')).not.toBeDisabled();
    expect(control(canvasElement, 'Última página')).not.toBeDisabled();
  },
};

export const PaginaIntermedia: Story = {
  name: 'Página intermedia: los cuatro controles activos',
  args: { total: 248, page: 7, pageSize: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Página 7 de 25')).toBeInTheDocument();
    for (const titulo of ['Primera página', 'Página anterior', 'Página siguiente', 'Última página']) {
      expect(control(canvasElement, titulo)).not.toBeDisabled();
    }
  },
};

export const UltimaPagina: Story = {
  name: 'Última página: avanzar no lleva a ninguna parte',
  args: { total: 248, page: 25, pageSize: 10 },
  play: async ({ canvasElement }) => {
    expect(control(canvasElement, 'Primera página')).not.toBeDisabled();
    expect(control(canvasElement, 'Página anterior')).not.toBeDisabled();
    expect(control(canvasElement, 'Página siguiente')).toBeDisabled();
    expect(control(canvasElement, 'Última página')).toBeDisabled();
  },
};

export const UnaSolaPagina: Story = {
  name: 'Una sola página: los cuatro controles se apagan a la vez',
  args: { total: 6, page: 1, pageSize: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Página 1 de 1')).toBeInTheDocument();
    for (const titulo of ['Primera página', 'Página anterior', 'Página siguiente', 'Última página']) {
      expect(control(canvasElement, titulo)).toBeDisabled();
    }
  },
};

export const SinRegistros: Story = {
  name: 'Cero registros: sigue diciendo «Página 1 de 1»',
  args: { total: 0, page: 1, pageSize: 10 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /*
      El paginador no tiene estado vacio propio: `totalPages()` arranca en 1 por
      construccion. El «no hay nada» lo cuenta la tabla de arriba, no el pie.
    */
    expect(canvas.getByText('Total de registros: 0')).toBeInTheDocument();
    expect(canvas.getByText('Página 1 de 1')).toBeInTheDocument();
    for (const titulo of ['Primera página', 'Página anterior', 'Página siguiente', 'Última página']) {
      expect(control(canvasElement, titulo)).toBeDisabled();
    }
  },
};

export const VolumenAlto: Story = {
  name: 'Volumen alto: seis cifras de páginas sin romper la fila',
  args: { total: 1250000, page: 137845, pageSize: 5 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Página 137845 de 250000')).toBeInTheDocument();
    /*
      Ni el total ni el numero de pagina pasan por `DecimalPipe`: se interpolan
      crudos. A partir de cuatro cifras la lectura se resiente, y agrupar los
      millares exigiria tocar la plantilla del componente.
    */
    expect(canvas.getByText('Total de registros: 1250000')).toBeInTheDocument();
  },
};

export const OpcionesDelConsumidor: Story = {
  name: 'Tamaños del consumidor: la lista de 5·10·20·50 no es obligatoria',
  args: { total: 4800, page: 3, pageSize: 250, pageSizeOptions: [50, 250, 1000] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Página 3 de 20')).toBeInTheDocument();
    /*
      `pageSizeOptions` no tiene tope: 1000 registros por pagina se acepta igual
      que 5. Quien decide cuanto puede pedir la tabla es el consumidor.
    */
  },
};

export const SaltoDeTamanoDePagina: Story = {
  name: 'Salto de tamaño: cambia el número de páginas bajo los pies',
  render: () => ({
    template: `<app-story-data-pager-anfitrion />`,
  }),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('El recorrido avanza y el tramo mostrado lo acompaña', async () => {
      await userEvent.click(control(canvasElement, 'Página siguiente'));
      expect(canvas.getByText('pageChange → 2')).toBeInTheDocument();
      expect(canvas.getByText(/Mostrando 11–20 de 248/)).toBeInTheDocument();
    });

    await step('«Última» salta al final sin pasar por las 23 páginas intermedias', async () => {
      await userEvent.click(control(canvasElement, 'Última página'));
      expect(canvas.getByText('pageChange → 25')).toBeInTheDocument();
      expect(canvas.getByText(/Mostrando 241–248 de 248/)).toBeInTheDocument();
    });
  },
};

export const EnPantallaEstrecha: Story = {
  name: 'Pantalla de 320 px: el pie se apila en vez de encogerse',
  args: { total: 248, page: 7, pageSize: 10 },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  /*
    El corte esta en `@media (max-width: 40rem)`, que mira la VENTANA y no el
    contenedor: encerrar el paginador en una columna estrecha no lo apila, solo
    lo aprieta. Para verlo hay que estrechar el viewport, y por eso esta historia
    no lleva envoltorio.
  */
};
