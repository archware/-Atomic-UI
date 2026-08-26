import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { ChartComponent } from '../app/shared/ui/organisms/chart/chart.component';
import { DataTable } from '../app/shared/ui/organisms/data-table/data-table';
import type { DataTableColumn } from '../app/shared/ui/organisms/data-table/data-table';
import { LayoutShellComponent } from '../app/shared/ui/templates/layout-shell/layout-shell.component';
import { MetricsGridComponent } from '../app/shared/ui/organisms/metrics-grid/metrics-grid.component';
import type { KpiMetric } from '../app/shared/ui/organisms/metrics-grid/metrics-grid.component';
import { PanelComponent } from '../app/shared/ui/surfaces/panel/panel.component';
import { ProgressComponent } from '../app/shared/ui/atoms/progress/progress.component';
import type { ProgressVariant } from '../app/shared/ui/atoms/progress/progress.component';
import { SidebarComponent } from '../app/shared/ui/organisms/sidebar/sidebar.component';
import type {
  SidebarMenuItem,
  SidebarUser,
} from '../app/shared/ui/organisms/sidebar/sidebar.component';
import type { StatusBadgeStatus } from '../app/shared/ui/atoms/status-badge/status-badge.component';
import { TableAction } from '../app/shared/ui/atoms/table-action/table-action';
import { ThemeSwitcherComponent } from '../app/shared/ui/organisms/theme-switcher/theme-switcher.component';
import { TopbarComponent } from '../app/shared/ui/organisms/topbar/topbar.component';

/*
  PLANTILLA DE PANEL DE CONTROL: ENSAMBLAJE, NO COMPONENTES NUEVOS.

  Todo lo que se ve aqui existe ya en el catalogo. Lo unico que aporta esta
  historia es la DISPOSICION: que va arriba, que compite por el mismo alto y en
  que orden se lee. Por eso el unico CSS propio son huecos y rejilla; ningun
  color, ningun borde y ninguna tipografia se redefinen, porque eso es trabajo
  de los componentes y de los tokens, y redefinirlo aqui rompe el tema oscuro.
*/

const formateadorSoles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
});

/*
  EL COLOR DE LA GRAFICA SE LEE DEL TOKEN EN CADA PINTADO, NO SE ESCRIBE.

  Un `canvas` no interpreta `var(--primary-color)`: recibe una cadena de color
  ya resuelta. Si esa cadena se escribe a mano en el TypeScript, la grafica se
  queda con el color del tema claro cuando alguien cambia a oscuro, y es el
  unico elemento de la pantalla que no acompana al resto.

  Chart.js admite funciones donde admite colores, y las evalua en cada pintado.
  `ChartComponent` recrea el lienzo cuando cambia `data-theme`, asi que el token
  se vuelve a leer solo. No lleva valor de respaldo a proposito: un respaldo que
  se usa siempre es una mentira (capitulo 16 de la doctrina), y si el token
  faltara lo correcto es que se note, no que se disimule con un morado fijo.
*/
function colorDeToken(nombre: string): string {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
}

// `SidebarComponent.menuItems` publica un array mutable, no `readonly`: se
// declara igual para no forzar una copia solo por satisfacer al compilador.
const MENU: SidebarMenuItem[] = [
  { id: 'tablero', label: 'Panel de control', icon: 'fa-solid fa-chart-line', active: true },
  { id: 'caja', label: 'Caja', icon: 'fa-solid fa-cash-register', badge: 3 },
  { id: 'clientes', label: 'Clientes', icon: 'fa-solid fa-users' },
  {
    id: 'operaciones',
    label: 'Operaciones',
    icon: 'fa-solid fa-right-left',
    children: [
      { id: 'cobros', label: 'Cobros', icon: 'fa-solid fa-hand-holding-dollar' },
      { id: 'desembolsos', label: 'Desembolsos', icon: 'fa-solid fa-money-bill-transfer' },
    ],
  },
  { id: 'reportes', label: 'Reportes', icon: 'fa-solid fa-file-lines' },
  { id: 'catalogos', label: 'Catálogos', icon: 'fa-solid fa-list-check' },
];

const USUARIA: SidebarUser = {
  name: 'Juana Delgado',
  role: 'Jefa de agencia',
  initials: 'JD',
};

