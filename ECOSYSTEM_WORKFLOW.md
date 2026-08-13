---
title: "Arquitectura y flujo de trabajo del ecosistema Atomic"
subtitle: "Gobierno, distribución y propagación verificable"
author: "Ing. Havel CONTRERAS TAPAHUASCO"
date: "2026-08-12"
---

# Arquitectura y flujo de trabajo del ecosistema

> **Fecha original:** julio de 2026
>
> **Última actualización:** 12 de agosto de 2026
>
> **Contexto:** El documento define la arquitectura de trabajo sincronizado
> entre los tres proyectos base principales, la fuente Atomic y un consumidor
> web histórico. También establece las reglas de propagación verificable que
> preservan la consistencia técnica del ecosistema.

## Los pilares del ecosistema

El entorno de trabajo se compone de una fuente visual transicional y sus consumidores:

1. **`-Atomic-UI`**: fuente de la verdad visual. El repositorio conserva componentes, sistema de diseño, tokens CSS y utilidades visuales. Desde 5.5.0 declara ademas el proyecto Angular de tipo `library` **atomic-ui**: `npx ng build atomic-ui` compila `@hra/atomic-ui` en formato Angular Package Format. Lo que sigue bloqueado no es la compilacion sino la **publicacion** en un registro npm, que espera registro privado y procedencia firmada. Vease `distribution/PACKAGE_STATUS.md`.
2. **`base_python_angular`**: aplicación de escritorio con backend Python, frontend Angular y WebView2.
3. **`base_wails_angular`**: aplicación de escritorio con backend Go, frontend Angular y Wails sobre WebView2 en Windows.
4. **`base_tauri_angular`**: aplicación de escritorio con backend Rust, frontend Angular y Tauri.
5. **`prestamo_front_atomic`**: referencia heredada a un consumidor web. El repositorio no forma parte del workspace auditado el 3 de agosto de 2026; su tecnología y estado no se consideran verificados y la referencia se conserva para exigir trazabilidad si vuelve a incorporarse.

---

## Flujo de trabajo y propagación Atomic-first

Basado en la regla global de **Atomic-UI Sync**: *ninguna mejora visual nace en
un consumidor*. Todo componente o corrección se implementa y valida primero en
`-Atomic-UI`; solo después se propaga a Wails, Tauri, web u otro consumidor.

Un hallazgo descubierto dentro de una aplicación no autoriza a corregir allí la
fuente. Si falta el objeto, se crea primero en la capa Atomic correspondiente.
Los consumidores deben mantener una matriz de procedencia y una puerta automática
que detecte componentes sin fuente, copias divergentes, estilos inline y colores
fijos.

El recorrido concreto para subir un consumidor —con sus trampas medidas— está
en [`governance/consumer/MIGRAR_A_5.7.md`](governance/consumer/MIGRAR_A_5.7.md).

Esta regla es ejecutable: `governance/consumer` contiene la política canónica,
el manifiesto base, el gate y CI. `npm run create:project` los instala en toda
aplicación nueva y `npm run governance:install` gobierna consumidores existentes.
La CI de Atomic ejecuta `governance:check`. Dentro de ese gate,
`governance:test` comprueba la política sobre un fixture válido y debe bloquear
primitivas nativas, componentes desconocidos, divergencias exactas y
adaptaciones sin justificación. La prueba integral del generador permanece
separada en `governance:smoke`; no forma parte del CI hasta disponer de una
ejecución reproducible de Angular CLI sin acceso al registro de paquetes.

### 1. Desarrollo UI en la fuente

#### Interfaz desde requisitos

Una solicitud de CRUD o de cualquier otra interfaz empieza con un contrato
`ui-requirement` y una consulta compacta a `catalog/`. El agente selecciona una
receta y únicamente variantes declaradas; después ejecuta `generate:ui` con
`--dry-run`. El modo integrado se rechaza si faltan endpoint, método o contrato.
Los blueprints de `src/blueprints` son demos históricos del showcase y no se
propagan ni se copian a aplicaciones productivas.

