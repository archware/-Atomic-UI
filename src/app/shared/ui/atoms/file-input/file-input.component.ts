import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, inject, PLATFORM_ID, ViewChild, ElementRef
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface FileInputFile {
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
}

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
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: FileInputComponent, multi: true }
  ],
  template: `
    <div class="file-input-wrapper" [class.disabled]="disabled" [class.drag-over]="isDragging()">
      @if (label) {
        <label class="file-label" [for]="inputId">{{ label }}</label>
      }
      @if (hint) {
        <p class="file-hint">{{ hint }}</p>
      }
      <div
        class="drop-zone"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="isDragging.set(false)"
        (drop)="onDrop($event)"
        (keydown.enter)="fileInput.click()"
        (keydown.space)="fileInput.click(); $event.preventDefault()"
        tabindex="0"
        role="button"
        aria-label="Seleccionar archivo"
      >
        <i class="fa-solid fa-cloud-arrow-up drop-icon" aria-hidden="true"></i>
        <p class="drop-text"><strong>Haz clic</strong> o arrastra archivos aquí</p>
        @if (accept) { <p class="drop-hint">Formatos: {{ accept }}</p> }
        @if (maxSizeMB) { <p class="drop-hint">Máximo {{ maxSizeMB }} MB por archivo</p> }
      </div>

      <input
        #fileInput
        [id]="inputId"
        type="file"
        class="file-hidden"
        [accept]="accept"
        [multiple]="multiple"
        [disabled]="disabled"
        (change)="onFileChange($event)"
        [attr.aria-label]="label || 'Seleccionar archivo'"
      />

      @if (error) {
        <p class="file-error" role="alert">
          <i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {{ error }}
        </p>
      }

      @if (files().length > 0) {
        <ul class="file-list" aria-label="Archivos seleccionados">
          @for (f of files(); track f.name) {
            <li class="file-item">
              @if (f.preview) {
                <img class="file-preview" [src]="f.preview" [alt]="f.name" />
              } @else {
                <i class="fa-solid fa-file file-icon" aria-hidden="true"></i>
              }
              <span class="file-name" [title]="f.name">{{ f.name }}</span>
              <span class="file-size">{{ formatSize(f.size) }}</span>
              @if (!disabled) {
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
  styles: [`
    :host { display: block; }

    .file-label {
      display: block; margin-bottom: var(--space-2);
      font-size: var(--text-sm); font-weight: 500; color: var(--text-color);
    }

    .drop-zone {
      border: var(--space-1) dashed var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--space-6) var(--space-5);
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      background: var(--surface-background);
      outline: none;
    }
    .drop-zone:hover,
    .drop-zone:focus-visible { border-color: var(--input-border-focus); background: var(--surface-hover); }

    .drag-over .drop-zone { border-color: var(--input-border-focus); background: var(--surface-hover); }
    .disabled .drop-zone { opacity: 0.5; pointer-events: none; cursor: not-allowed; }

    .drop-icon { font-size: var(--space-6); color: var(--text-color-muted); display: block; margin-bottom: var(--space-2); }
    .drop-text  { margin: var(--space-1) 0; font-size: var(--text-sm); color: var(--text-color-secondary); }
    .drop-hint  { margin: var(--space-1) 0 0; font-size: var(--text-xs); color: var(--text-color-muted); }

    .file-hidden { display: none; }

    .file-hint {
      margin: 0 0 var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-color-muted);
    }

    .file-error {
      display: flex; align-items: center; gap: var(--space-2);
      margin: var(--space-2) 0 0;
      font-size: var(--text-sm); color: var(--color-error, #ef4444);
    }

    .file-list {
      list-style: none; margin: var(--space-3) 0 0; padding: 0;
      display: flex; flex-direction: column; gap: var(--space-2);
    }

    .file-item {
      display: flex; align-items: center; gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background: var(--surface-section);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
    }

    .file-preview {
      width: var(--space-6); height: var(--space-6); object-fit: cover;
      border-radius: var(--radius-xs, 4px); flex-shrink: 0;
    }
    .file-icon { color: var(--text-color-muted); flex-shrink: 0; }
    .file-name {
      flex: 1; font-size: var(--text-sm);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .file-size { font-size: var(--text-xs); color: var(--text-color-muted); white-space: nowrap; }

    .file-remove {
      background: none; border: none; cursor: pointer;
      padding: var(--space-1) var(--space-2);
      color: var(--text-color-muted);
      border-radius: var(--radius-xs, 4px);
      transition: color 0.15s, background 0.15s;
      flex-shrink: 0;
    }
    .file-remove:hover { color: var(--color-error, #ef4444); background: var(--surface-hover); }
  `]
})
export class FileInputComponent implements ControlValueAccessor {
  private readonly platformId = inject(PLATFORM_ID);
  readonly inputId = 'file-input-' + Math.random().toString(36).slice(2, 8);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  @Input() label = '';
  @Input() hint = '';
  @Input() accept = '';
  @Input() multiple = false;
  @Input() maxSizeMB?: number;
  @Input() disabled = false;
  @Input() error = '';

  @Output() filesChange = new EventEmitter<FileInputFile[]>();

  readonly files = signal<FileInputFile[]>([]);
  readonly isDragging = signal(false);

  private onChange: (v: FileInputFile[]) => void = () => {};
  private onTouched: () => void = () => {};

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const dropped = event.dataTransfer?.files;
    if (dropped) this.processFiles(Array.from(dropped));
  }

  private processFiles(rawFiles: File[]) {
    const valid = rawFiles.filter(f => {
      if (this.maxSizeMB && f.size > this.maxSizeMB * 1024 * 1024) return false;
      return true;
    });

    const processed: FileInputFile[] = valid.map(file => ({
      file, name: file.name, size: file.size, type: file.type
    }));

    // Generate image previews (browser only)
    if (isPlatformBrowser(this.platformId)) {
      processed.forEach(pf => {
        if (pf.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = e => {
            pf.preview = e.target?.result as string;
            this.files.update(fs => [...fs]);
          };
          reader.readAsDataURL(pf.file);
        }
      });
    }

    const newFiles = this.multiple ? [...this.files(), ...processed] : processed;
    this.files.set(newFiles);
    this.onChange(newFiles);
    this.filesChange.emit(newFiles);
  }

  removeFile(f: FileInputFile) {
    this.files.update(fs => fs.filter(x => x !== f));
    this.onChange(this.files());
    this.filesChange.emit(this.files());
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ControlValueAccessor
  writeValue(v: FileInputFile[]): void { this.files.set(v ?? []); }
  registerOnChange(fn: (v: FileInputFile[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled = d; }
}
