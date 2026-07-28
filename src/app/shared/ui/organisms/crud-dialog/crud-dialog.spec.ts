import { TestBed } from '@angular/core/testing';
import { CrudDialog } from './crud-dialog';

describe('CrudDialog', () => {
  it('proyecta el formulario y conserva la semántica accesible', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.componentRef.setInput('describedBy', 'editor-help');
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('editor-title');
    expect(dialog.getAttribute('aria-describedby')).toBe('editor-help');
    expect(dialog.classList).toContain('crud-dialog');
  });

  it('prioriza el control Atomic marcado y restaura el foco al cerrar', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const launcher = document.createElement('button');
    document.body.appendChild(launcher);
    launcher.focus();

    const hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('aria-hidden', 'true');
    hiddenInput.tabIndex = -1;
    const control = document.createElement('button');
    control.setAttribute('data-control-focus', '');
    fixture.componentInstance.nativeElement.append(hiddenInput, control);

    fixture.componentInstance.showModal();
    expect(document.activeElement).toBe(control);

    fixture.componentInstance.close();
    await Promise.resolve();
    expect(document.activeElement).toBe(launcher);

    launcher.remove();
  });

  it('reinicia el desplazamiento al volver a abrir el diálogo', async () => {
    await TestBed.configureTestingModule({ imports: [CrudDialog] }).compileComponents();
    const fixture = TestBed.createComponent(CrudDialog);
    fixture.componentRef.setInput('labelledBy', 'editor-title');
    fixture.detectChanges();

    const dialog = fixture.componentInstance.nativeElement;
    fixture.componentInstance.showModal();
    dialog.scrollTop = 120;
    fixture.componentInstance.close();

    fixture.componentInstance.showModal();
    expect(dialog.scrollTop).toBe(0);
    fixture.componentInstance.close();
  });
});
