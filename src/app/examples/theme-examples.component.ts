import { Component, inject, computed, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../shared/ui/services/theme.service';

/**
 * EJEMPLOS DE USO DEL SERVICIO DE TEMAS
 *
 * Este archivo muestra diferentes formas de usar el ThemeService
 * en tus componentes. Copiar y adaptar según sea necesario.
 */

// ============================================================================
// EJEMPLO 1: Componente con Tema Dinámico Básico
// ============================================================================

@Component({
  selector: 'app-example-basic',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <h3>Tema Dinámico Básico</h3>

      <!-- Mostrar tema actual -->
      <p>Tema seleccionado: <strong>{{ themeService.getSelectedTheme() }}</strong></p>
      <p>¿Está en modo oscuro? <strong>{{ themeService.isDarkMode() ? 'Sí' : 'No' }}</strong></p>

      <!-- Botón para alternar -->
      <button (click)="themeService.toggleTheme()">
        Alternar Tema
      </button>
    </div>
  `,
  styles: [`
    .card {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all 300ms ease;
    }

    button {
      background-color: #2563eb;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 10px;
    }

    button:hover {
      background-color: #1d4ed8;
    }
  `]
})
export class ExampleBasicComponent {
  themeService = inject(ThemeService);
}

// ============================================================================
// EJEMPLO 2: Componente con Condicionales CSS
// ============================================================================

@Component({
  selector: 'app-example-conditional',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.dark-mode]="themeService.isDarkMode()">
      <h3>Estilos Condicionados</h3>

      <div class="box">
        <p>Esta caja cambia de color según el tema</p>
      </div>

      <!-- Mostrar elemento solo en tema oscuro -->
      @if (themeService.isDarkMode()) {
        <p class="theme-indicator">🌙 Está en modo oscuro</p>
      } @else {
        <p class="theme-indicator">☀️ Está en modo claro</p>
      }
    </div>
  `,
  styles: [`
    .dark-mode {
      /* Estilos específicos para modo oscuro */
    }

    .box {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border-radius: 8px;
      transition: all 300ms ease;
    }

    .theme-indicator {
      margin-top: 15px;
      font-size: 1.1rem;
      font-weight: 600;
    }
  `]
})
export class ExampleConditionalComponent {
  themeService = inject(ThemeService);
}

// ============================================================================
// EJEMPLO 3: Componente con Computed Signals
// ============================================================================

@Component({
  selector: 'app-example-computed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="info-box">
      <h3>Información Computada del Tema</h3>

      <p><strong>Ícono del tema:</strong> {{ themeIcon() }}</p>
      <p><strong>Descripción:</strong> {{ themeDescription() }}</p>
      <p><strong>Nombre amigable:</strong> {{ themeName() }}</p>

      <div class="button-group">
        <button (click)="themeService.setLightTheme()"
          [disabled]="themeService.getSelectedTheme() === 'light'">
          ☀️ Claro
        </button>
        <button (click)="themeService.setDarkTheme()"
          [disabled]="themeService.getSelectedTheme() === 'dark'">
          🌙 Oscuro
        </button>
        <button (click)="themeService.setSystemTheme()"
          [disabled]="themeService.getSelectedTheme() === 'system'">
          💻 Sistema
        </button>
      </div>
    </div>
  `,
  styles: [`
    .info-box {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all 300ms ease;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }

    button {
      background-color: #2563eb;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    button:hover:not(:disabled) {
      background-color: #1d4ed8;
    }

    button:disabled {
      background-color: #cbd5e1;
      cursor: not-allowed;
      opacity: 0.6;
    }
  `]
})
export class ExampleComputedComponent {
  themeService = inject(ThemeService);

  // Computed signals - se actualizan automáticamente
  themeIcon = computed(() =>
    this.themeService.isDarkMode() ? '🌙' : '☀️'
  );

  themeName = computed(() => {
    const selected = this.themeService.getSelectedTheme();
    return selected === 'light' ? 'Claro' :
      selected === 'dark' ? 'Oscuro' : 'Sistema';
  });

  themeDescription = computed(() => {
    const isDark = this.themeService.isDarkMode();
    return isDark
      ? 'Interfaz oscura para reducir cansancio visual'
      : 'Interfaz clara para máxima claridad';
  });
}

// ============================================================================
// EJEMPLO 4: Escuchar Cambios de Tema
// ============================================================================

@Component({
  selector: 'app-example-listener',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-box">
      <h3>Escuchar Cambios de Tema</h3>

      <p>Última vez que cambió el tema:</p>
      <p class="timestamp">{{ lastThemeChange() }}</p>

      <p>Total de cambios: {{ changeCount() }}</p>

      <button (click)="themeService.toggleTheme()">
        Cambiar Tema (observa el timestamp)
      </button>
    </div>
  `,
  styles: [`
    .event-box {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all 300ms ease;
    }

    .timestamp {
      font-family: monospace;
      background-color: var(--bg-primary);
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
      color: var(--text-secondary);
    }

    button {
      background-color: #2563eb;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 10px;
    }

    button:hover {
      background-color: #1d4ed8;
    }
  `]
})
export class ExampleListenerComponent implements OnDestroy {
  themeService = inject(ThemeService);

  lastThemeChange = signal<string>('Nunca');
  changeCount = signal<number>(0);

  private themeChangeHandler = (event: Event) => {
    const customEvent = event as CustomEvent<{ theme: string; effectiveTheme: string }>;
    const now = new Date();
    this.lastThemeChange.set(now.toLocaleTimeString());
    this.changeCount.update(count => count + 1);
    // console.log('Tema cambió:', customEvent.detail);
  };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('theme-changed', this.themeChangeHandler);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('theme-changed', this.themeChangeHandler);
    }
  }
}

