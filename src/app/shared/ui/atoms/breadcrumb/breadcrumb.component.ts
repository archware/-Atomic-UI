import { Component, ChangeDetectionStrategy, input } from '@angular/core';


export interface BreadcrumbItem {
  label: string;
  /** Ruta o URL. Si se omite, el ítem se renderiza como texto (último nivel). */
  route?: string;
  icon?: string;
}

/**
 * BreadcrumbComponent — Rastro de navegación jerárquica.
 *
 * @example
 * ```html
 * <app-breadcrumb [items]="[
 *   { label: 'Inicio', route: '/' },
 *   { label: 'Usuarios', route: '/usuarios' },
 *   { label: 'Perfil' }
 * ]"></app-breadcrumb>
 * ```
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb-list">
        @for (item of items(); track item.label; let last = $last) {
          <li class="breadcrumb-item" [class.breadcrumb-item--active]="last">
            @if (!last && item.route) {
              <a class="breadcrumb-link" [href]="item.route">
                @if (item.icon) {
                  <i [class]="item.icon" class="breadcrumb-icon" aria-hidden="true"></i>
                }
                {{ item.label }}
              </a>
            } @else {
              <span class="breadcrumb-text" [attr.aria-current]="last ? 'page' : null">
                @if (item.icon) {
                  <i [class]="item.icon" class="breadcrumb-icon" aria-hidden="true"></i>
                }
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <span class="breadcrumb-separator" aria-hidden="true">
                {{ separator() }}
              </span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  /** Lista de ítems de navegación */
  readonly items = input<BreadcrumbItem[]>([]);

  /** Separador entre ítems */
  readonly separator = input('/');
}
