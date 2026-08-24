import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  input,
  output
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let fileInputSequence = 0;

export interface FileInputFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

export type FileInputDensity = 'comfortable' | 'compact';

/**
 * FileInputComponent — Campo de carga de archivos con drag & drop.
 *
 * @example
 * ```html
 * <app-file-input
 *   label="Adjuntar documentos"
 *   accept=".pdf,.docx"
 *   [multiple]="true"
 *   [maxSizeMB]="5"
 *   (filesChange)="onFiles($event)">
 * </app-file-input>
 * ```
 */
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: FileInputComponent, multi: true }],
  template: `
    <div
      class="file-input-wrapper"
      [class.disabled]="isDisabled()"
      [class.drag-over]="isDragging()"
      [class.invalid]="visibleError"
      [class.compact]="density() === 'compact'"
    >
      @if (label()) {
        <label class="file-label" [for]="inputId">{{ label() }}</label>
      }
      @if (hint()) {
        <p class="file-hint" [id]="inputId + '-hint'">{{ hint() }}</p>
      }
      <div
        class="drop-zone"
        (click)="openFileDialog()"
        (dragover)="onDragOver($event)"
        (dragleave)="isDragging.set(false)"
        (drop)="onDrop($event)"
        (blur)="onTouched()"
        (keydown.enter)="openFileDialog()"
        (keydown.space)="openFileDialog(); $event.preventDefault()"
        [attr.tabindex]="isDisabled() ? -1 : 0"
        role="button"
        [attr.aria-disabled]="isDisabled()"
        [attr.aria-invalid]="visibleError ? 'true' : null"
        [attr.aria-describedby]="
          visibleError ? inputId + '-error' : hint() ? inputId + '-hint' : null
        "
        aria-label="Seleccionar archivo"
      >
        <i class="fa-solid fa-cloud-arrow-up drop-icon" aria-hidden="true"></i>
        <div class="drop-copy">
          <p class="drop-text"><strong>Haz clic</strong> o arrastra archivos aquí</p>
          @if (accept()) {
            <p class="drop-hint">Formatos: {{ accept() }}</p>
          }
          @if (maxSizeMB()) {
            <p class="drop-hint">Máximo {{ maxSizeMB() }} MB por archivo</p>
          }
        </div>
      </div>

      <input
        #fileInput
        [id]="inputId"
        type="file"
        class="file-hidden"
        [accept]="accept()"
        [multiple]="multiple()"
        [disabled]="isDisabled()"
        (change)="onFileChange($event)"
        (blur)="onTouched()"
        [attr.aria-invalid]="visibleError ? 'true' : null"
        [attr.aria-label]="label() || 'Seleccionar archivo'"
        [attr.aria-describedby]="
          visibleError ? inputId + '-error' : hint() ? inputId + '-hint' : null
        "
      />

      @if (visibleError) {
        <p class="file-error" [id]="inputId + '-error'" role="alert">
          <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ visibleError }}
        </p>
      }

      @if (files().length > 0) {
        <ul class="file-list" aria-label="Archivos seleccionados">
          @for (f of files(); track f.file) {
            <li class="file-item">
              @if (f.preview) {
                <img class="file-preview" [src]="f.preview" alt="" />
              } @else {
                <i class="fa-solid fa-file file-icon" aria-hidden="true"></i>
              }
              <span class="file-name" [title]="f.name">{{ f.name }}</span>
              <span class="file-size">{{ formatSize(f.size) }}</span>
              @if (!isDisabled()) {
                <button
                  type="button"
                  class="file-remove"
                  (click)="removeFile(f)"
                  [attr.aria-label]="'Eliminar ' + f.name"
                >
                  <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './file-input.component.css',
})
export class FileInputComponent implements ControlValueAccessor {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  readonly inputId = `file-input-${++fileInputSequence}`;

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  readonly label = input('');
  readonly hint = input('');
  readonly accept = input('');
  readonly multiple = input(false);
  readonly maxSizeMB = input<number>();
  readonly maxPreviewSizeMB = input(2);
  readonly maxPreviewFiles = input(4);
  readonly disabled = input(false);
  private readonly disabledByForm = signal(false);
  readonly error = input('');

  readonly filesChange = output<FileInputFile[]>();

  /** Densidad visual. `compact` conserva el mismo contrato dentro de formularios modales. */
  readonly density = input<FileInputDensity>('comfortable');

  readonly files = signal<FileInputFile[]>([]);
  readonly isDragging = signal(false);
  readonly validationError = signal('');

  isDisabled(): boolean {
    return this.disabled() || this.disabledByForm();
  }

  get visibleError(): string {
    return this.error() || this.validationError();
  }

  private onChange: (v: FileInputFile[]) => void = () => {};
  protected onTouched: () => void = () => {};

  openFileDialog() {
    if (!this.isDisabled()) {
      this.onTouched();
      this.fileInputRef.nativeElement.click();
    }
  }

  onFileChange(event: Event) {
    if (this.isDisabled()) return;
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (!this.isDisabled()) {
      this.isDragging.set(true);
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    if (this.isDisabled()) return;
    const dropped = event.dataTransfer?.files;
    if (dropped) this.processFiles(Array.from(dropped));
  }

  private processFiles(rawFiles: File[]) {
    this.onTouched();
    this.validationError.set('');
    const selectedFiles = this.multiple() ? rawFiles : rawFiles.slice(0, 1);
    // Un archivo rechazado DESCARTA la seleccion anterior.
    //
    // Antes se ponia el mensaje de error y se salia sin tocar `files`, asi que lo
    // que hubiera seleccionado antes sobrevivia: el componente seguia mostrando
    // el fichero viejo, el formulario no recibia cambio alguno y el boton de
    // guardar del consumidor seguia habilitado. Lo que se enviaba no era lo que
    // la pantalla senalaba con el error, y en un flujo de archivado documental
    // eso significa guardar el documento equivocado de forma inmutable.
    //
    // Vaciar es la unica lectura en la que lo que se ve y lo que se envia
    // coinciden. Se notifica tambien al formulario, no solo al evento.
    const maxSizeMB = this.maxSizeMB();
    const invalidSize = selectedFiles.find(
      (file) => maxSizeMB !== undefined && file.size > maxSizeMB * 1024 * 1024,
    );
    if (invalidSize) {
      this.rejectSelection(
        `${invalidSize.name} supera el máximo de ${this.maxSizeMB()} MB.`,
      );
      return;
    }

    const invalidType = selectedFiles.find((file) => !this.isAccepted(file));
    if (invalidType) {
      this.rejectSelection(
        `${invalidType.name} no corresponde a los formatos permitidos.`,
      );
      return;
    }

    const processed: FileInputFile[] = selectedFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    this.generateImagePreviews(processed);

    const newFiles = this.multiple() ? [...this.files(), ...processed] : processed;
    this.files.set(newFiles);
    this.onChange(newFiles);
    this.filesChange.emit(newFiles);
  }

  /** Deja el campo vacio y avisa: al formulario y al evento. */
  private rejectSelection(message: string): void {
    this.validationError.set(message);
    this.files.set([]);
    this.onChange([]);
    this.filesChange.emit([]);
  }

  private generateImagePreviews(files: FileInputFile[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const maxPreviewFiles = this.maxPreviewFiles();
    const maxFiles = Number.isFinite(maxPreviewFiles)
      ? Math.max(0, Math.trunc(maxPreviewFiles))
      : 0;
    const maxPreviewSizeMB = this.maxPreviewSizeMB();
    const maxSize = Number.isFinite(maxPreviewSizeMB)
      ? Math.max(0, maxPreviewSizeMB)
      : 0;
    const maxBytes = maxSize * 1024 * 1024;
    const existingPreviewCount = this.multiple()
      ? this.files().filter((file) => file.preview).length
      : 0;
    let remaining = Math.max(0, maxFiles - existingPreviewCount);

    for (const item of files) {
      if (remaining === 0) {
        break;
      }
      if (!item.type.startsWith('image/') || item.size > maxBytes) {
        continue;
      }

      remaining -= 1;
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result;
        if (typeof preview === 'string') {
          item.preview = preview;
          this.files.update((current) => [...current]);
        }
      };
      reader.readAsDataURL(item.file);
    }
  }

  private isAccepted(file: File): boolean {
    const rules = this.accept()
      .split(',')
      .map((rule) => rule.trim().toLowerCase())
      .filter(Boolean);
    if (rules.length === 0) {
      return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return rules.some((rule) => {
      if (rule.startsWith('.')) {
        return name.endsWith(rule);
      }
      if (rule.endsWith('/*')) {
        return type.startsWith(rule.slice(0, -1));
      }
      return type === rule;
    });
  }

  removeFile(f: FileInputFile) {
    this.files.update((fs) => fs.filter((x) => x !== f));
    this.onChange(this.files());
    this.filesChange.emit(this.files());
    this.onTouched();
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ControlValueAccessor
  writeValue(v: FileInputFile[]): void {
    this.files.set(v ?? []);
  }
  registerOnChange(fn: (v: FileInputFile[]) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.disabledByForm.set(d);
    this.changeDetectorRef.markForCheck();
  }
}
