import { Component, inject } from '@angular/core';

import { ThemeService } from '../../services/theme.service';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [IconButtonComponent],
  template: `
    <div class="theme-switcher">
      <!-- Botón de alternancia simple Light/Dark -->
      <app-icon-button
        (clicked)="toggleTheme($event)"
        [tooltip]="themeService.isDarkMode() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
      >
        <!-- Ícono Sol (tema claro) - visible cuando está en modo oscuro -->
        <i class="fa-solid fa-sun icon icon-sun" [class.hidden]="themeService.isDarkMode()"></i>

        <!-- Ícono Luna (tema oscuro) - visible cuando está en modo claro -->
        <i class="fa-solid fa-moon icon icon-moon" [class.hidden]="!themeService.isDarkMode()"></i>
      </app-icon-button>
    </div>
  `,
  styleUrl: './theme-switcher.component.css',
  host: {
    '[attr.data-theme-switcher]': 'true'
  }
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);

  /**
   * Alterna entre tema claro (light) y oscuro corporativo (brand-dark).
   * Captura la posición del click para el circle-reveal de View Transitions.
   */
  toggleTheme(event?: MouseEvent): void {
    if (event) {
      this.themeService.setTransitionOrigin(event.clientX, event.clientY);
    }
    if (this.themeService.isDarkMode()) {
      this.themeService.setLightTheme();
    } else {
      this.themeService.setDarkTheme();
    }
  }
}
