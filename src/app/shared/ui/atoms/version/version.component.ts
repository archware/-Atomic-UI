import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type VersionVariant = 'pill' | 'badge' | 'text' | 'compact';

/**
 * Reusable version indicator component for footers, topbars, and application info panels.
 *
 * La visibilidad la dan los tokens del tema, no colores fijos. La promesa
 * anterior -«visible en todos los temas gracias a colores solidos de respaldo»-
 * era exactamente al reves: el slate oscuro y el texto blanco estaban escritos a
 * mano, asi que la chapa se pintaba oscura sobre el pie claro donde de verdad
 * se usa. Un color quemado no sobrevive al cambio de tema; lo unico que lo
 * sobrevive es el token.
 */
@Component({
  selector: 'app-version',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './version.component.html',
  styleUrl: './version.component.css'
})
export class VersionComponent {
  readonly version = input('v1.1.0');
  readonly appName = input('');
  readonly environment = input('BETA');
  readonly variant = input<VersionVariant>('badge');
  readonly showBuildDate = input(false);
  readonly buildDate = input('');
}