- Todo nuevo componente, ajuste de CSS, o corrección visual (ej. mejoras en hover, contrastes, bordes) se diseña y codifica **primero** en `-Atomic-UI`.
- **Desarrollo basado en tokens**: si el componente necesita variables CSS, estas se definen en los archivos `_tokens-*.css` de Atomic UI antes de ser consumidas por el componente (véase `CONTRIBUTING_TOKENS.md`).

### 2. Propagación a consumidores
Una vez que el cambio está validado en `-Atomic-UI`, se debe **propagar** a las
rutas correspondientes de cada consumidor. Una adaptación de selector, import o
change detection debe quedar declarada; nunca se considera una nueva fuente.

- **Para CSS y tokens**: el script histórico `scripts/propagate-tokens.ps1` ejecuta ahora una auditoría de solo lectura sobre los ocho archivos de tema y las rutas vigentes de Python, Tauri y Wails. La línea base verificable registra 5/8 archivos exactos en Python, 4/8 en Tauri y 5/8 en Wails. La copia automática permanece deshabilitada mientras existan adaptaciones, porque una sobrescritura general eliminaría diferencias que todavía requieren revisión.
- **Para componentes TypeScript y HTML**: durante la transición se sincronizan los archivos
  desde `src/app/shared/ui/` y se registra la clasificación `exact` o `adapted`.
  Una clasificación `exact` exige igualdad del conjunto de archivos y de todos
  sus hashes SHA-256. Una clasificación `adapted` exige justificación concreta y
  registro de decisión; no se genera automáticamente para hacer pasar el gate.

### 3. Distribución verificable

El destino estable será un paquete Angular compilado con el nombre
`@hra/atomic-ui`. Mientras el repositorio sea una aplicación Angular y no exista
un proyecto `library` con `ng-packagr`, el artefacto se mantendrá como scaffold
privado y no instalable. `distribution/package-contract.json` registra este
bloqueo; `distribution/atomic-source-manifest.json` fija la procedencia por
SHA-256 y `npm run package:check` ejecuta un `npm pack --dry-run` sin red.

El estado verde del gate transicional confirma integridad y reproducibilidad del
contrato. No confirma que exista una biblioteca Angular compilada ni autoriza
publicación. La exportación raíz se habilitará solamente después de separar del
barrel la autenticación, el transporte HTTP, el caché y los permisos propios de
cada consumidor.

La identidad de fuentes utiliza desde 5.5.6 la canonización
`git-clean-eol-v1`; desde 5.5.8 el contrato se aplica de forma cerrada en la
fuente y en cada consumidor. La regla versionada `* text=auto eol=crlf`
determina texto canónico y las reglas `-text` determinan binarios exactos. Los
atributos globales y de sistema se neutralizan, `.git/info/attributes` no puede
alterar la identidad y los filtros, `ident`, codificaciones de árbol de trabajo
y enlaces Git modo `120000` se rechazan.

El instalador fija el OID completo de 40 o 64 caracteres según el formato del
repositorio, comprueba el remoto canónico, recalcula el manifiesto y valida que
toda fuente propagada exista como archivo regular en ese commit. La instalación
prevalida todos los destinos y revierte el conjunto si una escritura falla. La
CI ejecuta primero el gate del checkout Atomic fijado y después las herramientas
del consumidor. Un ruleset externo debe exigir el workflow de la rama protegida:
un archivo de workflow modificado por la misma solicitud no puede demostrar por
sí solo que no fue degradado.

### 4. Compilación ligera de desarrollo

Tras la propagación de cambios en el frontend o modificaciones en el backend:

- Se compilan únicamente los ejecutables para agilizar el desarrollo y se evita la generación de instaladores MSI/NSIS.
- **Wails**: `wails build` (o compilación angular vía `ng build` para dev frontend).
- **Tauri**: `npm run tauri build -- --no-bundle`.

