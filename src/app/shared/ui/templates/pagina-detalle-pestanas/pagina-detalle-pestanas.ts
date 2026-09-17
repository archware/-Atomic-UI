import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { PageHeader } from '../../organisms/page-header/page-header';
import { TabsComponent, TabComponent } from '../../organisms/tabs/tabs.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { NgTemplateOutlet } from '@angular/common';
import type { PestanaDetalle } from '../modelos-crud';

/**
 * Chasis C — Página de detalle con pestañas.
 *
 * Para vistas que muestran el detalle de una entidad con secciones
 * organizadas por tabs (ej. detalle de crédito con cuotas, abonos,
 * historial; detalle de paciente con citas, estudios, recetas).
 *
 * El agente consumidor:
 *   1. Define las pestañas con PestanaDetalle[]
 *   2. Proyecta el contenido de cada pestaña por clave
 *   3. Opcionalmente proyecta una cabecera de resumen
 *
 * @ejemplo Uso por un agente:
 * ```html
 * <app-pagina-detalle-pestanas
 *   [titulo]="'Crédito ' + credito()?.numero"
 *   subtitulo="Detalle completo del crédito"
 *   [pestanas]="pestanas"
 *   (alVolver)="router.navigate(['/creditos'])"
 * >
 *   <!-- Resumen superior (opcional) -->
 *   <ng-template #resumen>
 *     <div class="resumen-credito">
 *       <app-kpi-card titulo="Saldo" [valor]="credito()?.saldo" />
 *       <app-kpi-card titulo="Cuotas" [valor]="credito()?.totalCuotas" />
 *     </div>
 *   </ng-template>
 *
 *   <!-- Contenido de cada pestaña por clave -->
 *   <ng-template #pestana let-clave>
 *     @switch (clave) {
 *       @case ('cuotas') {
 *         <app-data-table [columns]="columnasCuotas" [rows]="cuotas()" ... />
 *       }
 *       @case ('abonos') {
 *         <app-data-table [columns]="columnasAbonos" [rows]="abonos()" ... />
 *       }
 *       @case ('historial') {
 *         <app-timeline [items]="eventos()" />
 *       }
 *     }
 *   </ng-template>
 * </app-pagina-detalle-pestanas>
 * ```
 */
@Component({
  selector: 'app-pagina-detalle-pestanas',
  imports: [
    PageHeader,
    TabsComponent,
    TabComponent,
    ButtonComponent,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagina-detalle-pestanas.html',
  styleUrl: './pagina-detalle-pestanas.scss',
})
export class PaginaDetallePestanas {
  // ─── Configuración de la página ──────────────────────────────
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);
  readonly etiquetaVolver = input('Volver');
  readonly iconoVolver = input('fa-solid fa-arrow-left');
  readonly mostrarBotonVolver = input(true);

  // ─── Pestañas ────────────────────────────────────────────────
  readonly pestanas = input.required<readonly PestanaDetalle[]>();

  protected readonly defaultTabIndex = computed(() => {
    const pestanas = this.pestanas();
    const index = pestanas.findIndex((p) => p.activa);
    return index >= 0 ? index : 0;
  });

  // ─── Eventos ─────────────────────────────────────────────────
  /** Se emite al pulsar el botón "Volver". */
  readonly alVolver = output<void>();
  /** Se emite al cambiar de pestaña activa. */
  readonly alCambiarPestana = output<string>();

  // ─── Plantillas proyectadas ──────────────────────────────────
  /** Plantilla del resumen superior (KPIs, datos clave). */
  protected readonly resumen = contentChildren<TemplateRef<void>>('resumen');
  /** Plantilla de contenido de pestaña. Recibe la clave como contexto. */
  protected readonly contenidoPestana =
    contentChildren<TemplateRef<{ $implicit: string }>>('pestana');

  // ─── Contexto para las plantillas ────────────────────────────
  protected contextoPestana(clave: string): { $implicit: string } {
    return { $implicit: clave };
  }

  protected alSeleccionarPestana(indice: number): void {
    const pestanas = this.pestanas();
    if (indice >= 0 && indice < pestanas.length) {
      this.alCambiarPestana.emit(pestanas[indice].clave);
    }
  }
}
