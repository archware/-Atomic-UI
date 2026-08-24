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
  template: `
    <div class="stepper" [class.stepper-vertical]="vertical()" role="navigation" aria-label="Progreso">
      @for (step of steps(); track step.label; let i = $index) {
        <div
          class="step"
          [class.completed]="i < currentStep()"
          [class.active]="i === currentStep()"
          [class.disabled]="i > currentStep() && !allowSkip()"
          (click)="goToStep(i)"
          (keydown.enter)="goToStep(i)"
          (keydown.space)="goToStep(i)"
          [attr.aria-current]="i === currentStep() ? 'step' : null"
          role="button"
          tabindex="0"
        >
          <div class="step-indicator">
            @if (i < currentStep()) {
              <span class="step-check" aria-hidden="true">✓</span>
            } @else if (step.icon) {
              <span class="step-icon" aria-hidden="true">{{ step.icon }}</span>
            } @else {
              <span class="step-number">{{ i + 1 }}</span>
            }
          </div>
          <div class="step-content">
            <span class="step-label">{{ step.label }}</span>
            @if (step.description) {
              <span class="step-description">{{ step.description }}</span>
            }
            @if (step.optional) {
              <span class="step-optional">Opcional</span>
            }
          </div>
        </div>
        @if (i < steps().length - 1) {
          <div class="step-connector" [class.completed]="i < currentStep()" aria-hidden="true"></div>
        }
      }
    </div>
  `,
  styleUrl: './stepper.component.css'
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
