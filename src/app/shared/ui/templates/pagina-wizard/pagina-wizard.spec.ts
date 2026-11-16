import { TestBed } from '@angular/core/testing';
import { Step } from '../../organisms/stepper/stepper.component';
import { PaginaWizardComponent } from './pagina-wizard';

describe('PaginaWizardComponent', () => {
  const steps: Step[] = [
    { label: 'Datos básicos' },
    { label: 'Confirmación' },
  ];

  it('centra el PageHeader por defecto y renderiza stepTitle y stepSubtitle', async () => {
    await TestBed.configureTestingModule({ imports: [PaginaWizardComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PaginaWizardComponent);
    fixture.componentRef.setInput('titulo', 'Registro de Usuario');
    fixture.componentRef.setInput('subtitulo', 'Flujo paso a paso');
    fixture.componentRef.setInput('stepTitle', 'Paso 1: Identidad');
    fixture.componentRef.setInput('stepSubtitle', 'Complete sus datos');
    fixture.componentRef.setInput('steps', steps);
    fixture.componentRef.setInput('activeStep', 0);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header header') as HTMLElement;
    const stepHeader = fixture.nativeElement.querySelector('.pagina-wizard__step-header') as HTMLElement;
    expect(header.classList).toContain('page-header--align-center');
    expect(stepHeader.textContent).toContain('Paso 1: Identidad');
    expect(stepHeader.textContent).toContain('Complete sus datos');
  });

  it('permite headerAlign start y emite nextClicked, backClicked, finished y cancelled', async () => {
    await TestBed.configureTestingModule({ imports: [PaginaWizardComponent] }).compileComponents();
    const fixture = TestBed.createComponent(PaginaWizardComponent);
    let nextCount = 0;
    let backCount = 0;
    let finishedCount = 0;
    let cancelledCount = 0;
    fixture.componentInstance.nextClicked.subscribe(() => (nextCount += 1));
    fixture.componentInstance.backClicked.subscribe(() => (backCount += 1));
    fixture.componentInstance.finished.subscribe(() => (finishedCount += 1));
    fixture.componentInstance.cancelled.subscribe(() => (cancelledCount += 1));

    fixture.componentRef.setInput('titulo', 'Wizard');
    fixture.componentRef.setInput('headerAlign', 'start');
    fixture.componentRef.setInput('steps', steps);
    fixture.componentRef.setInput('activeStep', 0);
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-page-header header') as HTMLElement;
    expect(header.classList).toContain('page-header--align-start');

    const footerEndBtns = fixture.nativeElement.querySelectorAll(
      '.pagina-wizard__footer-end button',
    ) as NodeListOf<HTMLButtonElement>;
    footerEndBtns[0].click();
    expect(nextCount).toBe(1);

    const cancelBtn = fixture.nativeElement.querySelector(
      '.pagina-wizard__footer-start button',
    ) as HTMLButtonElement;
    cancelBtn.click();
    expect(cancelledCount).toBe(1);

    fixture.componentRef.setInput('activeStep', 1);
    fixture.detectChanges();
    const lastStepBtns = fixture.nativeElement.querySelectorAll(
      '.pagina-wizard__footer-end button',
    ) as NodeListOf<HTMLButtonElement>;
    lastStepBtns[0].click();
    lastStepBtns[1].click();
    expect(backCount).toBe(1);
    expect(finishedCount).toBe(1);
  });
});
