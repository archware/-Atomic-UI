import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusBadgeStatus =
  'active' | 'inactive' | 'degraded' | 'unconfigured' | 'info' | 'success' | 'warning' | 'danger';
export type StatusBadgeChannel = 'web' | 'telegram' | 'sms';
export type StatusBadgeSize = 'sm' | 'md';

const STATUS_LABELS: Readonly<Record<StatusBadgeStatus, string>> = {
  active: 'Activo',
  inactive: 'Inactivo',
  degraded: 'Con incidencias',
  unconfigured: 'Sin configurar',
  info: 'Informativo',
  success: 'Correcto',
  warning: 'Advertencia',
  danger: 'Crítico',
};

const CHANNELS: Readonly<
  Record<StatusBadgeChannel, { readonly label: string; readonly iconClass: string }>
> = {
  web: { label: 'WEB', iconClass: 'fa-solid fa-globe' },
  telegram: { label: 'TELEGRAM', iconClass: 'fa-brands fa-telegram' },
  sms: { label: 'SMS', iconClass: 'fa-solid fa-comment-sms' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.css',
})
export class StatusBadgeComponent {
  readonly status = input<StatusBadgeStatus>('unconfigured');
  readonly channel = input<StatusBadgeChannel | null>(null);
  readonly size = input<StatusBadgeSize>('md');
  readonly label = input('');
  readonly ariaLabel = input('');
  readonly announce = input(false);

  get statusLabel(): string {
    return this.label().trim() || STATUS_LABELS[this.status()];
  }

  get channelDefinition(): (typeof CHANNELS)[StatusBadgeChannel] | null {
    const channel = this.channel();
    return channel ? CHANNELS[channel] : null;
  }

  get computedAriaLabel(): string {
    const ariaLabel = this.ariaLabel();
    if (ariaLabel.trim()) {
      return ariaLabel.trim();
    }
    return this.channelDefinition
      ? `${this.channelDefinition.label}: ${this.statusLabel}`
      : this.statusLabel;
  }
}
