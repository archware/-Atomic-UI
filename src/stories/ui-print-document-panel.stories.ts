import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { ChangeDetectionStrategy, Component, computed, input, signal, viewChild } from '@angular/core';

import { ButtonComponent } from '../app/shared/ui/atoms/button/button.component';
import {
  PrintDocumentPanel,
  type PrintDocumentPage,
} from '../app/shared/ui/organisms/print-document-panel/print-document-panel';

/*
  EL PANEL NO ES EL DOCUMENTO: ES SU ANTESALA.

  `PrintDocumentPanel` hace dos cosas distintas con los mismos datos y conviene
  no confundirlas, porque el catalogo no lo aclaraba en ningun sitio:

  - EN PANTALLA pinta una ficha por documento con sus campos, sus parrafos, sus
    firmas y su pie. De las tablas NO pinta la tabla: pinta una linea de resumen
    -«Detalle de cuotas · 24 registro(s)»-. Quien espere ver la rejilla aqui la
    busca en vano.
  - AL IMPRIMIR abre una ventana aislada, le copia seis tokens
    (`--print-document-paper-*`, `--print-document-accent-color`…), le inyecta su
    propia hoja A4 y ahi si dibuja la tabla entera. El documento impreso se
    construye con `textContent`, nunca con HTML interpolado.

  `print()` DEVUELVE UN BOOLEANO Y HAY QUE MIRARLO. Devuelve `false` sin
  documentos y `false` si el navegador bloquea la ventana emergente. Un boton
  que llama a `print()` y no comprueba el resultado deja al usuario esperando una
  ventana que nunca llegara; por eso el anfitrion de estas historias escribe
  debajo lo que devolvio la llamada.

  NINGUNA FUNCION `play` PULSA «Imprimir» A PROPOSITO: abriria una ventana y el
  dialogo de impresion real del navegador, y dejaria colgada la comprobacion. El
  boton esta para que lo pulse una persona.

  Y una ausencia que conviene dejar escrita: SIN DOCUMENTOS EL PANEL NO DICE
  NADA. Pinta su cabecera y una rejilla vacia. No hay entrada `emptyMessage` ni
  texto por omision; el hueco esta en el componente, no en estas historias.
*/

const ACTA_CORTA: PrintDocumentPage = {
  id: 'acta-entrega',
  eyebrow: 'Sede Ayacucho centro',
  title: 'Acta de entrega de equipo',
  subtitle: 'Documento interno · no válido como comprobante de pago',
  fields: [
    { id: 'numero', label: 'Número', value: 'ACT-2026-0148' },
    { id: 'fecha', label: 'Fecha', value: '26/08/2026' },
    { id: 'responsable', label: 'Responsable', value: 'Rosa Quispe Ayala' },
    { id: 'area', label: 'Área', value: 'Cobranzas de campo' },
  ],
  sections: [
    {
      id: 'condiciones',
      heading: 'Condiciones de uso',
      paragraphs: [
        'El equipo se entrega operativo y con la batería al 100 %. Cualquier avería debe reportarse el mismo día a soporte.',
        'La devolución se realiza en la sede de origen dentro de los cinco días hábiles siguientes al término de la asignación.',
      ],
    },
  ],
  signatures: ['Entrega · Almacén', 'Recibe · Responsable'],
  footer: 'Generado desde el módulo de activos. Conserve una copia firmada.',
};

