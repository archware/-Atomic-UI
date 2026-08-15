import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ChoiceControlType = 'checkbox' | 'radio';

/** Checkbox o radio controlado con etiqueta y foco visibles. */
@Component({
  selector: 'app-choice-control, prest-choice-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.choice-control--checked]': 'checked()',
    '[class.choice-control--disabled]': 'disabled()',
  },
  templateUrl: './choice-control.html',
  styleUrl: './choice-control.scss',
})
export class ChoiceControl {
  private static nextId = 0;
  private readonly generatedId = `prest-choice-${++ChoiceControl.nextId}`;

  readonly controlId = input<string | null>(null);
  readonly type = input<ChoiceControlType>('checkbox');
  readonly label = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly value = input('');
  readonly checked = input(false);
  readonly disabled = input(false);
  /*
    UN CONTROL QUE NO PUEDE DECIR QUE ESTA MAL DEJA A LA PERSONA ADIVINANDO.

    Sin esto, una casilla obligatoria sin marcar hacia que el formulario se
    negara a enviarse EN SILENCIO: ni mensaje, ni marca roja, ni foco. Y peor:
    las rutinas que llevan el foco al primer campo invalido buscan
    `input.ng-invalid` o `[aria-invalid="true"]`, asi que sin `aria-invalid` este
    control era invisible para ellas y el foco no iba a ninguna parte.

    El mensaje se anuncia con `role="alert"` porque aparece despues de que la
    persona ya intento enviar: si no se anuncia, quien usa lector de pantalla se
    queda con un boton que no responde.
  */
  readonly error = input<string | null>(null);

  readonly changed = output<boolean>();

  protected readonly id = computed(() => this.controlId() ?? this.generatedId);
  protected readonly accessibleLabel = computed(() => this.ariaLabel() ?? (this.label() || null));
  protected readonly hasError = computed(() => Boolean(this.error()));
  protected readonly errorId = computed(() => `${this.id()}-error`);

  protected handleChange(event: Event): void {
    this.changed.emit((event.target as HTMLInputElement).checked);
  }
}
