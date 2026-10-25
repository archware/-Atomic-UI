---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-10-25"
document_type: "manual de continuidad"
status: "vigente"
version: "1.5.0"
change_id: "DOC-20261025-001"
canonical_doctrine: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\DOCTRINA_MAESTRA_UNIFICADA.md"
document_standard: "C:\\Users\\cotaha\\source\\repos\\.agent\\doctrinas\\ESTANDAR_DOCUMENTAL_AGENTES.md"
---

# Continuidad para agentes de Atomic UI

## Propósito y límites

`-Atomic-UI` es la única fuente visual canónica del ecosistema. Contiene tokens, componentes, catálogo, generador, política de consumo, biblioteca y contrato de distribución. Los consumidores conservan navegación, permisos, contratos API o IPC, estado y reglas de negocio; esas responsabilidades no se trasladan al ADN visual.

La autoridad superior es la [Doctrina maestra unificada](C:/Users/cotaha/source/repos/.agent/doctrinas/DOCTRINA_MAESTRA_UNIFICADA.md) (`C:\Users\cotaha\source\repos\.agent\doctrinas\DOCTRINA_MAESTRA_UNIFICADA.md`). El paquete documental se rige por el [Estándar documental para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/doctrinas/ESTANDAR_DOCUMENTAL_AGENTES.md) (`C:\Users\cotaha\source\repos\.agent\doctrinas\ESTANDAR_DOCUMENTAL_AGENTES.md`). El trabajo se asigna mediante el [Prompt maestro para continuidad de agentes](C:/Users/cotaha/source/repos/.agent/guias/PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md) (`C:\Users\cotaha\source\repos\.agent\guias\PROMPT_MAESTRO_CONTINUIDAD_AGENTES.md`).

## Orden obligatorio de lectura (acotada por defecto)

1. [Guía rápida para agentes con contexto reducido](../../.agent/guias/GUIA_RAPIDA_AGENTES_BAJO_CONTEXTO.md), [`../AGENTS.md`](../AGENTS.md) y el `AGENTS.md` de la raíz `C:\Users\cotaha\source\repos`.
2. Este manual (que consolida en su parte superior la arquitectura perenne y una ventana deslizante de los 3 cortes recientes).
3. Únicamente el roadmap activo en `.agent/roadmaps/` o `.agents/roadmaps/` y las primeras 80 líneas de [`CHANGELOG.md`](../CHANGELOG.md) y [`LESSONS_LEARNED.md`](../LESSONS_LEARNED.md).
4. Bajo demanda según el frente: [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md), [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md), [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md), [`docs/CONTRATO_CATALOGOS_CRUD.md`](./CONTRATO_CATALOGOS_CRUD.md) y [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md). Para migrar un consumidor a la línea 5.22 se consulta [`MIGRAR_A_5.22.md`](../governance/consumer/MIGRAR_A_5.22.md).

## Arquitectura y fronteras

```text
Requisito visual
  -> catalog/: recetas, componentes y variantes declaradas
    -> src/app/shared/ui/: átomos, moléculas, organismos, superficies y plantillas
      -> src/styles/: tokens y temas
        -> projects/atomic-ui/: biblioteca Angular compilable
          -> distribution/: contrato, manifiesto y paquete reproducible
            -> governance/consumer/: política, instalador y gate
              -> consumidores con procedencia exacta o adaptada
tools/ y scripts/ -> consulta, generación, auditoría, pruebas negativas y manifiestos
```

- Una feature de consumidor nunca se convierte en origen visual. Un hallazgo útil vuelve primero a esta fuente, queda catalogado y supera sus compuertas.
- La biblioteca `@atomic-ui/core` es el destino estable de distribución; un paquete local verde no autoriza publicación en un registro.
- `generate:ui` compone únicamente contratos declarados. El modo integrado se rechaza si faltan endpoint, método o contrato real.
- El instalador fija remoto, OID, política, versión y SHA-256 (`atomicRef` vigente: `3e76966493d4b59273655b7df18c1084fa044b9b`). No deje cambios sin confirmar en `governance/consumer/` ni en `src/app/shared/ui/` sin autorización de commit del Guardián, pues romperán `check:atomic` en los consumidores.

## Estado doctrinal comprobado

El paquete continúa en la versión `5.22.0` y la hoja [`ROADMAP_20260823_atomic_ui_6_0.md`](../.agents/roadmaps/ROADMAP_20260823_atomic_ui_6_0.md) permanece en ejecución. Dos cortes están validados: contratos públicos mediante Signals y estilos Angular externos en el alcance mantenido. Estado de las seis familias hacia 6.0.0:
1. **Medidas rígidas:** pendiente retirar `px` residuales en `src/app/shared/ui`.
2. **Tailwind:** `[x]` `tailwind.config.js`, `@tailwind` y dependencias retirados en `6be5a57`; pendiente sustituir utilidades residuales en historias/demos.
3. **Aliases:** permanecen 16 declaraciones de selector que incluyen `prest-*`.
4. **Colisiones:** `[x]` resueltas en `ATOMIC-20261019-001` (`InputComponent` y `SelectComponent` como implementaciones únicas de `app-input` y `app-select`).
5. **Generador:** debe producir exclusivamente Signals, estilos externos, tokens y selectores `app-`.
6. **Cambio de versión:** faltan el salto a 6.0.0, política, manifiestos y propagación verificada.

