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
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  /** Lista de ítems de navegación */
  readonly items = input<BreadcrumbItem[]>([]);

  /** Separador entre ítems */
  readonly separator = input('/');
}