const PAQUETE_DE_CIERRE: readonly PrintDocumentPage[] = [
  {
    id: 'resumen',
    eyebrow: 'Cierre diario',
    title: 'Resumen de caja',
    subtitle: 'Turno de tarde · 14:00 a 22:00',
    fields: [
      { id: 'apertura', label: 'Apertura', value: 'S/ 500.00' },
      { id: 'ingresos', label: 'Ingresos', value: 'S/ 12 480.50' },
      { id: 'egresos', label: 'Egresos', value: 'S/ 1 240.00' },
      { id: 'saldo', label: 'Saldo declarado', value: 'S/ 11 740.50' },
    ],
    footer: 'Documento 1 de 3.',
  },
  {
    id: 'arqueo',
    eyebrow: 'Cierre diario',
    title: 'Arqueo de denominaciones',
    fields: [
      { id: 'billetes', label: 'Billetes', value: '112 unidades' },
      { id: 'monedas', label: 'Monedas', value: '340 unidades' },
    ],
    sections: [
      {
        id: 'detalle',
        heading: 'Detalle contado',
        table: {
          caption: 'Denominaciones contadas',
          columns: [
            { key: 'denominacion', label: 'Denominación' },
            { key: 'cantidad', label: 'Cantidad', align: 'end' },
            { key: 'subtotal', label: 'Subtotal', align: 'end' },
          ],
          rows: [
            { denominacion: 'S/ 200', cantidad: '12', subtotal: 'S/ 2 400.00' },
            { denominacion: 'S/ 100', cantidad: '48', subtotal: 'S/ 4 800.00' },
            { denominacion: 'S/ 50', cantidad: '52', subtotal: 'S/ 2 600.00' },
          ],
        },
      },
    ],
    footer: 'Documento 2 de 3.',
  },
  {
    id: 'conformidad',
    eyebrow: 'Cierre diario',
    title: 'Acta de conformidad',
    subtitle: 'Firmada por cajero y supervisor',
    signatures: ['Cajero', 'Supervisor'],
    footer: 'Documento 3 de 3.',
  },
];

const FILAS_DE_CUOTAS = Array.from({ length: 24 }, (_, indice) => ({
  cuota: String(indice + 1).padStart(2, '0'),
  vencimiento: `${String((indice % 28) + 1).padStart(2, '0')}/09/2026`,
  capital: `S/ ${(1250.4 + indice * 12.35).toFixed(2)}`,
  interes: `S/ ${(84.2 - indice * 1.7).toFixed(2)}`,
}));

const EXPEDIENTE_LARGO: PrintDocumentPage = {
  id: 'expediente',
  eyebrow: 'Expediente de crédito',
  title: 'Contrato de préstamo con garantía mobiliaria',
  subtitle:
    'Doce cláusulas, cronograma de veinticuatro cuotas y anexo de garantías. Es el caso que obliga a mirar cómo se comporta el panel cuando el contenido no cabe.',
  fields: [
    { id: 'expediente', label: 'Expediente', value: 'EXP-2026-000148-AYA' },
    { id: 'cliente', label: 'Cliente', value: 'Comercial Andina S.A.C.' },
    { id: 'ruc', label: 'RUC', value: '20558741023' },
    { id: 'monto', label: 'Monto aprobado', value: 'S/ 48 250.40' },
    { id: 'tasa', label: 'TCEA', value: '38,42 % anual' },
    {
      id: 'huella',
      label: 'Huella del documento',
      value: '9f2b7c14ae0d4c6f8b1e35a97d02c48fbb6d1e77a3049c25e8f60d13b4a7c9e0',
    },
  ],
  sections: [
    {
      id: 'objeto',
      heading: 'Primera · Objeto del contrato',
      paragraphs: [
        'El prestamista entrega al prestatario la suma aprobada, que este declara recibir a su entera satisfacción, obligándose a devolverla en las condiciones y plazos que constan en el cronograma anexo.',
        'El destino declarado del crédito es capital de trabajo. El cambio de destino sin comunicación previa faculta al prestamista a resolver el contrato conforme a la cláusula décima.',
      ],
    },
    {
      id: 'garantia',
      heading: 'Segunda · Garantía mobiliaria',
      paragraphs: [
        'La garantía recae sobre los bienes descritos en el anexo de garantías, que el prestatario declara libres de gravamen y de propiedad exclusiva.',
      ],
      fields: [
        { id: 'bien', label: 'Bien afectado', value: 'Montacargas eléctrico serie 4471-B' },
        { id: 'tasacion', label: 'Tasación', value: 'S/ 62 000.00' },
      ],
    },
    {
      id: 'cronograma',
      heading: 'Tercera · Cronograma de pagos',
      paragraphs: [
        'El cronograma completo se imprime en el documento final. En pantalla el panel sólo declara cuántos registros contiene: la rejilla es contenido de papel, no de previsualización.',
      ],
      table: {
        caption: 'Detalle de cuotas',
        columns: [
          { key: 'cuota', label: 'Cuota' },
          { key: 'vencimiento', label: 'Vencimiento', align: 'center' },
          { key: 'capital', label: 'Capital', align: 'end' },
          { key: 'interes', label: 'Interés', align: 'end' },
        ],
        rows: FILAS_DE_CUOTAS,
      },
    },
    {
      id: 'mora',
      heading: 'Cuarta · Mora',
      paragraphs: [
        'El retraso en el pago de cualquier cuota genera interés moratorio desde el día siguiente al vencimiento, sin necesidad de requerimiento previo.',
        'Transcurridos treinta días de atraso, el prestamista podrá dar por vencidos todos los plazos y exigir el íntegro de la deuda.',
      ],
    },
    {
      id: 'domicilio',
      heading: 'Quinta · Domicilio y notificaciones',
      paragraphs: [
        'Las partes señalan como domicilio los consignados en la introducción. Toda variación surte efecto a los tres días hábiles de comunicada por escrito.',
      ],
    },
  ],
  signatures: ['El prestamista', 'El prestatario', 'Testigo', 'Fedatario'],
  footer: 'Expediente EXP-2026-000148-AYA · página única de previsualización · 24 cuotas anexas.',
};

