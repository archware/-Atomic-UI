---
title: "Continuidad para agentes de Atomic UI"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-23"
last_updated: "2026-10-26"
document_type: "manual de continuidad"
status: "vigente"
version: "1.5.3"
change_id: "ATOMIC-20261026-003"
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
- El instalador fija remoto, OID, política, versión y SHA-256 en `docs/atomic-provenance.json` de cada consumidor contra el `HEAD` confirmado de esta fuente y el inventario de `distribution/atomic-source-manifest.json`. No deje cambios sin confirmar en `governance/consumer/` ni en `src/app/shared/ui/` sin autorización de commit del Guardián, pues romperán `check:atomic` en los consumidores.

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
| Roadmaps y Bitácora histórica | [`.agents/roadmaps/`](../.agents/roadmaps/), [`ROADMAP_20260823_continuidad_documental_agentes.md`](../.agents/roadmaps/ROADMAP_20260823_continuidad_documental_agentes.md) (`ECO-20260823-003`) y [`BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md`](./BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md) |

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

### 1. Unidad ATOMIC-20261026-003 — tipografía local canónica Quicksand y Open Sans

Se empaquetan en `src/styles/themes/fonts/` los 12 archivos `.woff2` locales de `Open Sans` (`400`, `500`, `600`, `700` en `latin` y `latin-ext`) y `Quicksand` (`400`, `500`, `600`, `700` completo), declarados en `src/styles/themes/_fonts.css`, importados al inicio de `src/styles/themes/index.css` e inventariados en `distribution/package-contract.json` y `distribution/atomic-source-manifest.json`. Se definen `--font-family-base`, `--font-family-heading` y `--font-family-mono` en `_tokens-primitives.css`, se corrige `--table-font-family: var(--font-family-base)` en `_tokens-components.css` y se enlaza `--font-family-heading` en encabezados globales (`h1`–`h6`), `text.component.css`, `page-header.scss`, `pagina-crud.scss`, `pagina-crud-accordion.scss`, `modal.component.css`, `modal-container.component.css`, `popup-container.component.css`, `form-dialog.scss` y `kpi-card.component.css`, además de `version.component.css`, el puente Dart (`scripts/emit-dart-tokens.mjs`) y la prueba negativa `tools/test-typography-scale-gate.mjs`. Consultar el [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261026-001_tipografia_local_quicksand_open_sans.md).

### 2. Unidad ATOMIC-20261026-002 — corrección editorial y referencia material

Se corrigen las 151 ocurrencias de prosa que producen los 150 hallazgos
ortográficos de los dos registros. Los identificadores ASCII, bloques de
código, versiones y anclas históricas se conservan. La referencia visual se
califica como maestra §3.1; la desviación original sigue abierta y declara
`por-clasificar` para su atribución operativa a Orquestación. El control de
referencias del directorio pasa; el control ortográfico conserva código 1
por un falso positivo en el identificador HTML ASCII de la primera ancla.
La [evidencia y checklist](../.agent/auditorias/ATOMIC-20261026-002/CIERRE_EDITORIAL.md)
conservan las salidas originales, el juicio independiente y la limitación.
No se repiten las 70 pruebas válidas del corte anterior ni se modifica
producto, dependencias, manifiestos o trabajo de otras sesiones.

### 3. Unidad ATOMIC-20261026-001 — pruebas de accesibilidad

Se corrigen seis expectativas en cuatro especificaciones mediante presencia
obligatoria y estrechamiento del nodo, conservando los casos existentes. La
copia aislada del HEAD `dd93734a3eea40b87d46b4990976231fe2d6ca19` más las cuatro
pruebas propias pasa 70/70 casos de Input, Select, Textarea, Dropdown,
ActionGroup y PaginaCrud. Los otros 802 archivos conservan los bytes de la copia inicial; el cotejo con
blobs Git normaliza CRLF. Se conserva el
lockfile de las dependencias completas existentes. No se cambian componentes,
configuración ni dependencias. El [roadmap](../.agent/roadmaps/ROADMAP_ATOMIC-20261026-001_desbloqueo_pruebas.md)
registra revisión independiente, custodia y límites del corte; no acredita el
árbol móvil, paquete, gobernanza o procedencia actuales. El corte Select2 se
conserva íntegro en la [bitácora histórica](BITACORA_CONTINUIDAD_CORTES_HISTORICOS.md).