/*
  NINGUN INDICADOR TRAE TENDENCIA INVENTADA.

  `trend` solo se declara donde existe un periodo anterior con el que comparar;
  donde no lo hay se omite, que es distinto de pintar una flecha neutra. El
  capitulo 2 de la doctrina: la pantalla solo afirma lo que le consta.
*/
const INDICADORES: readonly KpiMetric[] = [
  {
    id: 'recaudado',
    title: 'Recaudado hoy',
    subtitle: 'Cierre parcial de las 16:00',
    value: 48250.4,
    format: 'currency',
    currency: 'PEN',
    iconClass: 'fa-solid fa-hand-holding-dollar',
    tone: 'success',
    trend: 'up',
    trendValue: '+6,4 %',
    comparisonLabel: 'frente al mismo día de la semana pasada',
    series: [31, 35, 34, 39, 42, 45, 48],
  },
  {
    id: 'operaciones',
    title: 'Operaciones',
    subtitle: 'Cobros y desembolsos registrados',
    value: 312,
    iconClass: 'fa-solid fa-receipt',
  },
  {
    id: 'mora',
    title: 'Cartera en mora',
    subtitle: 'Saldo con más de 30 días',
    value: 12680.75,
    format: 'currency',
    currency: 'PEN',
    iconClass: 'fa-solid fa-triangle-exclamation',
    tone: 'warning',
    trend: 'down',
    trendValue: '−2,1 %',
    comparisonLabel: 'frente al cierre del mes anterior',
  },
  {
    id: 'atencion',
    title: 'Tiempo medio de atención',
    subtitle: 'Ventanilla, medido por el turnero, en minutos',
    value: 14,
    format: 'duration',
    iconClass: 'fa-solid fa-stopwatch',
  },
];

interface ActividadFila {
  readonly id: string;
  readonly hora: string;
  readonly operacion: string;
  readonly cliente: string;
  readonly cajero: string;
  readonly importe: number;
  readonly estado: 'Aplicada' | 'En revisión' | 'Anulada';
}

const ESTADO_A_INSIGNIA: Readonly<Record<ActividadFila['estado'], StatusBadgeStatus>> = {
  Aplicada: 'active',
  'En revisión': 'degraded',
  Anulada: 'inactive',
};

const COLUMNAS_ACTIVIDAD: readonly DataTableColumn<ActividadFila>[] = [
  { key: 'hora', header: 'Hora', width: '6rem' },
  { key: 'operacion', header: 'Operación', width: '11rem' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'cajero', header: 'Cajero' },
  /*
    `align: 'end'` no es solo estetica: la hoja de `data-table` aplica
    `font-variant-numeric: tabular-nums` a las celdas alineadas al final, que es
    lo que mantiene los soles en columna y hace comparable una cifra con la de
    arriba sin leerla digito a digito.
  */
  {
    key: 'importe',
    header: 'Importe',
    align: 'end',
    width: '9rem',
    format: (valor) => formateadorSoles.format(Number(valor)),
  },
  {
    key: 'estado',
    header: 'Estado',
    width: '10rem',
    isBadge: true,
    badgeStatus: (fila) => ESTADO_A_INSIGNIA[fila.estado],
  },
];

const ACTIVIDAD: readonly ActividadFila[] = [
  {
    id: 'OP-4821',
    hora: '15:52',
    operacion: 'Cobro de cuota',
    cliente: 'Rosa Quispe Ayala',
    cajero: 'M. Huamán',
    importe: 320,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4820',
    hora: '15:41',
    operacion: 'Desembolso',
    cliente: 'Comercial Andina S.A.C.',
    cajero: 'L. Prado',
    importe: 8500,
    estado: 'En revisión',
  },
  {
    id: 'OP-4819',
    hora: '15:22',
    operacion: 'Cobro de cuota',
    cliente: 'Julio Ccahuana Rivas',
    cajero: 'M. Huamán',
    importe: 145.5,
    estado: 'Aplicada',
  },
  {
    id: 'OP-4818',
    hora: '14:58',
    operacion: 'Pago parcial',
    cliente: 'Elena Barrios Loayza',
    cajero: 'C. Vega',
    importe: 90,
    estado: 'Anulada',
  },
  {
    id: 'OP-4817',
    hora: '14:35',
    operacion: 'Cobro de cuota',
    cliente: 'Transportes Wari E.I.R.L.',
    cajero: 'L. Prado',
    importe: 1240.8,
    estado: 'Aplicada',
  },
];

interface AvanceDeMeta {
  readonly id: string;
  readonly etiqueta: string;
  readonly avance: number;
  readonly detalle: string;
}

const METAS: readonly AvanceDeMeta[] = [
  {
    id: 'colocacion',
    etiqueta: 'Colocación mensual',
    avance: 92,
    detalle: 'S/ 460 000 de S/ 500 000',
  },
  { id: 'recuperacion', etiqueta: 'Recuperación', avance: 74, detalle: 'S/ 148 000 de S/ 200 000' },
  { id: 'altas', etiqueta: 'Clientes nuevos', avance: 41, detalle: '37 de 90' },
];

