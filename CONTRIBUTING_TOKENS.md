# Guía de Migración y Contribución — Atomic-UI
## Protocolo para evitar el bug de desacoplamiento Componente ↔ Token

> **Fecha:** Julio 2026  
> **Contexto:** Este documento nació del bug donde `table.component.ts` consumía 25+ tokens (`--table-color-*`, `--table-font-*`, `--table-card-*`) que **nunca fueron definidos** en `_tokens-components.css`, dejando las tablas sin estilos en producción.

---

## 🔴 El Anti-Patrón (lo que causó el bug)

```
Flujo ROTO:
  Desarrollador refactoriza componente → cambia nombres de tokens en el TS
  ↓
  NUNCA actualiza _tokens-components.css
  ↓
  CSS usa valores undefined → browser aplica initial/inherit
  ↓
  Tabla sin zebra, sin header, sin hover. Bug silencioso.
```

El CSS nunca lanza error cuando un token no existe — simplemente usa `initial`.
Por eso el bug puede vivir semanas sin ser detectado.

---

## ✅ El Patrón Correcto — Token-First Development

> **Regla de Oro:** El token debe existir en `_tokens-components.css`
> **antes o al mismo tiempo** que se usa en el componente. Nunca después.

```
Flujo CORRECTO:
  1. Diseñar el namespace de tokens del nuevo componente
  2. Agregar tokens en _tokens-components.css (light + dark + brand-dark)
  3. Escribir el componente consumiendo esos tokens
  4. Propagar _tokens-components.css a Wails y Tauri
```

---

## 📐 Convenciones de Nomenclatura de Tokens

Todo token de componente sigue el esquema:

```
--[componente]-[categoría]-[variante]
```

| Componente | Categorías válidas | Ejemplo |
|---|---|---|
| `table` | `color`, `font`, `header`, `card`, `transition` | `--table-color-stripe` |
| `chart` | `text`, `tooltip`, `grid`, `surface` | `--chart-tooltip-bg` |
| `modal` | `bg`, `overlay`, `shadow`, `border` | `--modal-bg` |
| `nav` | `bg`, `text`, `border`, `shadow` | `--nav-bg` |
| `btn` | `bg`, `text`, `shadow`, `border` | `--btn-primary-bg` |
| `input` | `bg`, `border`, `text`, `shadow` | `--input-border-focus` |

### Sub-categorías estándar

```css
/* Colores de superficie */
--[comp]-color-background   /* fondo principal */
--[comp]-color-stripe       /* fondo alterno (zebra) */
--[comp]-color-hover        /* fondo al hover */
--[comp]-color-border       /* borde fuerte */
--[comp]-color-border-light /* borde sutil */
--[comp]-color-text         /* texto de contenido */
--[comp]-color-primary      /* acento/énfasis */

/* Tipografía */
--[comp]-font-family
--[comp]-font-size
--[comp]-font-size-[variant]     /* header, caption, label */
--[comp]-font-weight
--[comp]-font-weight-[variant]

/* Espaciado */
--[comp]-cell-padding
--[comp]-[section]-padding

/* Bordes y radios */
--[comp]-border-radius
--[comp]-[section]-border-width
--[comp]-[section]-border-style
--[comp]-[section]-border-color

/* Sombras */
--[comp]-shadow
--[comp]-[state]-shadow        /* hover-shadow, focus-shadow */

/* Transiciones */
--[comp]-transition-duration
--[comp]-transition-timing

/* Responsive/Card (solo si aplica) */
--[comp]-card-padding
--[comp]-card-gap
--[comp]-card-shadow
```

---

## 📋 Checklist — Agregar un Nuevo Componente

Antes de hacer commit de cualquier componente nuevo o refactorizado:

```
[ ] 1. DEFINIR NAMESPACE
        Elegir el prefijo: --[nombre]-*
        Registrarlo en la tabla "Registro de Namespaces Activos" de este doc.

[ ] 2. MAPEAR TODOS LOS TOKENS CONSUMIDOS
        Listar CADA var(--...) que usa el componente.
        Si hay más de 5 tokens: crear tabla en el PR/commit.

[ ] 3. DEFINIR EN _tokens-components.css — SECCIÓN LIGHT (:root)
        Agregar TODOS los tokens con valores concretos.
        NINGÚN var() puede quedar sin definición.

[ ] 4. OVERRIDE EN SECCIÓN DARK
        Solo los tokens que cambian. El resto hereda de :root (no duplicar).

[ ] 5. OVERRIDE EN SECCIÓN BRAND-DARK
        Ídem. Solo lo que difiere de dark.

[ ] 6. TOKENS LEGADO (si hay refactor)
        Si renombras tokens: MANTENER los viejos con alias.
        Marcarlos: /* @deprecated — usar --new-token */

[ ] 7. EJECUTAR SCRIPT DE AUDITORÍA (ver abajo)

[ ] 8. PROPAGAR A WAILS Y TAURI
        Correr el script de propagación. Verificar bytes iguales.

[ ] 9. BUILD DE VERIFICACIÓN
        ng build --configuration=development en Wails → 0 errores = ✅
```

---

## 🔍 Script de Auditoría — Detectar Tokens Rotos

Ejecutar en PowerShell desde la raíz de `-Atomic-UI` para **cualquier componente**:

```powershell
# Auditoría de tokens: detecta tokens consumidos pero no definidos
param(
    [string]$ComponentGlob = "src\app\shared\ui\atoms\table\*.ts"
)

# Tokens que el componente CONSUME
$consumed = Select-String -Path $ComponentGlob `
    -Pattern "var\(--([a-z0-9-]+)" |
    ForEach-Object { $_.Matches | ForEach-Object { $_.Groups[1].Value } } |
    Sort-Object -Unique

# Tokens DEFINIDOS en el sistema de tokens
$defined = Select-String -Path "src\styles\themes\_tokens-components.css",
                               "src\styles\themes\_tokens-semantic.css",
                               "src\styles\themes\_tokens-primitives.css" `
    -Pattern "^\s+(--[a-z0-9-]+)\s*:" |
    ForEach-Object { $_.Matches.Groups[1].Value } |
    Sort-Object -Unique

# Resultado
$missing = $consumed | Where-Object { $_ -notin $defined }
Write-Host ""
Write-Host "=== AUDITORÍA: $ComponentGlob ===" -ForegroundColor Cyan
Write-Host "Tokens consumidos: $($consumed.Count)"
Write-Host "Tokens definidos:  $($defined.Count)"
Write-Host ""
if ($missing.Count -gt 0) {
    Write-Host "❌ TOKENS FALTANTES ($($missing.Count)):" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   --$_" -ForegroundColor Yellow }
} else {
    Write-Host "✅ Todos los tokens están definidos." -ForegroundColor Green
}
```

**Uso:**
```powershell
# Auditar tabla
.\audit-tokens.ps1 -ComponentGlob "src\app\shared\ui\atoms\table\*.ts"

# Auditar chart
.\audit-tokens.ps1 -ComponentGlob "src\app\shared\ui\organisms\chart\*.ts"

# Auditar todos los organisms
.\audit-tokens.ps1 -ComponentGlob "src\app\shared\ui\organisms\**\*.ts"
```

---

## 📦 Script de Propagación — Atomic-UI → Wails → Tauri

```powershell
# propagate-tokens.ps1
# Ejecutar desde la raíz de -Atomic-UI

$src = "src\styles\themes\_tokens-components.css"
$repos = @(
    "..\wails-angular-app\frontend\src\styles\themes\_tokens-components.css",
    "..\tauri-angular-app\src\styles\themes\_tokens-components.css"
)

$hash_src = (Get-FileHash $src -Algorithm SHA256).Hash

foreach ($dst in $repos) {
    Copy-Item $src $dst -Force
    $hash_dst = (Get-FileHash $dst -Algorithm SHA256).Hash
    $status = if ($hash_src -eq $hash_dst) { "✅" } else { "❌ HASH MISMATCH" }
    $bytes = (Get-Item $dst).Length
    Write-Host "$status Propagado → $dst ($bytes bytes)"
}
Write-Host ""
Write-Host "Hash Atomic-UI: $hash_src"
```

---