## Fuentes locales y rutas operativas

| Necesidad | Fuente |
|---|---|
| Política de consumidor | [`governance/consumer/ATOMIC_GOVERNANCE.md`](../governance/consumer/ATOMIC_GOVERNANCE.md) |
| Flujo de propagación | [`ECOSYSTEM_WORKFLOW.md`](../ECOSYSTEM_WORKFLOW.md) |
| Reglas derivadas de uso | [`DOCTRINA_DE_INTERFAZ.md`](../DOCTRINA_DE_INTERFAZ.md) |
| Runtime para agentes | [`docs/ATOMIC_UI_AGENT_RUNTIME.md`](./ATOMIC_UI_AGENT_RUNTIME.md) |
| Catálogo y Fuente UI | [`catalog/`](../catalog/) y [`src/app/shared/ui/`](../src/app/shared/ui/) |
| Tokens, Biblioteca y Distribución | [`src/styles/`](../src/styles/), [`projects/atomic-ui/`](../projects/atomic-ui/) y [`distribution/`](../distribution/) |
| Roadmaps y Bitácora histórica | [`.agents/roadmaps/`](../.agents/roadmaps/) y [`BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md) |

## Compuertas, protocolo de cambio, definición de terminado y rollback

Una modificación propagable ejecuta desde la raíz del proyecto:
```powershell
npm ci
npm run governance:check
npm run lint
npm test -- --watch=false
npm run build
npm run lib:build
npm run build-storybook
npm run package:check
git diff --check
git status --short --branch
```

- **Protocolo de cambio:** (1) Registrar ruta, rama, OID y árbol sucio; abrir roadmap antes de editar; consultar `agent:context` y catálogo. (2) Modificar la capa Atomic correcta usando `input()`/`output()`, hojas externas y selectores `app-`; actualizar catálogo, barrel, pruebas y herramientas en la misma unidad; ejecutar compuertas de fuente antes de propagar. (3) Fijar OID recuperable y registrar procedencia exacta o adaptación decidida; actualizar changelog, lecciones, manifiestos y roadmap.
- **Definición de terminado:** Una capacidad visual queda terminada cuando está en la capa correcta, usa tokens, Signals, estilos externos y `app-`, dispone de catálogo, barrel, accesibilidad, pruebas y responsive, supera las compuertas de fuente y queda propagada con procedencia verificable.
- **Riesgos y rollback:** El rollback restaura únicamente la unidad, el catálogo y los manifiestos correspondientes; nunca usa operaciones Git destructivas ni borra trabajo preexistente.

---

## Ventana deslizante de cortes recientes (máximo 3)

> Los cortes históricos anteriores a esta ventana se conservan íntegros en [`BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md).

### 1. Unidades CLT-20261024-003 y ATOMIC-20261024-003 — reconciliación CVA en Input y procedencia de acciones

`InputComponent` reconcilia valores nativos en `change`, `focus` y `blur` cuando el DOM cambia sin disparar `input`, manteniendo la paridad exacta con la copia gobernada de `ventas-cxc`. Asimismo, se consolida la historia `Basic` de `ActionGroup`, se actualiza `distribution/atomic-source-manifest.json` en el commit local autorizado `3e76966493d4b59273655b7df18c1084fa044b9b` y se acredita `node scripts/check-atomic-provenance.mjs` en `ventas-cxc` con 0 violaciones (`política 1.2.3, 95 componentes y 5 servicios con procedencia`). Véanse los roadmaps [CLT-20261024-003](../../.agent/roadmaps/ROADMAP_CLT-20261024-003_sincronizacion_formulario_clientes.md) y [ATOMIC-20261024-003](../../.agent/roadmaps/ROADMAP_ATOMIC-20261024-003_cierre_procedencia_acciones.md).

### 2. Unidad ACC-20261022-001 — estándar de acciones de catálogo

La fuente incorpora `ActionItem.isMenuOnly` y conserva `ActionGroup.maxVisible` como límite genérico de acciones directas. `PaginaCrud` aplica la regla física del catálogo: Ver, Editar y Más acciones. La papelera de baja y el cambio de estado quedan en el menú; una tercera directa contextual solo se acepta con `accionDirectaContextual`, id existente, justificación y evidencia no vacías, y nunca para semánticas destructivas. Evidencia, validación y rollback en el [roadmap ACC](../../.agent/roadmaps/ROADMAP_ACC-20261022-001_estandar-acciones-catalogo.md).

### 3. Unidad Select2 ATOMIC-20261020-002

La corrección de `Select2` se limita a su capa flotante, pruebas y catálogo. No se deben modificar los contenedores de formularios para compensar el recorte ni sincronizar masivamente el ADN del consumidor. El estado comprobado, límites del ensayo y rollback viven en el [roadmap de Select2](../.agent/roadmaps/ROADMAP_ATOMIC-20261020-002_select2_capa_flotante.md).
