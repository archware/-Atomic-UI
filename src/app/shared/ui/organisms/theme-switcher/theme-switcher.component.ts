import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, type Theme } from '../../services/theme.service';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  template: `
    <div class="theme-switcher" [attr.data-theme]="themeService.getSelectedTheme()">
      <!-- Botón principal de alternancia -->
      <app-icon-button
        (clicked)="toggleMenu()"
        [tooltip]="themeService.isDarkMode() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      >
        <!-- Ícono Sol (tema claro) -->
        <i class="fa-solid fa-sun icon icon-sun" [class.hidden]="themeService.isDarkMode()"></i>

        <!-- Ícono Luna (tema oscuro) -->
        <i class="fa-solid fa-moon icon icon-moon" [class.hidden]="!themeService.isDarkMode()"></i>
      </app-icon-button>

      <!-- Menú desplegable de opciones -->
      <div class="theme-menu" [class.show]="menuOpen()">
        <button
          class="theme-option"
          [class.active]="themeService.getSelectedTheme() === 'light'"
          (click)="selectTheme('light')"
          title="Tema Claro"
        >
          <i class="fa-solid fa-sun option-icon"></i>
        </button>

        <button
          class="theme-option"
          [class.active]="themeService.getSelectedTheme() === 'dark'"
          (click)="selectTheme('dark')"
          title="Tema Oscuro Estándar"
        >
          <i class="fa-solid fa-moon option-icon"></i>
        </button>

        <button
          class="theme-option"
          [class.active]="themeService.getSelectedTheme() === 'brand-dark'"
          (click)="selectTheme('brand-dark')"
          title="Tema Oscuro Corporativo"
        >
          <!-- Using star for "Premium/Brand" -->
          <i class="fa-solid fa-star option-icon"></i>
        </button>

        <button
          class="theme-option"
          [class.active]="themeService.getSelectedTheme() === 'system'"
          (click)="selectTheme('system')"
          title="Según Sistema"
        >
          <i class="fa-solid fa-desktop option-icon"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-switcher {
      position: relative;
      display: inline-block;
    }

    /* ========== ICONOS ========== */
    .icon {
      font-size: var(--text-xl);
      width: auto;
      height: auto;
      transition: color 200ms ease;
    }

    .icon-sun {
      color: var(--icon-sun-color);
      filter: drop-shadow(0 0 2px var(--shadow-glow-primary));
    }

    .icon-moon {
      color: var(--icon-moon-color);
      filter: drop-shadow(0 0 2px var(--shadow-glow-primary));
    }

    .icon.hidden {
      display: none;
    }

    /* ========== MENÚ DESPLEGABLE ========== */
    .theme-menu {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      background: var(--surface-background);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 200ms ease;
      z-index: 1000;
      overflow: hidden;
    }

    .theme-menu.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* ========== OPCIONES DE TEMA ========== */
    .theme-option {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--text-color-secondary);
      cursor: pointer;
      transition: all 150ms ease;
      position: relative;
    }

    .theme-option:hover {
      background: var(--surface-hover);
    }

    .theme-option.active {
      background: var(--primary-color-lighter);
    }

    .option-icon {
      width: 1.125rem;
      height: 1.125rem;
      transition: transform 150ms ease;
    }

    /* Colores de iconos usando tokens */
    .theme-option:nth-child(1) .option-icon { color: var(--icon-sun-color); }
    .theme-option:nth-child(2) .option-icon { color: var(--icon-moon-color); }
    .theme-option:nth-child(3) .option-icon { color: var(--icon-star-color); }
    .theme-option:nth-child(4) .option-icon { color: var(--icon-moon-color); }

    /* Hover transforms */
    .theme-option:first-child:hover .option-icon {
      transform: rotate(30deg);
    }

    .theme-option:nth-child(2):hover .option-icon {
      transform: rotate(-10deg);
    }

    .theme-option:nth-child(3):hover .option-icon {
      transform: scale(1.1);
    }

    /* Active state indicator */
    .theme-option.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: var(--primary-color);
      border-radius: 0 2px 2px 0;
    }

    /* Separadores sutiles */
    .theme-option:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: var(--space-2);
      right: var(--space-2);
      height: 1px;
      background: var(--border-color-light);
    }

    /* 
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --surface-background, --shadow-dropdown, --primary-color
     * ya tienen valores apropiados para temas oscuros.
     * 
     * Los efectos de glow en iconos son específicos del diseño del tema
     * y se mantienen con :host-context para efectos visuales únicos.
     */
  `],
  host: {
    '[attr.data-theme-switcher]': 'true'
  }
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);
  menuOpen = signal(false);

  selectTheme(theme: Theme): void {
    if (theme === 'light') {
      this.themeService.setLightTheme();
    } else if (theme === 'dark') {
      this.themeService.setDarkTheme();
    } else {
      this.themeService.setSystemTheme();
    }
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }
}
