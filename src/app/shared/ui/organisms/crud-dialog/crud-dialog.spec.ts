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
});
