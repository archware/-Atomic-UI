export type ConfirmDialogInitialFocus = 'cancel' | 'confirm';
export type ConfirmDialogTone = 'default' | 'warning' | 'danger';
export type ConfirmDialogCloseReason =
  | 'confirmed'
  | 'cancelled'
  | 'escape'
  | 'backdrop'
  | 'dismissed';

export interface ConfirmDialogOptions {
  readonly id?: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly tone?: ConfirmDialogTone;
  readonly initialFocus?: ConfirmDialogInitialFocus;
  readonly closeOnEscape?: boolean;
  readonly closeOnBackdrop?: boolean;
  readonly headerAlign?: 'start' | 'center';
}

export interface ConfirmDialogResult {
  readonly id: string;
  readonly confirmed: boolean;
  readonly reason: ConfirmDialogCloseReason;
}

export interface ConfirmDialogViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly tone: ConfirmDialogTone;
  readonly initialFocus: ConfirmDialogInitialFocus;
  readonly closeOnEscape: boolean;
  readonly closeOnBackdrop: boolean;
  readonly headerAlign: 'start' | 'center';
}