let secuenciaAnfitrion = 0;

/** Anfitrion: proyecta las acciones y ensena lo que devuelve `print()`. */
@Component({
  selector: 'app-story-print-document-panel',
  standalone: true,
  imports: [ButtonComponent, PrintDocumentPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="anfitrion">
      <app-print-document-panel
        [title]="titulo()"
        [subtitle]="subtitulo()"
        [ariaLabel]="etiqueta()"
        [titleId]="idEfectivo()"
        [documents]="documentos()"
      >
        <div print-document-actions>
          <app-button variant="outline" (buttonClick)="explicar()">Ver qué se imprime</app-button>
          <app-button variant="primary" (buttonClick)="imprimir()">Imprimir</app-button>
        </div>
      </app-print-document-panel>

      <p class="anfitrion__rastro" role="status">{{ rastro() }}</p>
    </div>
  `,
  styles: [
    `
      .anfitrion {
        display: grid;
        gap: var(--space-3);
      }

      .anfitrion__rastro {
        margin: 0;
        min-height: var(--space-5);
        color: var(--text-color-muted);
        font-size: var(--text-sm);
      }
    `,
  ],
})
class PrintDocumentPanelStory {
  private readonly idGenerado = `print-document-panel-story-${++secuenciaAnfitrion}`;

  readonly titulo = input('Documentos');
  readonly subtitulo = input('');
  readonly etiqueta = input<string | null>(null);
  readonly idTitulo = input('');
  readonly documentos = input<readonly PrintDocumentPage[]>([]);

  private readonly panel = viewChild.required(PrintDocumentPanel);

  protected readonly idEfectivo = computed(() => this.idTitulo() || this.idGenerado);
  protected readonly rastro = signal(
    'Pulse «Imprimir» para abrir la ventana aislada. El resultado de print() se escribe aquí.',
  );

  protected imprimir(): void {
    const abierta = this.panel().print();
    this.rastro.set(
      abierta
        ? 'print() devolvió true: la ventana aislada se abrió con el documento A4.'
        : 'print() devolvió false: no hay documentos, o el navegador bloqueó la ventana emergente. Un botón que ignore este booleano deja esperando a quien lo pulsó.',
    );
  }

  protected explicar(): void {
    const paginas = this.documentos().length;
    const tablas = this.documentos().reduce(
      (cuenta, pagina) =>
        cuenta + (pagina.sections ?? []).filter((seccion) => seccion.table).length,
      0,
    );
    this.rastro.set(
      `Se imprimirían ${paginas} página(s) A4 y ${tablas} tabla(s) completa(s), que en pantalla sólo aparecen resumidas.`,
    );
  }
}

const meta: Meta<PrintDocumentPanel> = {
  title: '3. Organisms/PrintDocumentPanel',
  component: PrintDocumentPanel,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [PrintDocumentPanelStory],
    }),
  ],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    ariaLabel: { control: 'text' },
    titleId: { control: 'text' },
    documents: { control: 'object' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Previsualización de un paquete de documentos A4 y su envío a impresión. En pantalla ' +
          'las tablas aparecen resumidas; completas sólo en el papel.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<PrintDocumentPanel>;

export const DocumentoCorto: Story = {
  name: 'Contenido corto: una ficha que cabe entera',
  render: () => ({
    props: { documentos: [ACTA_CORTA] },
    template: `
      <app-story-print-document-panel
        titulo="Acta de entrega"
        subtitulo="Un documento listo para firmar."
        [documentos]="documentos"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('region', { name: 'Acta de entrega' })).toBeInTheDocument();
    expect(canvas.getByText('Acta de entrega de equipo')).toBeInTheDocument();
    expect(canvas.getByText('ACT-2026-0148')).toBeInTheDocument();
  },
};

