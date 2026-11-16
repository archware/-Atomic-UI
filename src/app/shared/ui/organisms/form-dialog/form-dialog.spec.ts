import { By } from '@angular/platform-browser';
import { CrudDialog } from '../crud-dialog/crud-dialog';
import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../atoms/input/input.component';
import { TestBed } from '@angular/core/testing';
import { FormDialog, FormDialogActions } from './form-dialog';

describe('FormDialog', () => {
  it('renderiza encabezado y descripción con relaciones accesibles', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('eyebrow', 'Seguridad');
    fixture.componentRef.setInput('title', 'Editar acceso');
    fixture.componentRef.setInput('description', 'Defina el rol y su vigencia.');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const title = fixture.nativeElement.querySelector('.form-dialog__title') as HTMLElement;
    const description = fixture.nativeElement.querySelector(
      '.form-dialog__description',
    ) as HTMLElement;

    expect(title.textContent).toContain('Editar acceso');
    expect(description.textContent).toContain('Defina el rol');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(description.id);
    const header = fixture.nativeElement.querySelector('.form-dialog__header') as HTMLElement;
    expect(getComputedStyle(header).position).toBe('sticky');
    expect(getComputedStyle(header).top).toBe('0px');
    expect(getComputedStyle(header).alignItems).toBe('center');
  });

  it('propaga Escape como cancelación controlada', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    const cancellations: Event[] = [];
    fixture.componentInstance.cancelled.subscribe((event) => cancellations.push(event));
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(cancellations).toEqual([cancel]);
  });

  it('sincroniza el estado declarativo de apertura y cierre', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.showModal = () => dialog.setAttribute('open', '');

    fixture.componentRef.setInput('opened', true);
    fixture.detectChanges();

    expect(dialog.hasAttribute('open')).toBe(true);
    dialog.removeAttribute('open');
    dialog.dispatchEvent(new Event('close'));
    fixture.detectChanges();

    expect(fixture.componentInstance.opened()).toBe(false);
  });

  it('expone el estado ocupado y bloquea la cancelacion mientras guarda', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    fixture.componentRef.setInput('busy', true);
    const cancellations: Event[] = [];
    fixture.componentInstance.cancelled.subscribe((event) => cancellations.push(event));
    fixture.detectChanges();

    const article = fixture.nativeElement.querySelector('.form-dialog') as HTMLElement;
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));

    expect(article.getAttribute('aria-busy')).toBe('true');
    expect(cancellations).toEqual([]);
  });

  it('delega el foco a la alerta de operación después de un fallo', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Crear usuario');
    fixture.detectChanges();

    const error = document.createElement('div');
    error.setAttribute('role', 'alert');
    error.setAttribute('data-dialog-error', '');
    error.tabIndex = -1;
    fixture.componentInstance.nativeElement.appendChild(error);

    fixture.componentInstance.showModal();
    expect(fixture.componentInstance.focusError()).toBe(true);
    expect(document.activeElement).toBe(error);
    fixture.componentInstance.close();
  });
});

describe('FormDialogActions', () => {
  it('publica un grupo canónico para las acciones proyectadas', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialogActions] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialogActions);
    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelector('.form-dialog-actions') as HTMLElement;
    const host = fixture.nativeElement as HTMLElement;

    expect(actions).not.toBeNull();
    expect(getComputedStyle(host).position).toBe('sticky');
    expect(getComputedStyle(host).bottom).toBe('0px');
  });
});

@Component({
  imports: [FormDialog, InputComponent, ReactiveFormsModule],
  template: `<app-form-dialog title="Edicion sintetica" [(opened)]="abierto">
    <app-input label="Limite" controlId="limite-carrera" type="number" [formControl]="limite" />
    <app-input label="Plazo" controlId="plazo-carrera" type="number" [formControl]="plazo" />
  </app-form-dialog>`,
})
class HostCarreraFormulario {
  readonly abierto = signal(false);
  readonly limite = new FormControl(0, { nonNullable: true });
  readonly plazo = new FormControl(35, { nonNullable: true });
}

describe('FormDialog apertura tras render', () => {
  it('conserva 0 a 500 en modelo y DOM al enfocar y reabrir sin cruzar 35', async () => {
    await TestBed.configureTestingModule({ imports: [HostCarreraFormulario] }).compileComponents();
    const fixture = TestBed.createComponent(HostCarreraFormulario);
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const limite = fixture.nativeElement.querySelector('#limite-carrera') as HTMLInputElement;
    const plazo = fixture.nativeElement.querySelector('#plazo-carrera') as HTMLInputElement;
    expect(limite.value).toBe('0');
    host.limite.setValue(500);
    host.abierto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.limite.value).withContext('modelo tras apertura').toBe(500);
    expect(limite.value).withContext('DOM tras apertura').toBe('500');
    expect(document.activeElement).toBe(limite);
    plazo.focus();
    expect(host.plazo.value).toBe(35);
    expect(plazo.value).toBe('35');
    expect(host.limite.value).withContext('modelo tras blur').toBe(500);
    host.abierto.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    host.abierto.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.limite.value).withContext('modelo tras reapertura').toBe(500);
    expect(limite.value).toBe('500');
    expect(document.activeElement).toBe(limite);
    expect(host.plazo.value).toBe(35);
  });
});

describe('FormDialog propagacion del retorno', () => {
  it('transmite el callback a CrudDialog sin evaluarlo al abrir', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    const resolver = jasmine.createSpy('resolver').and.returnValue(null);
    fixture.componentRef.setInput('title', 'Formulario');
    fixture.componentRef.setInput('resolverFocoRetorno', resolver);
    fixture.detectChanges();
    const dialogo = fixture.debugElement.query(By.directive(CrudDialog)).componentInstance as CrudDialog;
    expect(dialogo.resolverFocoRetorno()).toBe(resolver);
    fixture.componentInstance.showModal();
    expect(resolver).not.toHaveBeenCalled();
  });

  it('centra el encabezado por defecto y permite alineacion start', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialog] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('title', 'Registro');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.form-dialog__header') as HTMLElement;
    expect(header.classList).toContain('form-dialog__header--center');

    fixture.componentRef.setInput('headerAlign', 'start');
    fixture.detectChanges();
    expect(header.classList).not.toContain('form-dialog__header--center');
  });
});
