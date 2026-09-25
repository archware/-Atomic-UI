import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type LinkVariant = 'primary' | 'secondary' | 'muted' | 'danger';

@Component({
  selector: 'app-link',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './link.component.html',
  styleUrl: './link.component.css'
})
export class LinkComponent {
  readonly href = input<string>();
  readonly routerLink = input<string | any[]>();
  readonly target = input<string>('_self');
  readonly variant = input<LinkVariant>('primary');
  readonly ariaLabel = input<string>();
  readonly rel = input<string>();
}
