# 📦 Guía de Portabilidad: Atomic UI

Este documento está dirigido a futuros Agentes IA y Desarrolladores que necesiten reutilizar el sistema de diseño **Atomic UI** en nuevos proyectos (como aplicaciones de escritorio en Tauri, Wails, Electron, o nuevas aplicaciones web en Angular).

## Gobierno obligatorio desde el primer commit

La portabilidad ya no es una recomendación manual. Toda aplicación nueva debe
nacer mediante `npm run create:project`, que instala automáticamente el contrato
de agentes, manifiesto de procedencia, gate y workflow de CI descritos en
[`governance/README.md`](./governance/README.md). Una aplicación existente se
incorpora con `npm run governance:install -- <ruta> --ui-root=<ruta-ui>`.

No se permite retirar ni modificar esas copias desde el consumidor. El comando
`npm run check:atomic` debe preceder pruebas y build; en GitHub, su job debe ser
un status check requerido de la rama protegida.

## ⚠️ Regla de Oro (Lo que NO debes hacer)
**NUNCA copies el repositorio completo.** 
Este repositorio contiene configuraciones de despliegue a GitHub Pages, Storybook (`.storybook`), pipelines y scripts de tests que inflarán innecesariamente cualquier proyecto nuevo. Atomic UI está diseñado para ser trasplantado quirúrgicamente.

**NUNCA crees primero un objeto visual en el consumidor.** Si el átomo, molécula,
organismo o plantilla no existe, se incorpora y valida aquí antes del trasplante.
El consumidor registra la ruta fuente y no mantiene colores, tamaños o diálogos
alternativos sin trazabilidad.

## ✂️ Extracción Quirúrgica (Lo que SÍ debes copiar)

Para portar este sistema de diseño a un nuevo proyecto Angular limpio (`ng new app`), solo debes extraer **tres elementos clave**:

### 1. Los Órganos Visuales (Componentes)
Copia la carpeta entera que contiene los Átomos, Moléculas, Organismos y Plantillas:
```text
ORIGEN:  -Atomic-UI/src/app/shared/ui/
DESTINO: <nuevo-proyecto>/src/app/shared/ui/
```
*Nota: Todos los componentes son `standalone: true`, por lo que no necesitas importar ningún módulo global.*

### 2. Los Tokens de Diseño (CSS Global)
El corazón visual (Glassmorphism, colores `primary-color`, tipografías, variables HSL) vive en el archivo de estilos global. Debes copiar o fusionar su contenido:
```text
ORIGEN:  -Atomic-UI/src/styles.css
DESTINO: <nuevo-proyecto>/src/styles.css
```

### 3. Las dependencias y fuentes locales
Para que los íconos y la fuente principal se rendericen correctamente, asegúrate de que el `index.html` del nuevo proyecto o el `styles.css` importen FontAwesome y Open Sans.
```bash
npm install @fontsource/open-sans @fortawesome/fontawesome-free
```

```css
@import "@fontsource/open-sans/400.css";
@import "@fontsource/open-sans/500.css";
@import "@fontsource/open-sans/600.css";
@import "@fontsource/open-sans/700.css";
@import "@fortawesome/fontawesome-free/css/all.min.css";
```
*(Alternativamente, instala `@fortawesome/fontawesome-free` vía NPM).*

## 🚀 Cómo usar los componentes trasplantados
Una vez pegados en el nuevo proyecto, cualquier componente puede usarlos simplemente importándolos en su decorador:

```typescript
import { ButtonComponent } from './shared/ui/atoms/button/button.component';
import { CardComponent } from './shared/ui/molecules/card/card.component';

@Component({
  selector: 'app-mi-vista',
  standalone: true,
  imports: [ButtonComponent, CardComponent],
  template: `
    <app-card>
      <app-button variant="primary" size="md">¡Funciona Nativo!</app-button>
    </app-card>
  `
})
export class MiVistaComponent {}
```

Con estos sencillos pasos, garantizarás que cualquier nueva aplicación mantenga el nivel premium, estético y ligero que caracteriza a **Atomic UI**.

## 🧠 Lecciones Aprendidas (Migraciones Wails & Tauri)

Durante nuestra adaptación de Atomic UI a frameworks de escritorio nativo (Wails para Go y Tauri para Rust), descubrimos factores críticos para un trasplante exitoso:

### 1. Tailwind CSS es Obligatorio
Aunque inicialices un proyecto Angular `--minimal --style css`, si trasplantas componentes de Atomic UI que usan clases utilitarias (`bg-white`, `shadow-md`, `p-6`, etc.), **debes instalar y configurar Tailwind CSS** en el nuevo proyecto. De lo contrario, la interfaz perderá todas sus proporciones y responsividad.
- `npm install -D tailwindcss@3 postcss autoprefixer`
- Crea un `tailwind.config.js` que apunte a tus nuevos archivos `src/**/*.{html,ts}`.

### 2. Dependencias Estrictas de Angular
Si decides copiar la carpeta `ui` completa, el compilador de Angular buscará inmediatamente las dependencias de terceros usadas en los Organismos complejos (por ejemplo, `@ngx-translate/core` para el selector de idiomas, o `ng2-charts` y `chart.js` para los gráficos).
**Solución:** Si tu nueva aplicación es muy ligera (como un Dashboard nativo simple), **borra físicamente** las carpetas de los componentes que no uses dentro de `shared/ui` y elimina sus referencias en el archivo exportador global `index.ts`. Esto evitará conflictos de dependencias NPM.

### 3. Wails y `go:embed`
Wails requiere que la carpeta de compilación de Angular exista para poder embeberla en el binario de Go. Sin embargo, Angular borra la carpeta `dist` antes de compilar, lo que causa el error `contains no embeddable files`. 
**Solución:** Ejecuta `npm run build` en el frontend manualmente al menos una vez para que Angular genere los archivos antes de invocar `wails build`.

### 4. Importar `styles/themes`
No basta con copiar `styles.css`. Debes recordar copiar también la carpeta completa de `styles/` de Atomic UI hacia tu nuevo proyecto, ya que allí residen los tokens CSS anidados (como `themes/index.css`) que le dan los colores HSL a la marca.

### 5. Apagar la Optimización Crítica de CSS
Angular 18+ inyecta los estilos usando un evento de carga diferida (`media="print" onload="this.media='all'"`). Las ventanas de las apps de escritorio nativas (como los WebView de Tauri o Wails) frecuentemente bloquean estos eventos debido a políticas de seguridad locales, causando que tu interfaz jamás reciba los estilos.
**Solución:** Abre `angular.json` en tu nuevo proyecto y dentro del bloque `"optimization": true`, cámbialo por:
```json
"optimization": {
  "scripts": true,
  "styles": {
    "minify": true,
    "inlineCritical": false
  },
  "fonts": true
}
```
