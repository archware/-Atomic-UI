import { Component, signal, ChangeDetectionStrategy, input, output, effect, untracked } from '@angular/core';

export interface Step {
  readonly id?: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: string;
  readonly optional?: boolean;
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
  readonly disabled = input(false);
  readonly maxReachableStep = input<number | null>(null);
  readonly accessibleLabel = input('Progreso del formulario');
  readonly idPrefix = input('stepper');

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

  // --- Methods from prestamo_front_atomic ---
  public isActive(index: number): boolean {
    return index === this.currentStep();
  }

  public isCompleted(index: number): boolean {
    return index < this.currentStep();
  }

  public isStepDisabled(index: number): boolean {
    if (this.disabled()) {
      return true;
    }
    const reachableStep = Math.max(this.currentStep(), this.maxReachableStep() ?? this.currentStep());
    return !this.allowSkip() && index > reachableStep;
  }

  public stepId(step: Step, index: number): string {
    return `${this.idPrefix()}-step-${step.id || index}`;
  }

  public panelId(step: Step, index: number): string {
    return `${this.idPrefix()}-panel-${step.id || index}`;
  }

  public statusText(index: number): string {
    const position = `Paso ${index + 1} de ${this.steps().length}.`;
    if (this.isActive(index)) {
      return `${position} Paso actual.`;
    }
    if (this.isCompleted(index)) {
      return `${position} Paso completado.`;
    }
    if (this.isStepDisabled(index)) {
      return `${position} Paso pendiente.`;
    }
    return `${position} Paso disponible.`;
  }

  public selectStep(index: number): void {
    if (!this.isStepDisabled(index)) {
      this.goToStep(index);
    }
  }
}
