import { Component, signal, ChangeDetectionStrategy, input, output, effect, untracked } from '@angular/core';

export interface Step {
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './stepper.component.css',
    templateUrl: './stepper.component.html'
})
export class StepperComponent {
  readonly steps = input<Step[]>([]);
  readonly allowSkip = input(false);
  readonly vertical = input(false);
  // La señal interna conserva `activeStep` y delega en el setter que mantiene `currentStep`.
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly entradaPasoActivo = input(0, { alias: 'activeStep' });
  set activeStep(value: number) {
    this.currentStep.set(value);
  }
  readonly stepChange = output<number>();

  currentStep = signal(0);
  private readonly sincronizarPasoActivo = effect(() => {
    const paso = this.entradaPasoActivo();
    untracked(() => {
      this.activeStep = paso;
    });
  });

  goToStep(index: number) {
    if (index <= this.currentStep() || this.allowSkip()) {
      this.currentStep.set(index);
      this.stepChange.emit(index);
    }
  }

  next() {
    if (this.currentStep() < this.steps().length - 1) {
      this.currentStep.update(v => v + 1);
      this.stepChange.emit(this.currentStep());
    }
  }

  previous() {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
      this.stepChange.emit(this.currentStep());
    }
  }

  /** Ir al primer paso */
  reset() {
    this.currentStep.set(0);
    this.stepChange.emit(0);
  }
}
