import { DestroyRef, inject, Injectable, effect, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'brand-dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly THEME_STORAGE_KEY = 'app-theme';
  private readonly DARK_CLASS = 'dark';

  // Signal para el tema seleccionado
  private readonly selectedTheme = signal<Theme>(this.getInitialTheme());

  // Signal para el tema efectivo (light, dark, o brand-dark)
  private readonly effectiveTheme = signal<'light' | 'dark' | 'brand-dark'>(this.getEffectiveTheme());

  // Signal para saber si está en dark mode actualmente (cualquier variante oscura)
  readonly isDarkMode = signal<boolean>(
    this.effectiveTheme() === 'dark' || this.effectiveTheme() === 'brand-dark'
  );

  constructor() {
    // Aplicar tema inicial inmediatamente
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.applyTheme(this.selectedTheme());
    }

    // Efecto: aplicar tema cuando cambia
    effect(() => {
      const theme = this.selectedTheme();
      this.applyTheme(theme);
      this.effectiveTheme.set(this.getEffectiveTheme());
      const effective = this.effectiveTheme();
      this.isDarkMode.set(effective === 'dark' || effective === 'brand-dark');
    });

    // Escuchar cambios en preferencia del SO
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (this.selectedTheme() === 'system') {
          this.effectiveTheme.set(this.getEffectiveTheme());
          const effective = this.effectiveTheme();
          this.isDarkMode.set(effective === 'dark' || effective === 'brand-dark');
          this.applyTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleChange);

      // Cleanup cuando el servicio se destruye
      this.destroyRef.onDestroy(() => {
        mediaQuery.removeEventListener('change', handleChange);
      });
    }
  }

  /**
   * Obtiene el tema inicial del localStorage o del SO
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';

    const stored = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'brand-dark', 'system'].includes(stored)) {
      return stored;
    }

    return 'system';
  }

  /**
   * Obtiene el tema efectivo considerando preferencia del SO
   */
  private getEffectiveTheme(): 'light' | 'dark' | 'brand-dark' {
    if (typeof window === 'undefined') return 'light';

    const selected = this.selectedTheme();

    if (selected === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    return selected;
  }

  /**
   * Aplica el tema en el DOM y localStorage
   */
  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const htmlElement = document.documentElement;
    let effectiveTheme: 'light' | 'dark' | 'brand-dark';

    if (theme === 'system') {
      effectiveTheme = this.getEffectiveTheme();
    } else {
      effectiveTheme = theme;
    }

    // Add transitioning class for smooth animation
    htmlElement.classList.add('theme-transitioning');

    // Apply theme class and attribute
    if (effectiveTheme === 'dark') {
      htmlElement.classList.add(this.DARK_CLASS);
      htmlElement.setAttribute('data-theme', 'dark');
    } else if (effectiveTheme === 'brand-dark') {
      htmlElement.classList.add(this.DARK_CLASS); // Also add .dark class for basic tailwind/css dark util support if used
      htmlElement.setAttribute('data-theme', 'brand-dark');
    } else {
      htmlElement.classList.remove(this.DARK_CLASS);
      htmlElement.setAttribute('data-theme', 'light');
    }

    // Remove transitioning class after animation completes
    requestAnimationFrame(() => {
      setTimeout(() => {
        htmlElement.classList.remove('theme-transitioning');
      }, 150); // Match CSS transition duration
    });

    // Save to localStorage
    localStorage.setItem(this.THEME_STORAGE_KEY, theme);
  }

  /**
   * Cambiar a tema claro
   */
  setLightTheme(): void {
    this.selectedTheme.set('light');
  }

  /**
   * Cambiar a tema oscuro
   */
  setDarkTheme(): void {
    this.selectedTheme.set('dark');
  }

  /**
   * Cambiar a tema oscuro (Corporativo)
   */
  setBrandDarkTheme(): void {
    this.selectedTheme.set('brand-dark');
  }

  /**
   * Usar preferencia del SO
   */
  setSystemTheme(): void {
    this.selectedTheme.set('system');
  }

  /**
   * Alternar entre claro y oscuro (por defecto alterna a brand-dark si no es standard)
   */
  toggleTheme(): void {
    if (this.isDarkMode()) {
      this.setLightTheme();
    } else {
      this.setBrandDarkTheme(); // Default to brand dark on toggle
    }
  }

  /**
   * Obtener el tema seleccionado
   */
  getSelectedTheme(): Theme {
    return this.selectedTheme();
  }

  /**
   * Obtener el tema efectivo
   */
  getEffectiveDarkMode(): 'light' | 'dark' | 'brand-dark' {
    return this.effectiveTheme();
  }
}