@Component({
  selector: 'app-story-dashboard-completo',
  standalone: true,
  imports: [
    ChartComponent,
    DataTable,
    LayoutShellComponent,
    MetricsGridComponent,
    PanelComponent,
    ProgressComponent,
    SidebarComponent,
    TableAction,
    ThemeSwitcherComponent,
    TopbarComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-layout-shell
      [sidebarVisible]="menuVisible()"
      (closeSidebar)="menuVisible.set(false)"
      footerCompanyName="Atomic UI"
      footerVersion="v5.22.0"
      footerEnvironment="DEMO"
      footerCopyrightText="Plantilla de demostración."
    >
      <app-sidebar
        slot="sidebar"
        logoText="Atomic UI"
        [menuItems]="menu"
        [user]="usuaria"
      />

      <!--
        El conmutador de tema se proyecta DENTRO de la barra superior porque ese
        es el hueco que el organismo reserva para el. Sirve ademas para revisar
        la plantilla en claro y en oscuro sin salir de la historia.
      -->
      <app-topbar
        slot="topbar"
        title="Panel de control"
        userInitials="JD"
        userName="Juana Delgado"
        userEmail="jdelgado@ejemplo.pe"
        userRole="Jefa de agencia"
        [notificationCount]="3"
        [showLanguageSwitcher]="false"
        (toggleSidebar)="menuVisible.set(!menuVisible())"
      >
        <app-theme-switcher />
      </app-topbar>

      <!--
        La barra superior ya emite el <h1> de la pantalla, asi que aqui se
        empieza en <h2> y no se salta ningun nivel: es el indice de quien navega
        por encabezados (capitulo 13 de la doctrina).
      -->
      <div class="tablero">
        <section class="tablero__bloque" aria-labelledby="tablero-resumen">
          <h2 class="tablero__titulo" id="tablero-resumen">Resumen del día</h2>
          <app-metrics-grid [metrics]="indicadores" ariaLabel="Indicadores del día" />
        </section>

        <div class="tablero__columnas">
          <section class="tablero__bloque" aria-labelledby="tablero-grafica">
            <h2 class="tablero__titulo" id="tablero-grafica">Recaudación de la semana</h2>
            <app-panel variant="elevated" [showHeader]="false">
              <p class="tablero__nota">
                Importes confirmados por caja. La barra de hoy corresponde al cierre parcial de
                las 16:00 y todavía puede subir.
              </p>
              <app-chart
                type="bar"
                height="17rem"
                [data]="datosRecaudacion"
                [options]="opcionesRecaudacion"
              />
            </app-panel>
          </section>

          <section class="tablero__bloque" aria-labelledby="tablero-metas">
            <h2 class="tablero__titulo" id="tablero-metas">Avance de metas</h2>
            <app-panel variant="elevated" [showHeader]="false">
              <ul class="tablero__metas">
                @for (meta of metas; track meta.id) {
                  <li class="tablero__meta">
                    <app-progress
                      [value]="meta.avance"
                      [label]="meta.etiqueta"
                      [variant]="tonoDeAvance(meta.avance)"
                      [showLabel]="true"
                    />
                    <p class="tablero__meta-detalle tablero__cifra">{{ meta.detalle }}</p>
                  </li>
                }
              </ul>
            </app-panel>
          </section>
        </div>

        <section class="tablero__bloque" aria-labelledby="tablero-actividad">
          <h2 class="tablero__titulo" id="tablero-actividad">Actividad reciente</h2>
          <app-panel variant="elevated" padding="sm" [showHeader]="false">
            <app-data-table
              caption="Últimas operaciones registradas en la agencia"
              density="compact"
              pagination="none"
              actionsWidth="7rem"
              [columns]="columnasActividad"
              [rows]="actividad"
              [showRowNumber]="false"
              [trackBy]="identificarActividad"
            >
              <!--
                Las acciones de fila comparten ancho con las columnas de datos:
                van como icono con nombre accesible, nunca como botones
                etiquetados (capitulo 15 de la doctrina).
              -->
              <ng-template #actions>
                <app-table-action action="view" size="sm" label="Ver detalle de la operación" />
                <app-table-action action="print" size="sm" label="Imprimir comprobante" />
              </ng-template>
            </app-data-table>
          </app-panel>
        </section>
      </div>
    </app-layout-shell>
  `,
  styles: [
    `
      /*
        El anfitrion de una historia es un elemento a medida y por omision es
        «inline»: sin esto, la plantilla no ocupa el ancho del lienzo y lo que se
        revisa no es la disposicion real.
      */
      :host {
        display: block;
      }

      .tablero {
        display: flex;
        flex-direction: column;
        gap: var(--space-7);
      }

      .tablero__bloque {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
        min-width: 0;
      }

      .tablero__titulo {
        margin: 0;
        font-size: var(--text-lg);
        font-weight: var(--font-weight-title);
      }

      /*
        La grafica pide mas ancho que la lista de metas, y por debajo de 64rem
        dejan de competir: cada una ocupa la fila entera. El corte va en rem
        para que acompane a quien agranda la letra del navegador.
      */
      .tablero__columnas {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: var(--space-6);
        align-items: start;
      }

      @media (max-width: 64rem) {
        .tablero__columnas {
          grid-template-columns: 1fr;
        }
      }

      .tablero__nota {
        margin: 0 0 var(--space-4);
        font-size: var(--text-sm);
      }

      .tablero__metas {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .tablero__meta {
        display: flex;
        flex-direction: column;
        gap: var(--space-1);
      }

      .tablero__meta-detalle {
        margin: 0;
        font-size: var(--text-sm);
      }

      /*
        Las cifras se escriben con cifras de ancho fijo: apiladas una sobre otra,
        es lo que permite comparar dos importes de un vistazo en vez de leerlos.
      */
      .tablero__cifra {
        font-variant-numeric: tabular-nums;
      }
    `,
  ],
})
class DashboardCompletoStory {
  protected readonly menuVisible = signal(true);

  protected readonly menu = MENU;
  protected readonly usuaria = USUARIA;
  protected readonly indicadores = INDICADORES;
  protected readonly metas = METAS;
  protected readonly actividad = ACTIVIDAD;
  protected readonly columnasActividad = COLUMNAS_ACTIVIDAD;

  protected readonly identificarActividad = (_indice: number, fila: ActividadFila): string =>
    fila.id;

  protected readonly datosRecaudacion = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Hoy'],
    datasets: [
      {
        label: 'Recaudado',
        data: [31200, 35400, 34100, 39800, 42300, 45100, 48250],
        backgroundColor: () => colorDeToken('--primary-color'),
        barPercentage: 0.6,
      },
    ],
  };

  protected readonly opcionesRecaudacion = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      /*
        Las etiquetas sobre la barra las pinta un complemento global con un
        color fijo pensado para rellenos oscuros. Sobre estas barras estorban y
        compiten con el eje, que ya dice la cifra; se apagan aqui.
      */
      datalabels: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: () => colorDeToken('--text-color-secondary') },
      },
      y: {
        beginAtZero: true,
        grid: { color: () => colorDeToken('--border-color') },
        ticks: { color: () => colorDeToken('--text-color-secondary') },
      },
    },
  };

  /*
    EL COLOR CODIFICA UN ESTADO FRENTE A UN UMBRAL, NO LA CATEGORIA DEL DATO.

    Las tres metas son la misma clase de dato; lo que las distingue es como van
    respecto de lo comprometido. Por eso el tono sale del avance y no del nombre
    de la meta: verde a partir del 85 %, aviso por debajo del 50 %, y neutro en
    medio, que es donde todavia no hay veredicto.
  */
  protected tonoDeAvance(avance: number): ProgressVariant {
    if (avance >= 85) return 'success';
    if (avance < 50) return 'warning';
    return 'primary';
  }
}

const meta: Meta<DashboardCompletoStory> = {
  title: '5. Templates/Dashboard Completo',
  component: DashboardCompletoStory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Pantalla completa de panel de control ensamblada **solo** con piezas del catálogo:
\`LayoutShell\` + \`Sidebar\` + \`Topbar\` para el chasis, \`MetricsGrid\` para el
resumen, \`Chart\` para la evolución, \`Progress\` para el avance de metas y
\`DataTable\` para la actividad reciente.

Tres decisiones que conviene copiar:

1. **La barra superior ya emite el \`<h1>\`.** El contenido empieza en \`<h2>\` y no
   salta niveles, que es el índice de quien navega por encabezados.
2. **La gráfica lee sus colores del token en cada pintado.** Un lienzo no
   interpreta \`var(...)\`; con una función en lugar de una cadena, el color
   acompaña al cambio de tema en vez de quedarse en el del tema claro.
3. **Las cifras van con \`tabular-nums\`.** Lo traen ya \`KpiCard\` y las columnas
   alineadas al final de \`DataTable\`; el resto se marca explícitamente.
        `,
      },
    },
  },
  decorators: [moduleMetadata({ imports: [DashboardCompletoStory] })],
};

export default meta;
type Story = StoryObj<DashboardCompletoStory>;

export const Completo: Story = {
  name: 'Panel de control',
  render: () => ({ template: `<app-story-dashboard-completo />` }),
};
