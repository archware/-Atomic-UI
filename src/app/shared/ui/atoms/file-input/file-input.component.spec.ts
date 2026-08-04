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

  it('expone la densidad compacta para formularios modales', () => {
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.file-input-wrapper')?.classList).toContain(
      'compact',
    );
  });

  it('acepta solamente el primer archivo arrastrado en modo individual', () => {
    const first = new File(['%PDF-1.7'], 'primero.pdf', {
      type: 'application/pdf',
    });
    const second = new File(['%PDF-1.7'], 'segundo.pdf', {
      type: 'application/pdf',
    });

    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [first, second] },
    } as unknown as DragEvent);

    expect(component.files()).toHaveSize(1);
    expect(component.files()[0]?.file).toBe(first);
  });

  it('mantiene archivos homónimos como filas independientes en modo múltiple', () => {
    component.multiple = true;
    const first = new File(['%PDF-1.7-a'], 'contrato.pdf', {
      type: 'application/pdf',
    });
    const second = new File(['%PDF-1.7-b'], 'contrato.pdf', {
      type: 'application/pdf',
    });

    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [first, second] },
    } as unknown as DragEvent);
    fixture.detectChanges();

    expect(component.files()).toHaveSize(2);
    expect(fixture.nativeElement.querySelectorAll('.file-item')).toHaveSize(2);
  });

  it('limits image preview generation to the configured memory budget', () => {
    component.multiple = true;
    component.accept = 'image/*';
    component.maxPreviewFiles = 1;
    component.maxPreviewSizeMB = 1;
    const readAsDataUrl = spyOn(FileReader.prototype, 'readAsDataURL');
    const first = new File(['image-a'], 'a.png', { type: 'image/png' });
    const second = new File(['image-b'], 'b.png', { type: 'image/png' });

    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [first, second] },
    } as unknown as DragEvent);

    expect(readAsDataUrl).toHaveBeenCalledTimes(1);
  });

  it('exposes validation state and marks the CVA as touched when opening the picker', () => {
    const touched = jasmine.createSpy('touched');
    component.registerOnTouched(touched);
    spyOn(component.fileInputRef.nativeElement, 'click');

    component.openFileDialog();
    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [new File(['text'], 'invalid.txt', { type: 'text/plain' })] },
    } as unknown as DragEvent);
    fixture.detectChanges();

    expect(touched).toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.drop-zone').getAttribute('aria-invalid'),
    ).toBe('true');
  });
});
