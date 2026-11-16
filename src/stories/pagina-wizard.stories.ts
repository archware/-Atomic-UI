import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type Meta, type StoryObj } from '@storybook/angular';
import { InputComponent } from '../app/shared/ui/atoms/input/input.component';
import { TextComponent } from '../app/shared/ui/atoms/text/text.component';
import { type Step } from '../app/shared/ui/organisms/stepper/stepper.component';
import { PaginaWizardComponent } from '../app/shared/ui/templates/pagina-wizard/pagina-wizard';

@Component({
  selector: 'app-pagina-wizard-demo',
  standalone: true,
  imports: [PaginaWizardComponent, InputComponent, TextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-pagina-wizard
      titulo="Registro de Nuevo Usuario"
      subtitulo="Complete los pasos requeridos"
      [stepTitle]="'Paso ' + (activeStep() + 1) + ': ' + steps[activeStep()].label"
      stepSubtitle="Los encabezados se mantienen centrados ópticamente"
      [steps]="steps"
      [activeStep]="activeStep()"
      (stepChange)="activeStep.set($event)"
      (nextClicked)="nextStep()"
      (backClicked)="prevStep()"
      (cancelled)="activeStep.set(0)"
      (finished)="activeStep.set(0)"
    >
      @if (activeStep() === 0) {
        <app-input label="Nombre completo" placeholder="Ej. Ana Torres" />
      } @else if (activeStep() === 1) {
        <app-input label="Correo electrónico" type="email" placeholder="ana@empresa.com" />
      } @else {
        <app-text variant="body">Revise los datos antes de confirmar el registro.</app-text>
      }
    </app-pagina-wizard>
  `,
})
class PaginaWizardDemoComponent {
  readonly steps: Step[] = [
    { label: 'Identidad' },
    { label: 'Contacto' },
    { label: 'Confirmación' },
  ];
  readonly activeStep = signal(0);

  nextStep(): void {
    this.activeStep.update((value) => Math.min(value + 1, this.steps.length - 1));
  }

  prevStep(): void {
    this.activeStep.update((value) => Math.max(value - 1, 0));
  }
}

const meta: Meta<PaginaWizardDemoComponent> = {
  id: 'templates-pagina-wizard',
  title: '4. Templates/Pagina Wizard',
  component: PaginaWizardDemoComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PaginaWizardDemoComponent>;

export const Default: Story = {};
