import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Step, StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  const defaultSteps: Step[] = [
    { label: 'Datos Personales', description: 'Información básica', icon: '1' },
    { label: 'Verificación', description: 'Confirmar correo' },
    { label: 'Pago', description: 'Método de pago', optional: true },
    { label: 'Confirmación', description: 'Revisar pedido' },
  ];

  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    fixture.componentRef.setInput('steps', defaultSteps);
  });

  function getButtons(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button.stepper__button'));
  }

  function getItems(): HTMLLIElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('li.stepper__item'));
  }

  it('debe renderizar los pasos con semántica aria-current, estados y etiquetas accesibles', () => {
    fixture.componentRef.setInput('activeStep', 1);
    fixture.componentRef.setInput('idPrefix', 'checkout');
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav.stepper') as HTMLElement;
    const buttons = getButtons();
    const items = getItems();

    expect(nav.getAttribute('aria-label')).toBe('Progreso del formulario');
    expect(buttons.length).toBe(4);
    expect(items[0].classList.contains('stepper__item--completed')).toBeTrue();
    expect(items[1].classList.contains('stepper__item--active')).toBeTrue();
    expect(items[2].classList.contains('stepper__item--disabled')).toBeTrue();
    expect(buttons[0].id).toBe('checkout-step-0');
    expect(buttons[0].getAttribute('aria-controls')).toBe('checkout-panel-0');
    expect(buttons[1].getAttribute('aria-current')).toBe('step');
    expect(buttons[0].disabled).toBeFalse();
    expect(buttons[1].disabled).toBeFalse();
    expect(buttons[2].disabled).toBeTrue();
  });

  it('debe soportar lista de pasos vacía y actualización dinámica de activeStep', () => {
    fixture.componentRef.setInput('steps', []);
    fixture.detectChanges();
    expect(getButtons().length).toBe(0);

    fixture.componentRef.setInput('steps', defaultSteps);
    fixture.componentRef.setInput('activeStep', 2);
    fixture.detectChanges();

    const items = getItems();
    expect(items[0].classList.contains('stepper__item--completed')).toBeTrue();
    expect(items[1].classList.contains('stepper__item--completed')).toBeTrue();
    expect(items[2].classList.contains('stepper__item--active')).toBeTrue();
    expect(items[3].classList.contains('stepper__item--disabled')).toBeTrue();
  });

  it('debe emitir stepChange al seleccionar pasos alcanzables y bloquear pasos futuros sin allowSkip', () => {
    fixture.componentRef.setInput('activeStep', 1);
    fixture.detectChanges();

    const emitted: number[] = [];
    fixture.componentInstance.stepChange.subscribe((stepIndex) => emitted.push(stepIndex));

    const buttons = getButtons();
    buttons[0].click();
    buttons[2].click();
    fixture.detectChanges();

    expect(emitted).toEqual([0]);
  });

  it('debe habilitar pasos hasta maxReachableStep o todos cuando allowSkip es verdadero', () => {
    fixture.componentRef.setInput('activeStep', 0);
    fixture.componentRef.setInput('maxReachableStep', 2);
    fixture.detectChanges();

    let buttons = getButtons();
    expect(buttons[2].disabled).toBeFalse();
    expect(buttons[3].disabled).toBeTrue();

    fixture.componentRef.setInput('allowSkip', true);
    fixture.detectChanges();

    buttons = getButtons();
    expect(buttons[3].disabled).toBeFalse();

    const emitted: number[] = [];
    fixture.componentInstance.stepChange.subscribe((stepIndex) => emitted.push(stepIndex));
    buttons[3].click();
    expect(emitted).toEqual([3]);
  });

  it('debe deshabilitar todos los botones cuando disabled es verdadero', () => {
    fixture.componentRef.setInput('activeStep', 1);
    fixture.componentRef.setInput('allowSkip', true);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(getButtons().every((button) => button.disabled)).toBeTrue();
  });

  it('debe aplicar la clase vertical y estilos compilados de mouse-over basados en tokens', () => {
    fixture.componentRef.setInput('activeStep', 1);
    fixture.componentRef.setInput('vertical', true);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('nav.stepper') as HTMLElement;
    expect(nav.classList.contains('stepper--vertical')).toBeTrue();

    const styleNodes = Array.from(document.head.querySelectorAll('style'))
      .map((styleEl) => styleEl.textContent ?? '')
      .join('\n');

    expect(styleNodes).toContain('--stepper-hover-bg');
    expect(styleNodes).toContain('--stepper-hover-border');
    expect(styleNodes).toContain('--stepper-completed-hover-bg');
    expect(styleNodes).toContain('--stepper-active-hover-indicator-bg');
  });
});
