# Responsive Component Audit - Atomic UI

## Alcance

Auditoria de componentes base y blueprints con foco en dashboards.

- Layout y navegacion: LayoutShell, Topbar, Sidebar, Row.
- Blueprint: dashboard-page.
- Componentes de indicadores: KpiCard y MetricsGrid.

Fecha: 2026-05-27

## Hallazgos principales

### Alta prioridad

1. Dashboard con tarjetas estadisticas en markup ad-hoc.

- Impacto: baja reutilizacion y deuda de mantenimiento para nuevos dashboards.
- Estado: resuelto en esta iteracion.
- Accion aplicada: reemplazo por MetricsGrid y KpiCard con dataset declarativo.

1. Padding global de contenido alto en mobile.

- Impacto: se reduce el area util en pantallas pequenas.
- Estado: resuelto en esta iteracion.
- Accion aplicada: padding responsivo en LayoutShell por breakpoints.

### Prioridad media

1. Topbar con riesgo de colision horizontal en anchos muy pequenos.

- Impacto: truncado agresivo y controles superpuestos.
- Estado: mitigado.
- Accion aplicada: ocultar language switcher bajo 560px y ajustar max-width de titulo.

1. Sidebar con riesgo de overflow en labels largos y badges.

- Impacto: texto recortado y alineacion inconsistente.
- Estado: mitigado.
- Accion aplicada: estilos de nav-label y nav-badge para truncado seguro y badge fijo.

### Prioridad baja

1. Warnings NG8113 por imports no usados en algunos componentes.

- Impacto: ruido en CI y reportes de build.
- Estado: pendiente.
- Siguiente accion: limpieza de imports en app.ts y forgot-password-page.component.ts.

## Gap de componentes para dashboards de indicadores

Se identificaron y consolidaron componentes para estadisticas.

1. KpiCard (molecule)

- Soporta formatos: number, currency, percent, compact, duration.
- Soporta tendencia: up, down, neutral.
- Incluye sparkline opcional via series.
- Permite comparativa textual con comparisonLabel.

1. MetricsGrid (organism)

- Render declarativo de multiples KPI cards.
- Grid responsive auto-fit con minCardWidth configurable.

## Cambios aplicados en esta iteracion

- Integracion de MetricsGrid en dashboard-page.
- Extensiones de KpiCard para indicadores de mas tipos.
- Export de KpiCard y MetricsGrid en barrel shared/ui.
- Storybook agregado para MetricsGrid.
- Ajustes responsive en LayoutShell, Topbar y Sidebar.

## Backlog recomendado (siguiente iteracion)

1. ChartPanel (organism).

- Contenedor estandar para graficos con header, filtros y leyenda.

1. StatDeltaList (molecule).

- Lista compacta de indicadores con variacion y semaforizacion.

1. Funnel/Conversion widget (organism).

- Panel para embudos comerciales y operativos con porcentajes por etapa.

1. Heatmap KPI (organism).

- Matriz de ocupacion, rendimiento o demanda por franja horaria y dia.

1. Responsive QA automatizada.

- Historias visuales en viewport 320, 375, 768, 1024 y 1440 con snapshots.
