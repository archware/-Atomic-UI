---
title: "Alertas canónicas y acciones distinguibles"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-09-29"
last_updated: "2026-09-29"
document_type: "roadmap"
status: "completado"
version: "1.0.0"
change_id: "ATOMIC-20260929-005"
---

# Alertas y acciones

## Encuadre

El dueño observa diferencia entre showcase y Ventas y aprueba ojo neutro,
Activar verde y Editar azul. Cambio visual solicitado, no rediseño de negocio.
Serial, sin delegación. Rama main; OID 98cc215757a03787371fa7cdf2dcd564a2430fef.
Raíz propia C:/Users/cotaha/source/repos/-Atomic-UI.
Capturas, reparto exacto y respaldos previos: C:/Users/cotaha/AppData/Local/Temp/alertas-mejoras-1790738025234.
Preservar trabajo previo y concurrente en Ventas/Select2/backend.

## Unidad y exclusiones

Alert conserva API, proyección, anuncios y cierre; adopta superficie tenue,
acento lateral, texto legible y estilos externos. El showcase usará la misma
molécula, sin su alerta paralela. TableAction catalog separa consulta y activación,
sin alterar standard ni iconos/acciones. Reintento de DataTable usará Button
neutro, sin cambiar evento ni consulta. Doctrina, catálogo y pruebas coherentes.

Primero fuente y pruebas; después adopción candidata acotada en Ventas.
No API, permisos, escrituras reales, dependencias, commits ni publicación.
No npm ci sobre servidor activo; no certificar instalación limpia ni cierre
de la deuda global. No modificar archivos de la feature Ventas.

## Plan y aceptación

- [x] Corregir ADN y retirar duplicado visual del showcase.
- [x] Verificar iconos, roles, cierre, retry, temas y anchuras pequeñas.
- [x] Propagar solo deltas revisados y mantener pruebas propias.
- [x] Ejecutar pruebas, builds, compuertas; registrar deuda y comparación visual.
- [x] Actualizar lecciones/continuidad y comprobar diff/colisión/sondeo.

## Rollback

Retirar únicamente deltas de esta asignación usando respaldos y revisión por
bloques. No reset, checkout global ni sobrescritura de trabajo concurrente.
La publicación de Atomic permanece congelada.

## Evidencia

Ampliación previa: añadir src/stories/alert-reference.stories.ts para la nueva
prueba visual, con id alfabético. El renderer instalado falla con los ids
históricos que empiezan por número; no se cambian esos contratos ni dependencias.

### Resultado local

Implementación terminada y adoptada como candidato local en Ventas; no release.
La muestra consume Alert y la referencia aislada compone Panel/Alert/DataTable.
No quedan alertas de muestra dibujadas en paralelo dentro del ejemplo intervenido.
Se preservan perfiles, iconos, proyección, eventos y contratos públicos.

### Pruebas actuales

- 54/54: Alert, TableAction, DataTable y ejemplo showcase.
- Negativa: volver view de catalog a success falla 1/6; restaurar neutral
  devuelve 54/54. No se cambió el manifiesto para aceptar el defecto.
- Suite completa: 512/516; cuatro fallos de auth.interceptor ajenos.
- Build de aplicación, biblioteca y Storybook correctos.
- Catálogo estructural, tooling, validación de skill, Signals, estilos externos,
  selectores, valores CSS, tokens Dart y foco correctos.
- governance:test y smoke correctos (92 componentes y cinco servicios).
  governance:check se detiene en diez hallazgos de blueprints fuera del corte.
- Paquete: manifiesto generado de 320 fuentes y comprobación final correctos;
  el dry-run privado no publica ni certifica instalación reproducible.
- Deuda: API de catálogo (nueve faltas Input/Topbar), tokens (tres ausentes),
  contraste (tres hallazgos), tipografía (un peso) y lint (10 errores/23 avisos).
- Compuertas comunes rápidas: nueve correctas; no equivalen al barrido completo.

### Revisión visual y límites

Capturas alertas-dark.png y alertas-light.png en el temporal: fondo tenue,
borde lateral 4 px, texto neutro y reintento sin acento morado. Cierre por teclado
comprobado en demo; anchos 320/375/768/1366 sin desbordar en prueba real Chrome.
brand-dark revela herencia semántica previa incorrecta: no se declara validado;
corregirlo requiere una unidad de tokens globales, no CSS local en Alert.

La activación de CARNE en navegador fue confirmada por el dueño, no un ensayo
controlado del agente. No se provocaron errores de red ni escrituras para obtener
una captura. La publicación permanece congelada; no se ejecutó npm ci.

### Control del alcance

Reparto de 30 rutas: una historia anterior terminó sin delta. UTF-8 estricto y
diff --check de la diferencia contra respaldos: cero fallos en el corte.
Storybook regeneró documentation.json; se retiró solo esa salida mecánica,
limpia antes del build, conservando copia en el temporal. Colisión final fuente:
cero fuera del reparto. La raíz conserva cuatro archivos auxiliares ajenos y
dos cambios concurrentes del módulo Ventas; el sondeo detectó además dos
cambios del frente backend concurrente. No se borran ni se atribuyen
al agente de esta unidad. Véase la
[desviación](../desviaciones/DESVIACION-20260929-005.md).

La documentación se valida con manifiesto temporal explícito y Git por separado,
sin modificar el registro compartido. Los fallos generales anteriores se
mantienen como deuda y no invalidan la atribución del corte local.

Validación documental final: cero fallos en ambos paquetes seleccionados. Sondeo
de apertura/cierre: 25 repositorios, sin cambios de identidad Git; diferencias
de archivos clasificadas entre este corte y trabajo ajeno conservado.
