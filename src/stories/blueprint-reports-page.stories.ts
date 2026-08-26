import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, signal } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReportsPageComponent } from '../blueprints/reports-page/reports-page.component';

/*
QUE DOCUMENTA ESTE FICHERO

ReportsPageComponent tampoco declara entradas: la lista es el campo publico
`reports` y la navegacion son `menuItems` y la senal `sidebarVisible`. Las
historias sustituyen esos campos en la instancia -Storybook asigna a la instancia
toda propiedad de `props` que no sea una entrada declarada- para llevar la pagina
a un estado concreto. Es un doble, no una API.

Dos cosas que la pagina no sabe hacer y que se ven aqui: no tiene estado de carga
ni de error (el armazon se pinta siempre), y su lista vacia es un panel en blanco
sin mensaje. Ninguna de las dos se arregla desde una historia.
*/

interface ReporteDemo {
  id: number;
  name: string;
  date: string;
  size: string;
}

const NOMBRES_DE_REPORTE = [
  'Cierre financiero',
  'Metricas de adquisicion',
  'Auditoria de personal',
  'Conciliacion bancaria',
  'Inventario valorizado',
  'Rotacion de clientes',
];

/** Lista larga y estable: mismos datos en cada render, para que la historia no parpadee. */
function reportesEnVolumen(cantidad: number): ReporteDemo[] {
  const reportes: ReporteDemo[] = [];
  for (let indice = 0; indice < cantidad; indice += 1) {
    const dia = String((indice % 28) + 1).padStart(2, '0');
    reportes.push({
      id: indice + 1,
      name: NOMBRES_DE_REPORTE[indice % NOMBRES_DE_REPORTE.length] + ' ' + String(indice + 1).padStart(3, '0'),
      date: dia + ' Jun 2026',
      size: (1 + ((indice * 7) % 90) / 10).toFixed(1) + ' MB',
    });
  }
  return reportes;
}

const meta: Meta<ReportsPageComponent> = {
  title: '5. Blueprints/Reports Page',
  component: ReportsPageComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideRouter([{ path: '**', children: [] }]),
        importProvidersFrom(BrowserAnimationsModule),
      ],
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Blueprint de reportes

Listado de documentos generados dentro de \`LayoutShell\`: \`Sidebar\`,
\`Topbar\`, una cabecera con la accion principal y un \`Panel\` con una fila por
reporte -icono, nombre, fecha, tamano y su accion de descarga-.

### Que ejercitan estas historias

La clase **no declara entradas**. La lista es el campo publico \`reports\`, el
menu es \`menuItems\` y la navegacion se abre y cierra con la senal
\`sidebarVisible\`. Las historias sustituyen esos campos: es un **doble**
declarado, no una API de entrada.

### Lo que la pagina todavia no resuelve

- **Vacio sin mensaje.** Con \`reports\` a cero el panel queda en blanco: no dice
  que no hay reportes ni ofrece generarlos. Se ve en *Sin reportes generados*.
- **Sin carga ni error.** No existe \`loading\` ni \`error\`; mientras la respuesta
  viaja se ve el mismo panel en blanco del caso anterior.
- **Acciones sin cablear.** \`Nuevo Reporte\` y \`Descargar\` no tienen manejador
  en el blueprint: se pintan y no hacen nada hasta que el consumidor los conecta.

### Uso

Copia \`src/blueprints/reports-page\` a tu proyecto, cambia \`reports\` por la
respuesta de tu API y conecta las dos acciones antes de publicarla.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ReportsPageComponent>;

export const ConReportes: Story = {
  name: 'Listado con reportes disponibles',
  parameters: {
    docs: {
      description: {
        story:
          'Estado nominal del blueprint recien copiado: tres reportes con nombre, fecha, tamano y ' +
          'su accion de descarga. Cada fila usa tokens de superficie y borde, de modo que la ' +
          'misma lista se lee igual en claro y en oscuro.',
      },
    },
  },
  render: () => ({
    template: '<app-reports-page></app-reports-page>',
  }),
};

export const SinReportesGenerados: Story = {
  name: 'Sin reportes generados: el panel se queda mudo',
  parameters: {
    docs: {
      description: {
        story:
          'La lista llega vacia. El panel conserva su titulo y deja el cuerpo en blanco: no hay ' +
          'mensaje que diga que todavia no se ha generado ninguno, ni una llamada a la accion que ' +
          'lleve a crear el primero. Es tambien lo que ve el usuario mientras la peticion viaja, ' +
          'porque la pagina no distingue vacio de cargando. Antes de adoptar el blueprint, este ' +
          'es el hueco que hay que rellenar.',
      },
    },
  },
  render: () => ({
    props: {
      reports: [],
    },
    template: '<app-reports-page></app-reports-page>',
  }),
};

export const VolumenDeReportes: Story = {
  name: 'Volumen: cuarenta reportes en una sola pagina',
  parameters: {
    docs: {
      description: {
        story:
          'Cuarenta filas seguidas. No hay paginacion, ni buscador, ni orden: el blueprint apila ' +
          'todo lo que reciba y delega el desplazamiento en el area de contenido del LayoutShell. ' +
          'Con esta historia delante se decide si el consumidor necesita paginar antes de conectar ' +
          'su API.',
      },
    },
  },
  render: () => ({
    props: {
      reports: reportesEnVolumen(40),
    },
    template: '<app-reports-page></app-reports-page>',
  }),
};

export const NombresQueNoCaben: Story = {
  name: 'Nombres largos y tamanos inusuales',
  parameters: {
    docs: {
      description: {
        story:
          'Nombres de archivo que nadie preve al maquetar: un titulo de setenta caracteres, una ' +
          'referencia sin espacios y un tamano de tres cifras. La fila crece en alto y la accion ' +
          'de descarga se mantiene a la derecha, pero conviene comprobarlo en pantalla estrecha ' +
          'antes de dar por buena la maqueta.',
      },
    },
  },
  render: () => ({
    props: {
      reports: [
        {
          id: 1,
          name: 'Cierre financiero consolidado del segundo trimestre con anexos de conciliacion',
          date: 'Ayer, 14:30',
          size: '128.6 MB',
        },
        {
          id: 2,
          name: 'REP-2026-000042-AUDITORIA-DE-PERSONAL-CONSOLIDADA-SEDES-NORTE-Y-SUR',
          date: '10 Jun 2026',
          size: '0.2 MB',
        },
        { id: 3, name: 'Resumen', date: '05 Jun 2026', size: '4.8 MB' },
      ],
    },
    template: '<app-reports-page></app-reports-page>',
  }),
};

export const NavegacionReplegada: Story = {
  name: 'Listado a ancho completo con la navegacion replegada',
  parameters: {
    docs: {
      description: {
        story:
          'sidebarVisible arranca en false: el estado al que llega la pagina al pulsar el boton de ' +
          'menu del Topbar, y el que muestra el LayoutShell en pantalla estrecha. Las filas ganan ' +
          'todo el ancho y la accion de descarga se aleja del nombre; merece una mirada porque es ' +
          'la vista que mas se usa en tableta.',
      },
    },
  },
  render: () => ({
    props: {
      sidebarVisible: signal(false),
    },
    template: '<app-reports-page></app-reports-page>',
  }),
};
