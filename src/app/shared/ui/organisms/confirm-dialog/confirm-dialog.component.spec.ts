import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogResult } from './confirm-dialog.models';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogComponent', () => {
  afterEach(() => {
    TestBed.inject(ConfirmDialogService).dismissAll();
  });

  it('renderiza en modo declarativo con header centrado y emite confirmed al aceptar', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const resultados: ConfirmDialogResult[] = [];
    fixture.componentInstance.confirmed.subscribe((res) => resultados.push(res));

    fixture.componentRef.setInput('title', 'Eliminar cliente');
    fixture.componentRef.setInput('message', '¿Desea continuar?');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    const header = fixture.nativeElement.querySelector('.confirm-dialog__header') as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(header.classList).toContain('confirm-dialog__header--center');

    const confirmBtn = fixture.nativeElement.querySelector(
      '.confirm-dialog__confirm-btn button',
    ) as HTMLButtonElement;
    confirmBtn.click();
    fixture.detectChanges();

    expect(resultados.length).toBe(1);
    expect(resultados[0].confirmed).toBeTrue();
    expect(resultados[0].reason).toBe('confirmed');
  });

  it('cierra por Escape y por clic en backdrop cuando closeOnBackdrop es true', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const cerrados: ConfirmDialogResult[] = [];
    fixture.componentInstance.closed.subscribe((res) => cerrados.push(res));

    fixture.componentRef.setInput('message', 'Confirmación');
    fixture.componentRef.setInput('closeOnBackdrop', true);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(cerrados.map((item) => item.reason)).toEqual(['escape', 'backdrop']);
  });

  it('atiende la cola reactiva cuando useService esta activo', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    const service = TestBed.inject(ConfirmDialogService);
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('useService', true);
    fixture.detectChanges();

    const promesa = service.confirm({
      title: 'Confirmar cierre',
      message: 'Se cerrará la sesión.',
      headerAlign: 'start',
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const header = fixture.nativeElement.querySelector('.confirm-dialog__header') as HTMLElement;
    expect(header.classList).not.toContain('confirm-dialog__header--center');
    expect(fixture.nativeElement.textContent).toContain('Confirmar cierre');

    const cancelBtn = fixture.nativeElement.querySelector(
      '.confirm-dialog__cancel-btn button',
    ) as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    const res = await promesa;
    expect(res.confirmed).toBeFalse();
    expect(res.reason).toBe('cancelled');
    expect(service.pendingCount()).toBe(0);
  });

  it('respeta headerAlign start en modo declarativo', async () => {
    await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    const abierto = signal(true);
    fixture.componentRef.setInput('open', abierto());
    fixture.componentRef.setInput('message', 'Detalle');
    fixture.componentRef.setInput('headerAlign', 'start');
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('.confirm-dialog__header') as HTMLElement;
    expect(header.classList).not.toContain('confirm-dialog__header--center');
  });
});
