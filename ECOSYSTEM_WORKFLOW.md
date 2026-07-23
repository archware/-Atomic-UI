# Arquitectura y Flujo de Trabajo del Ecosistema

> **Fecha:** Julio 2026
> **Contexto:** Este documento define la arquitectura de trabajo sincronizado entre nuestros tres proyectos principales y establece las reglas de propagación para mantener la consistencia del ecosistema.

## 🏗️ Los 3 Pilares del Ecosistema

El entorno de trabajo se compone de una fuente visual y sus consumidores:

1. **`-Atomic-UI`**: La **Fuente de la Verdad (Source of Truth)**. Es nuestra biblioteca de componentes agnóstica, sistema de diseño, tokens CSS y utilidades visuales. Todo el ADN visual nace aquí.
2. **`wails-angular-app`**: Aplicación de escritorio utilizando **Wails** (Go backend + Angular frontend). Utiliza WebView2 en Windows.
3. **`tauri-angular-app`**: Aplicación de escritorio utilizando **Tauri** (Rust backend + Angular frontend).
4. **`prestamo_front_atomic`**: SPA Angular 22 zoneless que consume adaptaciones
   trazables del ADN sin incorporar lógica financiera en la biblioteca.

---

## 🔄 Flujo de Trabajo y Propagación (Atomic-UI Sync)

Basado en la regla global de **Atomic-UI Sync**: *ninguna mejora visual nace en
un consumidor*. Todo componente o corrección se implementa y valida primero en
`-Atomic-UI`; solo después se propaga a Wails, Tauri, web u otro consumidor.

Un hallazgo descubierto dentro de una aplicación no autoriza a corregir allí la
fuente. Si falta el objeto, se crea primero en la capa Atomic correspondiente.
Los consumidores deben mantener una matriz de procedencia y una puerta automática
que detecte componentes sin fuente, copias divergentes, estilos inline y colores
fijos.

Esta regla es ejecutable: `governance/consumer` contiene la política canónica,
el manifiesto base, el gate y CI. `npm run create:project` los instala en toda
aplicación nueva y `npm run governance:install` gobierna consumidores existentes.
La CI de Atomic prueba un bootstrap válido y debe bloquear primitivas nativas,
componentes desconocidos, divergencias exactas y adaptaciones sin justificación.

### 1. Desarrollo UI (El Origen)
- Todo nuevo componente, ajuste de CSS, o corrección visual (ej. mejoras en hover, contrastes, bordes) se diseña y codifica **primero** en `-Atomic-UI`.
- **Token-First Development**: Si el componente necesita variables CSS, estas se definen en los archivos `_tokens-*.css` de Atomic-UI antes de ser consumidas por el componente (Ver `CONTRIBUTING_TOKENS.md`).

### 2. La Propagación (Push a Consumidores)
Una vez que el cambio está validado en `-Atomic-UI`, se debe **propagar** a las
rutas correspondientes de cada consumidor. Una adaptación de selector, import o
change detection debe quedar declarada; nunca se considera una nueva fuente.

- **Para CSS/Tokens**: Se utilizan scripts automatizados (como `scripts/propagate-tokens.ps1` en Atomic-UI) que copian los archivos CSS a las carpetas `src/styles/themes/` de Wails y Tauri, verificando que el hash SHA-256 coincida exactamente en los tres repositorios.
- **Para Componentes TS/HTML**: Se sincronizan los archivos de la carpeta `src/app/shared/ui/` desde Atomic-UI hacia las mismas rutas en Wails y Tauri.

### 3. Compilación Ligera (Dev)
Tras la propagación de cambios en el frontend o modificaciones en el backend:
- Compilamos únicamente los ejecutables para agilizar el desarrollo, evitando la generación de instaladores MSI/NSIS.
- **Wails**: `wails build` (o compilación angular vía `ng build` para dev frontend).
- **Tauri**: `npm run tauri build -- --bundles none`.

---

## 💾 Arquitectura DB-First y Flujo de Datos

El ecosistema sigue un enfoque **DB-First**, lo que dicta cómo se construye una nueva característica (ej. un nuevo indicador en el Dashboard):

1. **Capa de Base de Datos (SQL Server)**:
   - **Ningún agente Frontend o Backend realiza operaciones matemáticas complejas** (sumas, porcentajes, count). TODO se pre-calcula y se consume directamente desde Procedimientos Almacenados o Vistas (ej. `ind.resultados_...`).
2. **Capa Backend (Go / Rust)**:
   - Los conectores (`tiberius` en Tauri, `mssqldb` en Wails) exponen endpoints asíncronos limpios.
   - Las estructuras (`struct`) en Go/Rust reflejan **exactamente** las columnas en `snake_case`.
   - Se implementan fallbacks a Mock Data en caso de no existir el archivo `.env`. (Nota: las credenciales oficiales se inyectan en el `.env` en la ruta del `.exe`).
3. **Capa Frontend (Angular)**:
   - Las interfaces en TypeScript mapean el JSON entrante (`snake_case`).
   - Los datos macro se inyectan en `<app-chart>` y los datos tabulares operativos en `<app-table>`.
   - **Aesthetic First**: El layout nunca usa HTML sucio ni clases de Tailwind sueltas. Todo fluye a través de `<app-table class="rtc-table">` para activar el Responsive Layout y utiliza los tokens del sistema (ej. `--warning-color`).

---

## 🛡️ Prevención de Bugs (Lecciones Aprendidas)

- **Aislamiento de Entornos (WebView2)**: En Wails (WebView2), el canvas comparte estado global. Bugs de renderizado (como sombras residuales en gráficos) requieren cierres incondicionales (`ctx.save()` y `ctx.restore()`) en componentes como `app-chart`.
- **Desacoplamiento de Tokens**: El CSS no falla si un token no existe, simplemente usa `initial`, provocando bugs silenciosos (ej. tablas sin estilo). **Siempre** audita que los tokens consumidos por los componentes TypeScript estén definidos en los CSS de Atomic-UI usando el script de auditoría (`audit-tokens.ps1`).

---

## Resumen del Ciclo de Vida de una Mejora UI

1. Identificar necesidad visual en Wails/Tauri.
2. Codificar la solución en `-Atomic-UI` (`.ts`, `.css`).
3. Auditar tokens (`scripts/audit-tokens.ps1`).
4. Propagar a Wails y Tauri (`scripts/propagate-tokens.ps1` o scripts similares).
5. Build de verificación en ambos ecosistemas.
6. Actualizar `CHANGELOG.md` en Atomic-UI.
