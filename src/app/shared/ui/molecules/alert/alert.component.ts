/**
 * Alert unificado.
 */
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

export type AlertKind = 'info' | 'success' | 'warning' | 'danger';
export type AlertSpacing = 'default' | 'compact' | 'none';

@Component({
  selector: 'app-alert, prest-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div
        class="alert"
        [class]="classes()"
        [attr.role]="kind() === 'danger' ? 'alert' : 'status'"
        [attr.aria-live]="kind() === 'danger' ? 'assertive' : 'polite'"
      >
        @if (kind() === 'info') {
          <i class="fa-solid fa-circle-info alert__icon" aria-hidden="true"></i>
        } @else if (kind() === 'success') {
          <i class="fa-solid fa-circle-check alert__icon" aria-hidden="true"></i>
        } @else if (kind() === 'warning') {
          <i class="fa-solid fa-triangle-exclamation alert__icon" aria-hidden="true"></i>
        } @else if (kind() === 'danger') {
          <span class="close blades heavy alert__icon" aria-hidden="true"></span>
        }

        <div class="alert__body">
          @if (title()) {
            <strong class="alert__title">{{ title() }}</strong>
          }
          <div class="alert__message"><ng-content /></div>
        </div>

        @if (closable()) {
          <app-icon-button class="alert__close" ariaLabel="Cerrar mensaje" (clicked)="close()" variant="close" animation="none" />
        }
      </div>
    }
  `,
  styleUrl: './alert.scss',
  imports: [IconButtonComponent],
  host: {
    '[class.alert-flow--default]': "spacing() === 'default'",
    '[class.alert-flow--compact]': "spacing() === 'compact'",
    '[class.alert-flow--none]': "spacing() === 'none'",
  },
})
export class Alert {
  readonly kind = input<AlertKind>('info');
  readonly title = input('');
  readonly closable = input(false);
  readonly spacing = input<AlertSpacing>('default');
  readonly closed = output<void>();

  protected readonly visible = signal(true);
  protected readonly classes = computed(() => `alert alert--${this.kind()}`);

  protected close(): void {
    this.visible.set(false);
    this.closed.emit();
  }
}
