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
});

describe('FormDialogActions', () => {
  it('publica un grupo canónico para las acciones proyectadas', async () => {
    await TestBed.configureTestingModule({ imports: [FormDialogActions] }).compileComponents();
    const fixture = TestBed.createComponent(FormDialogActions);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.form-dialog-actions')).not.toBeNull();
  });
});
