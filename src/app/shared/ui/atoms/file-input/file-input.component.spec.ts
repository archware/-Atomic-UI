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
    fixture.componentRef.setInput('accept', '.pdf,application/pdf');
    fixture.componentRef.setInput('maxSizeMB', 1);
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

  it('rechaza formatos no permitidos', () => {
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

  it('descarta la selección anterior cuando el nuevo archivo se rechaza', () => {
    // Las dos pruebas de rechazo de arriba parten de vacío, así que pasaban con
    // el defecto y sin él. Éste es el caso real: ya había un archivo válido.
    //
    // Antes, al rechazar el segundo se pintaba el error y se salía SIN tocar
    // `files`: el componente seguía mostrando el primero, el formulario no
    // recibía cambio y el botón de guardar del consumidor seguía habilitado. En
    // un archivado documental eso guarda el documento equivocado, de forma
    // inmutable, mientras la pantalla señala un error sobre otro fichero.
    const emitted: FileInputFile[][] = [];
    component.filesChange.subscribe((files) => emitted.push(files));
    let formValue: FileInputFile[] | null = null as FileInputFile[] | null;
    component.registerOnChange((value: FileInputFile[]) => {
      formValue = value;
    });

    const valido = new File(['ok'], 'contrato-v1.pdf', { type: 'application/pdf' });
    component.onFileChange({
      target: { files: [valido], value: 'selected' },
    } as unknown as Event);
    expect(component.files()).toHaveSize(1);

    const grande = new File([new Uint8Array(1024 * 1024 + 1)], 'contrato-firmado.pdf', {
      type: 'application/pdf',
    });
    component.onFileChange({
      target: { files: [grande], value: 'selected' },
    } as unknown as Event);

    expect(component.files()).toEqual([]);
    expect(component.validationError()).toContain('supera el máximo');
    // El formulario y el evento se enteran: sin esto el consumidor sigue creyendo
    // que tiene un archivo válido.
    expect(emitted[emitted.length - 1]).toEqual([]);
    expect(formValue as FileInputFile[] | null).toEqual([]);
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
    fixture.componentRef.setInput('multiple', true);
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
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.componentRef.setInput('maxPreviewFiles', 1);
    fixture.componentRef.setInput('maxPreviewSizeMB', 1);
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

  it('renderiza la variante dropzone con título, subtítulo, badgeHint y protecciones de arrastre de escritorio', () => {
    fixture.componentRef.setInput('variant', 'dropzone');
    fixture.componentRef.setInput('dropzoneTitle', 'Arrastra tus archivos PDF aquí');
    fixture.componentRef.setInput('dropzoneSubtitle', 'o haz clic para seleccionarlos');
    fixture.componentRef.setInput('badgeHint', 'Soporta múltiples archivos PDF');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.file-input-wrapper') as HTMLElement;
    const dropZone = fixture.nativeElement.querySelector('.drop-zone') as HTMLElement;
    expect(wrapper.classList).toContain('variant-dropzone');
    expect(dropZone.getAttribute('draggable')).toBe('false');
    expect(fixture.nativeElement.querySelector('.drop-title')?.textContent).toContain(
      'Arrastra tus archivos PDF aquí',
    );
    expect(fixture.nativeElement.querySelector('.drop-subtitle')?.textContent).toContain(
      'o haz clic para seleccionarlos',
    );
    expect(fixture.nativeElement.querySelector('.drop-badge-hint')?.textContent).toContain(
      'Soporta múltiples archivos PDF',
    );
  });

  it('muestra cabecera de lista con contador, permite limpiar todo y emite cleared, fileRemoved y fileAction', () => {
    fixture.componentRef.setInput('variant', 'dropzone');
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('showHeader', true);
    fixture.componentRef.setInput('headerTitle', 'Expedientes PDF');
    fixture.componentRef.setInput('allowClearAll', true);
    fixture.componentRef.setInput('clearAllLabel', 'Vaciar todo');
    fixture.componentRef.setInput('itemActionIcon', 'fa-solid fa-wand-magic-sparkles');
    fixture.componentRef.setInput('itemActionLabel', 'Extraer páginas');

    const clearedSpy = jasmine.createSpy('cleared');
    const removedSpy = jasmine.createSpy('fileRemoved');
    const actionSpy = jasmine.createSpy('fileAction');
    component.cleared.subscribe(clearedSpy);
    component.fileRemoved.subscribe(removedSpy);
    component.fileAction.subscribe(actionSpy);

    const first = new File(['%PDF-1.7-a'], 'uno.pdf', { type: 'application/pdf' });
    const second = new File(['%PDF-1.7-b'], 'dos.pdf', { type: 'application/pdf' });
    component.onDrop({
      preventDefault: () => undefined,
      dataTransfer: { files: [first, second] },
    } as unknown as DragEvent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.file-list-title')?.textContent).toContain(
      'Expedientes PDF',
    );
    expect(fixture.nativeElement.querySelector('.file-list-count')?.textContent?.trim()).toBe('2');

    const actionBtn = fixture.nativeElement.querySelector('.file-action') as HTMLButtonElement;
    expect(actionBtn).not.toBeNull();
    actionBtn.click();
    expect(actionSpy).toHaveBeenCalledTimes(1);
    expect(actionSpy.calls.mostRecent().args[0].name).toBe('uno.pdf');

    const removeBtn = fixture.nativeElement.querySelector('.file-remove') as HTMLButtonElement;
    removeBtn.click();
    fixture.detectChanges();
    expect(removedSpy).toHaveBeenCalledTimes(1);
    expect(removedSpy.calls.mostRecent().args[0].name).toBe('uno.pdf');
    expect(component.files()).toHaveSize(1);

    const clearAllBtn = fixture.nativeElement.querySelector('.file-clear-all') as HTMLButtonElement;
    expect(clearAllBtn?.textContent).toContain('Vaciar todo');
    clearAllBtn.click();
    fixture.detectChanges();

    expect(clearedSpy).toHaveBeenCalledTimes(1);
    expect(component.files()).toEqual([]);
  });

  it('combina variant="dropzone" con density="compact" e ignora arrastres sin archivos o dragleave hacia nodos hijos', () => {
    fixture.componentRef.setInput('variant', 'dropzone');
    fixture.componentRef.setInput('density', 'compact');
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.file-input-wrapper') as HTMLElement;
    const dropZone = fixture.nativeElement.querySelector('.drop-zone') as HTMLElement;
    const iconContainer = dropZone.querySelector('.drop-icon-container') as HTMLElement;
    expect(wrapper.classList).toContain('variant-dropzone');
    expect(wrapper.classList).toContain('compact');

    component.onDragOver({
      preventDefault: () => undefined,
      dataTransfer: { types: ['text/plain'] },
    } as unknown as DragEvent);
    expect(component.isDragging()).toBe(false);

    const transfer = { types: ['Files'], dropEffect: 'none' };
    component.onDragOver({
      preventDefault: () => undefined,
      dataTransfer: transfer,
    } as unknown as DragEvent);
    expect(component.isDragging()).toBe(true);
    expect(transfer.dropEffect).toBe('copy');

    component.onDragLeave({
      preventDefault: () => undefined,
      currentTarget: dropZone,
      relatedTarget: iconContainer,
    } as unknown as DragEvent);
    expect(component.isDragging()).toBe(true);

    component.onDragLeave({
      preventDefault: () => undefined,
      currentTarget: dropZone,
      relatedTarget: document.body,
    } as unknown as DragEvent);
    expect(component.isDragging()).toBe(false);
  });

  it('limpia validationError al invocar clearFiles y bloquea Enter/Space cuando disabled es true', () => {
    const invalid = new File(['texto'], 'invalido.txt', { type: 'text/plain' });
    component.onFileChange({
      target: { files: [invalid], value: 'selected' },
    } as unknown as Event);
    expect(component.validationError()).not.toBe('');

    component.clearFiles();
    expect(component.validationError()).toBe('');

    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const clickSpy = spyOn(component.fileInputRef.nativeElement, 'click');
    const dropZone = fixture.nativeElement.querySelector('.drop-zone') as HTMLElement;
    dropZone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    dropZone.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(clickSpy).not.toHaveBeenCalled();
  });
});