// ============================================================================
// EJEMPLO 5: Integración con Componente de Configuración
// ============================================================================

@Component({
  selector: 'app-example-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-panel">
      <h3>⚙️ Panel de Configuración</h3>

      <div class="setting-group">
        <label>Preferencia de Tema</label>
        <select [value]="themeService.getSelectedTheme()"
          (change)="onThemeChange($event)">
          <option value="light">☀️ Claro</option>
          <option value="dark">🌙 Oscuro</option>
          <option value="system">💻 Sistema</option>
        </select>
      </div>

      <div class="setting-info">
        <p>Tema efectivo: <strong>{{ themeService.getEffectiveDarkMode() === 'dark' ? 'Oscuro' : 'Claro' }}</strong></p>
        <p>Almacenado en localStorage: <code>{{ themeService.getSelectedTheme() }}</code></p>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      max-width: 400px;
    }

    .setting-group {
      margin: 15px 0;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
    }

    select {
      width: 100%;
      padding: 10px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      font-size: 1rem;
      cursor: pointer;
    }

    select:hover {
      border-color: #2563eb;
    }

    .setting-info {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid var(--border-color);
    }

    code {
      background-color: var(--bg-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
    }
  `]
})
export class ExampleSettingsComponent {
  themeService = inject(ThemeService);

  onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    if (value === 'light') {
      this.themeService.setLightTheme();
    } else if (value === 'dark') {
      this.themeService.setDarkTheme();
    } else {
      this.themeService.setSystemTheme();
    }
  }
}

// ============================================================================
// EJEMPLO 6: Estilos Avanzados con CSS Variables
// ============================================================================

@Component({
  selector: 'app-example-advanced-styles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="advanced-card">
      <h3>Estilos Avanzados</h3>

      <div class="gradient-box">
        <p>Gradiente que cambia con el tema</p>
      </div>

      <div class="shadow-box">
        <p>Sombra que se adapta al tema</p>
      </div>

      <div class="border-box">
        <p>Bordes dinámicos</p>
      </div>
    </div>
  `,
  styles: [`
    .advanced-card {
      padding: 20px;
      border-radius: 8px;
    }

    .gradient-box {
      background: linear-gradient(135deg, var(--table-header-start), var(--table-header-end));
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      transition: background 300ms ease;
    }

    .shadow-box {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border-radius: 8px;
      margin: 15px 0;
      box-shadow: 0 20px 45px -30px var(--shadow-color);
      transition: box-shadow 300ms ease;
    }

    .border-box {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      padding: 20px;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      transition: all 300ms ease;
    }
  `]
})
export class ExampleAdvancedStylesComponent { }

// ============================================================================
// EJEMPLO DE EXPOSICIÓN (Mostrar Todos)
// ============================================================================

@Component({
  selector: 'app-examples-all',
  standalone: true,
  imports: [
    CommonModule,
    ExampleBasicComponent,
    ExampleConditionalComponent,
    ExampleComputedComponent,
    ExampleListenerComponent,
    ExampleSettingsComponent,
    ExampleAdvancedStylesComponent
  ],
  template: `
    <div class="examples-container">
      <h1>📚 Ejemplos de Uso del Servicio de Temas</h1>

      <app-example-basic></app-example-basic>
      <app-example-conditional></app-example-conditional>
      <app-example-computed></app-example-computed>
      <app-example-listener></app-example-listener>
      <app-example-settings></app-example-settings>
      <app-example-advanced-styles></app-example-advanced-styles>
    </div>
  `,
  styles: [`
    .examples-container {
      padding: 40px 20px;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 40px;
      text-align: center;
    }

    :host ::ng-deep app-example-basic,
    :host ::ng-deep app-example-conditional,
    :host ::ng-deep app-example-computed,
    :host ::ng-deep app-example-listener,
    :host ::ng-deep app-example-settings,
    :host ::ng-deep app-example-advanced-styles {
      display: block;
      margin-bottom: 30px;
    }
  `]
})
export class ExamplesAllComponent { }
