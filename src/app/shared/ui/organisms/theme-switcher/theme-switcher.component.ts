import { Component, inject } from '@angular/core';

import { ThemeService } from '../../services/theme.service';

import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [IconButtonComponent],
  styleUrl: './theme-switcher.component.css',
  host: {
    '[attr.data-theme-switcher]': 'true'
  },
    templateUrl: './theme-switcher.component.html'
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