---

## Arquitectura DB-first y flujo de datos

El ecosistema sigue un enfoque **DB-First**, lo que dicta cómo se construye una nueva característica (ej. un nuevo indicador en el Dashboard):

1. **Capa de base de datos (SQL Server)**:
   - Ningún agente frontend o backend realiza operaciones matemáticas complejas (sumas, porcentajes o conteos). Los valores se calculan previamente y se consumen directamente desde procedimientos almacenados o vistas (por ejemplo, `ind.resultados_...`).
2. **Capa backend (Go y Rust)**:
   - Los conectores (`tiberius` en Tauri, `mssqldb` en Wails) exponen endpoints asíncronos limpios.
   - Las estructuras (`struct`) en Go/Rust reflejan **exactamente** las columnas en `snake_case`.
   - La ausencia de configuración o de SQL Server produce un estado explícito y
     tipado de desconexión. Queda prohibido sustituir silenciosamente datos reales
     por datos simulados en producción.
   - Los datos simulados se limitan a pruebas automatizadas, Storybook o demos
     identificadas. Los mocks solo pueden existir en fixtures, pruebas o demos
     aisladas; no se activan por ausencia de `.env` ni funcionan como fallback
     silencioso de una aplicación productiva.
   - Las credenciales SQL se conservan en el gestor seguro del sistema operativo,
     bajo un namespace independiente por aplicación. No se almacena un archivo
     `.env` con contraseñas junto al ejecutable distribuido.
3. **Capa frontend (Angular)**:
   - Las interfaces en TypeScript mapean el JSON entrante (`snake_case`).
   - Los datos macro se inyectan en `<app-chart>` y los datos tabulares operativos en `<app-table>`.
   - **Diseño primero**: el layout no utiliza HTML sin estructura ni clases de Tailwind aisladas. Los datos tabulares se presentan mediante `<app-table class="rtc-table">` para activar el layout adaptable y utilizar los tokens del sistema (por ejemplo, `--warning-color`).

---

## Prevención de defectos y lecciones aprendidas

- **Aislamiento de entornos (WebView2)**: en Wails, el canvas comparte estado global. Los defectos de renderizado, como sombras residuales en gráficos, requieren cierres incondicionales (`ctx.save()` y `ctx.restore()`) en componentes como `app-chart`.
- **Desacoplamiento de tokens**: el CSS no produce un error cuando un token no existe y puede utilizar `initial`, lo que provoca defectos silenciosos, como tablas sin estilo. Se debe comprobar que los tokens consumidos por los componentes TypeScript estén definidos en los CSS de Atomic UI mediante `scripts/audit-tokens.ps1`.

---

## Ciclo de vida de una mejora UI

1. La necesidad visual se identifica en Python, Wails, Tauri u otro consumidor.
2. La necesidad funcional se convierte en un contrato `ui-requirement` sin
   inventar reglas de dominio ni una integración inexistente.
3. `agent:context` permite comprobar si existen una receta, los componentes y
   las variantes suficientes para resolver el requisito.
4. Si falta ADN visual, la solución se codifica primero en `-Atomic-UI`; los
   componentes se catalogan y los tokens se auditan mediante
   `scripts/audit-tokens.ps1`.
5. El `dry-run` se revisa antes de generar la composición y de conectar los
   contratos reales que pertenecen al consumidor.
6. El manifiesto de fuentes se actualiza con `npm run package:manifest` cuando
   el cambio es intencional.
7. Los comandos de gobierno, tooling, lint, pruebas, build,
   `npm run package:check` y `npm run governance:check` se ejecutan en la fuente.
8. El cambio se propaga con procedencia trazable, clasificación exacta o una
   adaptación documentada.
9. El build y las pruebas de verificación se ejecutan en cada consumidor
   afectado.
10. `CHANGELOG.md` se actualiza en Atomic UI con el identificador del cambio.