export const PaqueteDeVariosDocumentos: Story = {
  name: 'Paquete de tres: la rejilla reparte, no apila',
  render: () => ({
    props: { documentos: PAQUETE_DE_CIERRE },
    template: `
      <app-story-print-document-panel
        titulo="Cierre de caja del 26/08/2026"
        subtitulo="Tres documentos salen en una sola impresión, uno por página."
        [documentos]="documentos"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Resumen de caja')).toBeInTheDocument();
    expect(canvas.getByText('Arqueo de denominaciones')).toBeInTheDocument();
    expect(canvas.getByText('Acta de conformidad')).toBeInTheDocument();
    /* La tabla del arqueo se resume; la rejilla es contenido de papel. */
    expect(canvas.getByText(/Denominaciones contadas · 3 registro\(s\)/)).toBeInTheDocument();
  },
};

export const ContenidoLargoQueDesborda: Story = {
  name: 'Contenido largo: crece sin límite y el consumidor lo contiene',
  render: () => ({
    props: { documentos: [EXPEDIENTE_LARGO] },
    template: `
      <div style="max-width: 26rem; max-height: 32rem; overflow: auto;">
        <app-story-print-document-panel
          titulo="Expediente EXP-2026-000148-AYA"
          subtitulo="Cinco cláusulas, veinticuatro cuotas y una huella de 64 caracteres."
          [documentos]="documentos"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /*
      El panel NO tiene altura maxima ni desplazamiento propio: crece con el
      contenido. Quien lo monta decide donde acaba, y por eso esta historia lo
      encierra en una caja de 26 × 32 rem. Sin ese envoltorio, el expediente
      empuja la pagina entera.
    */
    expect(canvas.getByText(/Detalle de cuotas · 24 registro\(s\)/)).toBeInTheDocument();
    /* El valor sin espacios parte igual gracias a `overflow-wrap: anywhere` en el `dd`. */
    expect(
      canvas.getByText('9f2b7c14ae0d4c6f8b1e35a97d02c48fbb6d1e77a3049c25e8f60d13b4a7c9e0'),
    ).toBeInTheDocument();
  },
};

export const SinDocumentos: Story = {
  name: 'Sin documentos: el panel calla y print() devuelve false',
  render: () => ({
    props: { documentos: [] },
    template: `
      <app-story-print-document-panel
        titulo="Documentos del expediente"
        subtitulo="Todavía no se generó ninguno."
        [documentos]="documentos"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', { name: 'Documentos del expediente' });
    /*
      Aqui esta el hueco: la region existe, tiene titulo y subtitulo, y por dentro
      no hay ni un aviso. El «no hay nada que imprimir» lo pone hoy el subtitulo
      del consumidor, no el componente. Cerrarlo pide una entrada nueva.
    */
    expect(region).toBeInTheDocument();
    expect(canvas.queryByRole('article')).not.toBeInTheDocument();
    expect(canvas.getByRole('button', { name: 'Imprimir' })).toBeInTheDocument();
  },
};

export const EtiquetaAccesibleExplicita: Story = {
  name: 'Nombre accesible propio: ariaLabel manda sobre el título',
  render: () => ({
    props: { documentos: [ACTA_CORTA] },
    template: `
      <app-story-print-document-panel
        titulo="Documentos"
        subtitulo="El encabezado dice «Documentos», pero la región se anuncia con su propio nombre."
        etiqueta="Actas pendientes de firma del expediente 000148"
        idTitulo="print-document-panel-historia-etiqueta"
        [documentos]="documentos"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    /*
      `ariaLabel` y `titleId` no se suman: la plantilla pone `aria-labelledby`
      SOLO cuando no hay `ariaLabel`. Con etiqueta explicita, el `titleId` sigue
      identificando al `<h2>` pero ya no da nombre a la region.
    */
    expect(
      canvas.getByRole('region', { name: 'Actas pendientes de firma del expediente 000148' }),
    ).toBeInTheDocument();
    expect(canvas.queryByRole('region', { name: 'Documentos' })).not.toBeInTheDocument();
    expect(canvas.getByRole('heading', { name: 'Documentos', level: 2 })).toHaveAttribute(
      'id',
      'print-document-panel-historia-etiqueta',
    );
  },
};
