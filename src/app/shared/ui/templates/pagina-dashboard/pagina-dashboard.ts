import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from '../../organisms/page-header/page-header';
import { MetricsGridComponent, KpiMetric } from '../../organisms/metrics-grid/metrics-grid.component';
import { DataStateComponent } from '../../molecules/data-state/data-state.component';
import { ApiError } from '../../services/api.service';

/**
 * CHASIS D: Plantilla tonta para construir Dashboards de Inicio y Monitoreo.
 * Encapsula la directiva de Page Header, el estado de carga (Data State) y
 * proyecta las tarjetas KPI automáticamente usando Metrics Grid.
 */
@Component({
  selector: 'app-pagina-dashboard',
  standalone: true,
  imports: [CommonModule, PageHeader, MetricsGridComponent, DataStateComponent],
  templateUrl: './pagina-dashboard.html',
  styleUrl: './pagina-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginaDashboardComponent {
  // Identidad
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);
  readonly eyebrow = input<string | null>(null);

  // Datos del Dashboard
  readonly metricas = input<readonly KpiMetric[]>([]);

  // Estados de Operación (Data State)
  readonly cargando = input(false);
  readonly error = input<ApiError | null>(null);
  readonly vacio = input(false);
  readonly textoVacio = input('No hay datos suficientes para mostrar el dashboard.');

  // Eventos
  readonly alReintentar = input({ emit: () => { } });
}
