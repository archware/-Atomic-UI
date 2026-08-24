import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { VariablesCssDirective } from '../../directives/variables-css.directive';

export interface AvatarGroupItem {
  name: string;
  initials?: string;
  photo?: string;
  color?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  tooltip?: string;
}

/**
 * AvatarGroupComponent — Stack de avatares superpuestos.
 * Muestra los primeros `max` avatares y un contador "+N" si hay más.
 *
 * @example
 * ```html
 * <app-avatar-group [items]="collaborators" [max]="4" size="sm"></app-avatar-group>
 * ```
 */
@Component({
  selector: 'app-avatar-group',
  standalone: true,
  imports: [AvatarComponent, VariablesCssDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avatar-group" [class]="'avatar-group-' + size()">
      @for (item of visible; track item.name; let i = $index) {
        <div
          class="avatar-group-item"
          [appVariablesCss]="{ '--avatar-stack-order': visible.length - i }"
          [title]="item.tooltip || item.name"
        >
          <app-avatar
            [initials]="item.initials || getInitials(item.name)"
            [src]="item.photo"
            [status]="item.status"
            [size]="size()"
            [color]="item.color"
          ></app-avatar>
        </div>
      }
      @if (overflow > 0) {
        <div class="avatar-group-item avatar-group-overflow" [title]="'+' + overflow + ' más'">
          <div class="overflow-badge" [class]="'overflow-' + size()">+{{ overflow }}</div>
        </div>
      }
    </div>
  `,
  styleUrl: './avatar-group.component.css'
})
export class AvatarGroupComponent {
  /** Lista completa de avatares */
  readonly items = input<AvatarGroupItem[]>([]);

  /** Máximo de avatares visibles antes de mostrar contador */
  readonly max = input(5);

  /** Tamaño de los avatares */
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  get visible(): AvatarGroupItem[] {
    return this.items().slice(0, this.max());
  }

  get overflow(): number {
    return Math.max(0, this.items().length - this.max());
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}
