import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, IconButtonComponent],
  template: `
    <div class="theme-switcher">
      <!-- Botón de alternancia simple Light/Dark -->
      <app-icon-button
        (clicked)="toggleTheme()"
        [tooltip]="themeService.isDarkMode() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      >
        <!-- Ícono Sol (tema claro) - visible cuando está en modo oscuro -->
        <i class="fa-solid fa-sun icon icon-sun" [class.hidden]="themeService.isDarkMode()"></i>

        <!-- Ícono Luna (tema oscuro) - visible cuando está en modo claro -->
        <i class="fa-solid fa-moon icon icon-moon" [class.hidden]="!themeService.isDarkMode()"></i>
      </app-icon-button>
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
      transition: color 200ms ease, transform 200ms ease;
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

    /* Hover effect */
    :host:hover .icon-sun {
      transform: rotate(15deg);
    }

    :host:hover .icon-moon {
      transform: rotate(-10deg);
    }
  `],
  host: {
    '[attr.data-theme-switcher]': 'true'
  }
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  /**
   * Alterna entre tema claro (light) y oscuro corporativo (brand-dark)
   */
  toggleTheme(): void {
    if (this.themeService.isDarkMode()) {
      this.themeService.setLightTheme();
    } else {
      this.themeService.setBrandDarkTheme();
    }
  }
}

