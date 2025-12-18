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
          title="Tema Oscuro"
        >
          <i class="fa-solid fa-moon option-icon"></i>
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
      font-size: 1.25rem;
      width: auto;
      height: auto;
      transition: color 200ms ease;
    }

    .icon-sun {
      color: #f59e0b;
      filter: drop-shadow(0 0 2px rgba(245, 158, 11, 0.3));
    }

    :host-context(.dark) .icon-sun,
    :host-context(html.dark) .icon-sun,
    :host-context([data-theme="dark"]) .icon-sun {
      color: #fbbf24;
      filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.4));
    }

    .icon-moon {
      color: #6366f1;
      filter: drop-shadow(0 0 2px rgba(99, 102, 241, 0.3));
    }

    :host-context(.dark) .icon-moon,
    :host-context(html.dark) .icon-moon,
    :host-context([data-theme="dark"]) .icon-moon {
      color: #a5b4fc;
      filter: drop-shadow(0 0 4px rgba(165, 180, 252, 0.4));
    }

    .icon.hidden {
      display: none;
    }

    /* ========== MENÚ DESPLEGABLE ========== */
    .theme-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--surface-background, #ffffff);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
                  0 8px 10px -6px rgba(0, 0, 0, 0.1);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 200ms ease;
      z-index: 1000;
      overflow: hidden;
    }

    :host-context(.dark) .theme-menu,
    :host-context(html.dark) .theme-menu,
    :host-context([data-theme="dark"]) .theme-menu {
      background: var(--surface-section, #1f2937);
      border-color: var(--border-color, #374151);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4),
                  0 8px 10px -6px rgba(0, 0, 0, 0.3);
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
      color: var(--text-color-secondary, #6b7280);
      cursor: pointer;
      transition: all 150ms ease;
      position: relative;
    }

    :host-context(.dark) .theme-option,
    :host-context(html.dark) .theme-option,
    :host-context([data-theme="dark"]) .theme-option {
      color: var(--text-color-secondary, #9ca3af);
    }

    .theme-option:hover {
      background: var(--surface-elevated, #f3f4f6);
    }

    :host-context(.dark) .theme-option:hover,
    :host-context(html.dark) .theme-option:hover,
    :host-context([data-theme="dark"]) .theme-option:hover {
      background: var(--surface-elevated, #374151);
    }

    .theme-option.active {
      background: var(--primary-color-lighter, #efe7ef);
    }

    :host-context(.dark) .theme-option.active,
    :host-context(html.dark) .theme-option.active,
    :host-context([data-theme="dark"]) .theme-option.active {
      background: rgba(188, 154, 187, 0.2);
    }

    .option-icon {
      width: 1.125rem;
      height: 1.125rem;
      transition: transform 150ms ease;
    }

    /* Colores de iconos */
    .theme-option:first-child .option-icon {
      color: #f59e0b;
    }

    :host-context(.dark) .theme-option:first-child .option-icon,
    :host-context(html.dark) .theme-option:first-child .option-icon,
    :host-context([data-theme="dark"]) .theme-option:first-child .option-icon {
      color: #fcd34d;
      filter: drop-shadow(0 0 6px rgba(252, 211, 77, 0.7))
              drop-shadow(0 0 12px rgba(252, 211, 77, 0.4));
    }

    .theme-option:nth-child(2) .option-icon {
      color: #6366f1;
    }

    :host-context(.dark) .theme-option:nth-child(2) .option-icon,
    :host-context(html.dark) .theme-option:nth-child(2) .option-icon,
    :host-context([data-theme="dark"]) .theme-option:nth-child(2) .option-icon {
      color: #c7d2fe;
      filter: drop-shadow(0 0 6px rgba(199, 210, 254, 0.7))
              drop-shadow(0 0 12px rgba(199, 210, 254, 0.4));
    }

    .theme-option:nth-child(3) .option-icon {
      color: var(--primary-color, #793576);
    }

    :host-context(.dark) .theme-option:nth-child(3) .option-icon,
    :host-context(html.dark) .theme-option:nth-child(3) .option-icon,
    :host-context([data-theme="dark"]) .theme-option:nth-child(3) .option-icon {
      color: #f0d4ef;
      filter: drop-shadow(0 0 6px rgba(240, 212, 239, 0.7))
              drop-shadow(0 0 12px rgba(240, 212, 239, 0.4));
    }

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
      background: var(--primary-color, #793576);
      border-radius: 0 2px 2px 0;
    }

    :host-context(.dark) .theme-option.active::before,
    :host-context(html.dark) .theme-option.active::before,
    :host-context([data-theme="dark"]) .theme-option.active::before {
      background: var(--primary-color-light, #bc9abb);
    }

    /* Separadores sutiles */
    .theme-option:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.5rem;
      right: 0.5rem;
      height: 1px;
      background: var(--border-color-light, #f3f4f6);
    }

    :host-context(.dark) .theme-option:not(:last-child)::after,
    :host-context(html.dark) .theme-option:not(:last-child)::after,
    :host-context([data-theme="dark"]) .theme-option:not(:last-child)::after {
      background: var(--border-color, #374151);
    }
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