## 🗂️ Plantilla para Nuevo Componente

```css
/* ═══════════════════════════════════════════════════════════════════════
   === [NOMBRE_COMPONENTE] ===
   Selector:    [selector-del-componente]
   Consumido por: [archivo].component.ts (líneas N-M)
   Namespace:   --[prefijo]-*
   Definido:    Julio 2026
   ═══════════════════════════════════════════════════════════════════════ */

/* ── En :root / [data-theme="light"] ─────────────────────────────────── */
--[prefijo]-color-background:   var(--surface-background);
--[prefijo]-color-hover:        var(--hover-background-subtle);
--[prefijo]-color-border:       var(--border-color);
--[prefijo]-color-text:         var(--text-color-secondary);
--[prefijo]-font-family:        var(--font-sans, 'Inter', sans-serif);
--[prefijo]-font-size:          0.875rem;
--[prefijo]-transition-duration: 0.2s;
--[prefijo]-transition-timing:   ease;
/* ... completar todos los tokens del componente ... */

/* ── En [data-theme="dark"] ── solo overrides ─────────────────────────── */
--[prefijo]-color-background:   var(--surface-background); /* si difiere */
--[prefijo]-color-border:       var(--border-color-strong);

/* ── En [data-theme="brand-dark"] ── solo lo que difiere de dark ───────── */
/* (vacío si igual a dark) */
```

---

## ⚠️ Regla de Tokens Legado

Cuando **renombres** tokens existentes, mantener aliases por al menos 1 sprint:

```css
/* ✅ CORRECTO */
/* @deprecated — alias temporal. Eliminar en sprint N+1 cuando
   gerencial.component.ts y operativo.component.ts migren a --table-color-* */
--table-bg:        var(--table-color-background);
--table-stripe-bg: var(--table-color-stripe);

/* ❌ INCORRECTO — eliminar inmediatamente rompe módulos no migrados */
```

**Eliminar un token legado solo cuando:**
1. `Select-String -Recurse -Pattern "--old-token"` retorna 0 resultados
2. PR separado con título: `[BREAKING] remove deprecated --old-token`

---

## 📚 Registro de Namespaces Activos

| Namespace | Componente | Archivo | Estado |
|---|---|---|---|
| `--table-color-*` | `app-table` | `table.component.ts` | ✅ Definido |
| `--table-font-*` | `app-table` | `table.component.ts` | ✅ Definido |
| `--table-header-*` | `app-table-head` | `table-head.component.ts` | ✅ Definido |
| `--table-card-*` | `app-table` | `table.component.ts` | ✅ Definido |
| `--table-transition-*` | `app-table-row` | `table-row.component.ts` | ✅ Definido |
| `--table-row-hover-*` | `app-table-row` | `table-row.component.ts` | ✅ Definido |
| `--chart-*` | `app-chart` | `chart.component.ts` | ✅ Definido |
| `--nav-*` | Layout | layout components | ✅ Definido |
| `--card-*` | `app-card` | `card.component.ts` | ✅ Definido |
| `--modal-*` | `app-modal` | `modal.component.ts` | ✅ Definido |
| `--input-*` | `app-floating-input` | `floating-input.component.ts` | ✅ Definido |
| `--button-*` | `app-btn` | `_buttons.css` | ✅ Definido |
| `--badge-*` | `app-chip` | `chip.component.ts` | ✅ Definido |
| `--pagination-*` | `app-data-pager` | `data-pager.component.ts` | ✅ Definido |
| `--tab-*` | `app-tabs` | `tabs.component.ts` | ✅ Definido |
| `--dropdown-*` | `app-select2` | `select2.component.ts` | ✅ Definido |
| `--ng-select-*` | ng-select wrapper | `_forms.css` | ✅ Definido |
| `--loader-*` | `app-loader` | `loader.component.ts` | ✅ Definido |
| `--skeleton-*` | Skeleton loaders | skeleton components | ✅ Definido |
| `--scroll-*` | `app-scroll-overlay` | `scroll-overlay.component.ts` | ⚠️ Auditar |
| `--data-pager-*` | `app-data-pager` | `data-pager.component.ts` | ⚠️ Auditar |
