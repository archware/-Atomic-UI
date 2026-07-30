import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileInputComponent, FileInputFile } from './file-input.component';

describe('FileInputComponent', () => {
  let fixture: ComponentFixture<FileInputComponent>;
  let component: FileInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FileInputComponent);
    component = fixture.componentInstance;
    component.accept = '.pdf,application/pdf';
    component.maxSizeMB = 1;
    fixture.detectChanges();
  });

  it('emite un PDF válido', () => {
    const emitted: FileInputFile[][] = [];
    component.filesChange.subscribe((files) => emitted.push(files));
    const file = new File(['%PDF-1.7'], 'contrato.pdf', {
      type: 'application/pdf',
    });

    component.onFileChange({
      target: { files: [file], value: 'selected' },
    } as unknown as Event);

    expect(component.validationError()).toBe('');
    expect(component.files()).toHaveSize(1);
    expect(emitted[emitted.length - 1]?.[0].file).toBe(file);
  });

  it('rechaza formatos no permitidos sin reemplazar la selección', () => {
    const file = new File(['texto'], 'contrato.txt', {
      type: 'text/plain',
    });

    component.onFileChange({
      target: { files: [file], value: 'selected' },
    } as unknown as Event);

    expect(component.files()).toEqual([]);
    expect(component.validationError()).toContain('formatos permitidos');
  });

  it('rechaza archivos que superan el límite informado', () => {
    const file = new File([new Uint8Array(1024 * 1024 + 1)], 'grande.pdf', {
      type: 'application/pdf',
    });

    component.onFileChange({
      target: { files: [file], value: 'selected' },
    } as unknown as Event);

    expect(component.files()).toEqual([]);
    expect(component.validationError()).toContain('supera el máximo');
  });

  it('no abre ni procesa archivos cuando está deshabilitado', () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    const click = spyOn(component.fileInputRef.nativeElement, 'click');
    const file = new File(['%PDF-1.7'], 'contrato.pdf', {
      type: 'application/pdf',
    });

    component.openFileDialog();
    component.onFileChange({
      target: { files: [file], value: 'selected' },
    } as unknown as Event);

    expect(click).not.toHaveBeenCalled();
    expect(component.files()).toEqual([]);
    expect(fixture.nativeElement.querySelector('.drop-zone').getAttribute('tabindex')).toBe('-1');
  });
});
