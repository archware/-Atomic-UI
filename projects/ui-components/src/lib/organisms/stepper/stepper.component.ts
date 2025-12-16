import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';

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
    <div class="stepper" [class.stepper-vertical]="vertical" role="navigation" aria-label="Progreso">
      @for (step of steps; track step.label; let i = $index) {
        <div 
          class="step"
          [class.completed]="i < currentStep()"
          [class.active]="i === currentStep()"
          [class.disabled]="i > currentStep() && !allowSkip"
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
        @if (i < steps.length - 1) {
          <div class="step-connector" [class.completed]="i < currentStep()" aria-hidden="true"></div>
        }
      }
    </div>
  `,
  styles: [`
    .stepper {
      display: flex;
      align-items: flex-start; /* Better alignment for labels */
    }

    .stepper-vertical {
      flex-direction: column;
      align-items: stretch; /* Full width for content */
    }

    .step {
      display: flex;
      align-items: center;
      gap: 1rem; /* More spacing */
      cursor: pointer;
      position: relative;
      z-index: 1; /* Keep above connector */
    }

    .step.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* STEP INDICATOR (CIRCLE) */
    .step-indicator {
      width: 2.75rem; /* Larger */
      height: 2.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--surface-background, #ffffff);
      color: var(--text-color-secondary, #6b7280);
      font-size: 1rem;
      font-weight: 700;
      border: 2px solid var(--border-color, #d1d5db);
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05); /* Subtle depth */
    }

    /* Active State */
    .step.active .step-indicator {
      background: var(--primary-color, #793576);
      color: white;
      border-color: var(--primary-color, #793576);
      transform: scale(1.1); /* Slight pop */
      box-shadow: 0 4px 12px rgba(121, 53, 118, 0.4); /* Glow effect */
    }

    /* Completed State */
    .step.completed .step-indicator {
      background: var(--success-color, #10b981); /* Use success color for checkmark */
      border-color: var(--success-color, #10b981);
      color: white;
    }

    .step-check {
      font-size: 1rem;
      font-weight: 800;
    }

    /* TEXT CONTENT */
    .step-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .step-label {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-color-secondary, #4b5563);
      transition: color 200ms ease;
    }

    .step.active .step-label {
      color: var(--primary-color, #793576);
      font-weight: 700;
    }

    .step.completed .step-label {
      color: var(--text-color, #1f2937); /* Darker for finished steps */
    }

    .step-description {
      font-size: 0.8125rem;
      color: var(--text-color-muted, #9ca3af);
      line-height: 1.4;
    }

    .step-optional {
      font-size: 0.75rem;
      color: var(--text-color-muted, #9ca3af);
      font-style: italic;
      margin-top: -0.125rem;
    }

    /* CONNECTOR LINES */
    .step-connector {
      flex: 1;
      height: 3px; /* Thicker */
      min-width: 3rem;
      margin: 1.375rem 0.5rem 0; /* Align with center of 2.75rem indicator */
      background: var(--border-color, #e5e7eb);
      transition: background 300ms ease;
      border-radius: 4px;
    }

    .step-connector.completed {
      background: var(--success-color, #10b981); /* Green line for progress */
    }

    /* Vertical tweaks */
    .stepper-vertical .step {
      flex-direction: row;
    }

    .stepper-vertical .step-connector {
      width: 3px; /* Thicker */
      height: 2.5rem;
      min-width: 3px;
      margin: 0.25rem 0 0.25rem 1.375rem; /* Center align with indicator */
    }

    /* DARK MODE */
    :host-context(html.dark) .step-indicator,
    :host-context([data-theme="dark"]) .step-indicator {
      background: var(--surface-section, #374151);
      border-color: var(--border-color, #4b5563);
      color: #9ca3af;
      box-shadow: none;
    }

    :host-context(html.dark) .step.active .step-indicator,
    :host-context([data-theme="dark"]) .step.active .step-indicator {
      background: var(--primary-color, #bc9abb);
      border-color: var(--primary-color, #bc9abb);
      color: #1f2937;
      box-shadow: 0 0 15px rgba(188, 154, 187, 0.4); /* Glow in dark */
    }

    :host-context(html.dark) .step.completed .step-indicator,
    :host-context([data-theme="dark"]) .step.completed .step-indicator {
      background: var(--success-color, #34d399);
      border-color: var(--success-color, #34d399);
      color: #064e3b;
    }

    :host-context(html.dark) .step-label,
    :host-context([data-theme="dark"]) .step-label {
      color: #9ca3af;
    }

    :host-context(html.dark) .step.active .step-label,
    :host-context([data-theme="dark"]) .step.active .step-label {
      color: #ffffff; /* Pop active text */
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    :host-context(html.dark) .step.completed .step-label,
    :host-context([data-theme="dark"]) .step.completed .step-label {
      color: #e5e7eb;
    }

    :host-context(html.dark) .step-connector,
    :host-context([data-theme="dark"]) .step-connector {
      background: #4b5563;
    }

    :host-context(html.dark) .step-connector.completed,
    :host-context([data-theme="dark"]) .step-connector.completed {
      background: var(--success-color, #34d399);
    }

    /* RESPONSIVE: Compact mobile layout */
    @media (max-width: 768px) {
      .stepper {
        flex-direction: column;
        align-items: stretch;
        gap: 0;
      }
      
      .stepper .step {
        flex-direction: row;
        gap: 0.75rem;
        padding: 0.5rem 0;
      }

      /* Indicador más pequeño */
      .stepper .step-indicator {
        width: 2rem;
        height: 2rem;
        font-size: 0.875rem;
      }

      /* Etiquetas truncadas */
      .stepper .step-label {
        font-size: 0.875rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      /* Ocultar descripción y opcional */
      .stepper .step-description,
      .stepper .step-optional {
        display: none;
      }

      /* Conector vertical compacto */
      .stepper .step-connector {
        width: 3px;
        height: 1.5rem;
        min-width: 3px;
        margin: 0 0 0 0.9375rem; /* Centrado con indicador de 2rem */
      }
    }
  `]
})
export class StepperComponent {
  @Input() steps: Step[] = [];
  @Input() allowSkip = false;
  @Input() vertical = false;
  @Input() set activeStep(value: number) {
    this.currentStep.set(value);
  }
  @Output() stepChange = new EventEmitter<number>();

  currentStep = signal(0);

  goToStep(index: number) {
    if (index <= this.currentStep() || this.allowSkip) {
      this.currentStep.set(index);
      this.stepChange.emit(index);
    }
  }

  next() {
    if (this.currentStep() < this.steps.length - 1) {
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
