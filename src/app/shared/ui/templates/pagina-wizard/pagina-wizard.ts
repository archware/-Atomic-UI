import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PageHeader } from '../../organisms/page-header/page-header';
import { StepperComponent, Step } from '../../organisms/stepper/stepper.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

/**
 * Chasis de Pantalla para Flujos Multi-Paso (Wizard)
 * Coordina la cabecera, el indicador de progreso (Stepper), el área de contenido
 * y el pie de acciones para formularios largos o creaciones en pasos.
 */
@Component({
  selector: 'app-pagina-wizard',
  standalone: true,
  imports: [PageHeader, StepperComponent, ButtonComponent, IconButtonComponent],
  templateUrl: './pagina-wizard.html',
  styleUrl: './pagina-wizard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginaWizardComponent {
  // Configuración de Cabecera
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string | null>(null);

  // Configuración del Stepper
  readonly steps = input.required<Step[]>();
  readonly activeStep = input<number>(0);
  readonly allowSkip = input<boolean>(false);

  // Validaciones y Estado
  readonly loading = input<boolean>(false);
  readonly nextEnabled = input<boolean>(true);
  
  // Etiquetas de Botones
  readonly etiquetaCancelar = input('Cancelar');
  readonly etiquetaAtras = input('Atrás');
  readonly etiquetaSiguiente = input('Siguiente');
  readonly etiquetaFinalizar = input('Guardar / Finalizar');

  // Eventos de Navegación y Acciones
  readonly stepChange = output<number>();
  readonly onCancel = output<void>();
  readonly onNext = output<void>();
  readonly onBack = output<void>();
  readonly onFinish = output<void>();

  get isFirstStep(): boolean {
    return this.activeStep() === 0;
  }

  get isLastStep(): boolean {
    return this.activeStep() === (this.steps().length - 1);
  }

  handleStepChange(newIndex: number) {
    this.stepChange.emit(newIndex);
  }

  handleCancel() {
    this.onCancel.emit();
  }

  handleBack() {
    if (!this.isFirstStep) {
      this.onBack.emit();
    }
  }

  handleNext() {
    if (!this.isLastStep && this.nextEnabled()) {
      this.onNext.emit();
    }
  }

  handleFinish() {
    if (this.isLastStep && this.nextEnabled() && !this.loading()) {
      this.onFinish.emit();
    }
  }
}
