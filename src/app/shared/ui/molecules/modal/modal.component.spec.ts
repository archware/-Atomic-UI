import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  inject,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ToastService } from '../../services/toast.service';
import { ToastComponent } from '../toast/toast.component';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-modal-async-error-host',
  standalone: true,
  imports: [ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal #dialog title="Guardar configuración">
      @if (error()) {
        <p role="alert" data-modal-error tabindex="-1">{{ error() }}</p>
      }
    </app-modal>
  `,
})
class ModalAsyncErrorHost {
  readonly error = signal('');
  readonly dialog = viewChild.required(ModalComponent);

  resolveFailure(): boolean {
    this.error.set('No fue posible guardar.');
    return this.dialog().focusError();
  }
}

@Component({
  selector: 'app-modal-async-lifecycle-host',
  standalone: true,
  imports: [ButtonComponent, ModalComponent, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-button data-launch-success (buttonClick)="open('success')">Probar éxito</app-button>
    <app-button data-launch-error (buttonClick)="open('error')">Probar error</app-button>
    @if (opened()) {
      <app-modal #dialog title="Guardar configuración" [busy]="busy()" (closed)="close()">
        @if (error()) {
          <p role="alert" data-modal-error tabindex="-1">{{ error() }}</p>
        }
        <div slot="footer">
          <app-button data-submit [loading]="busy()" (buttonClick)="start()">Guardar</app-button>
        </div>
      </app-modal>
    }
    <app-toast />
  `,
})
class ModalAsyncLifecycleHost {
  readonly opened = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly mode = signal<'success' | 'error'>('success');
  readonly dialog = viewChild(ModalComponent);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly toast = inject(ToastService);

  open(mode: 'success' | 'error'): void {
    this.toast.clear();
    this.mode.set(mode);
    this.error.set('');
    this.busy.set(false);
    this.opened.set(true);
  }

  close(): void {
    if (!this.busy()) this.opened.set(false);
  }

  start(): void {
    if (!this.busy()) this.busy.set(true);
  }

  finish(): void {
    if (this.mode() === 'error') {
      this.error.set('No fue posible guardar.');
      this.busy.set(false);
      this.dialog()?.focusError();
      return;
    }

    this.busy.set(false);
    this.opened.set(false);
    this.changeDetector.detectChanges();
    this.toast.success('Configuración guardada.', 0);
  }
}

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  function setInput(name: string, value: unknown): void {
    fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent, ModalAsyncErrorHost, ModalAsyncLifecycleHost],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Title ─────────────────────────────────────────────────────────────────
  describe('title', () => {
    it('should render the title text', () => {
      setInput('title', 'Confirmar acción');
      const title: HTMLElement = fixture.nativeElement.querySelector('.modal-title');
      expect(title.textContent?.trim()).toBe('Confirmar acción');
    });
  });

  // ── Size classes ──────────────────────────────────────────────────────────
  describe('size', () => {
    it('should apply modal-md class by default', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-md')).toBeTrue();
    });

    it('should apply modal-sm class for size sm', () => {
      setInput('size', 'sm');
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-sm')).toBeTrue();
    });

    it('should apply modal-lg class for size lg', () => {
      setInput('size', 'lg');
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-lg')).toBeTrue();
    });
  });

  // ── Close events ──────────────────────────────────────────────────────────
  describe('closed event', () => {
    it('should emit closed when the X button is clicked', () => {
      let emitted = false;
      component.closed.subscribe(() => { emitted = true; });

      const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-close');
      closeBtn.click();

      expect(emitted).toBeTrue();
    });

    it('should emit closed on backdrop click when closeOnBackdrop=true', () => {
      let emitted = false;
      setInput('closeOnBackdrop', true);
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBeTrue();
    });

    it('should NOT emit closed on backdrop click when closeOnBackdrop=false', () => {
      let emitted = false;
      setInput('closeOnBackdrop', false);
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBeFalse();
    });

    it('should emit closed on Escape when closeOnBackdrop=true', () => {
      let emitted = false;
      setInput('closeOnBackdrop', true);
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBeTrue();
    });

    it('should NOT emit closed on Escape when closeOnBackdrop=false', () => {
      let emitted = false;
      setInput('closeOnBackdrop', false);
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBeFalse();
    });

    it('blocks close controls, Escape and backdrop while an async action is busy', () => {
      let emissions = 0;
      component.closed.subscribe(() => { emissions += 1; });
      setInput('busy', true);

      const modal = fixture.nativeElement.querySelector('.modal') as HTMLElement;
      const closeBtn = fixture.nativeElement.querySelector('.modal-close') as HTMLButtonElement;
      closeBtn.click();
      component.onEscape();
      component.onBackdropClick();

      expect(modal.getAttribute('aria-busy')).toBe('true');
      expect(closeBtn.disabled).toBeTrue();
      expect(emissions).toBe(0);
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  describe('footer', () => {
    it('should render footer section when hasFooter=true', () => {
      setInput('hasFooter', true);
      const footer = fixture.nativeElement.querySelector('.modal-footer');
      expect(footer).not.toBeNull();
    });

    it('should hide footer section when hasFooter=false', () => {
      setInput('hasFooter', false);
      const footer = fixture.nativeElement.querySelector('.modal-footer');
      expect(footer).toBeNull();
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('should have role="dialog" on the modal panel', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true" on the modal panel', () => {
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-label on the close button', () => {
      const closeBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.modal-close');
      expect(closeBtn.getAttribute('aria-label')).toBeTruthy();
    });

    it('keeps the backdrop passive and labels the dialog from its visible title', () => {
      const overlay = fixture.nativeElement.querySelector('.modal-overlay') as HTMLElement;
      const modal = fixture.nativeElement.querySelector('.modal') as HTMLElement;
      const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement;

      expect(overlay.getAttribute('role')).toBeNull();
      expect(overlay.getAttribute('tabindex')).toBeNull();
      expect(modal.getAttribute('aria-labelledby')).toBe(title.id);
    });

    it('moves initial focus into the dialog', async () => {
      await Promise.resolve();

      const close = fixture.nativeElement.querySelector('.modal-close') as HTMLButtonElement;
      expect(document.activeElement).toBe(close);
    });

    it('cycles focus inside the dialog on Tab', async () => {
      await Promise.resolve();
      const close = fixture.nativeElement.querySelector('.modal-close') as HTMLButtonElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      });

      close.dispatchEvent(event);

      expect(event.defaultPrevented).toBeTrue();
      expect(document.activeElement).toBe(close);
    });

    it('restores focus when the dialog is destroyed', async () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      const localFixture = TestBed.createComponent(ModalComponent);
      localFixture.detectChanges();
      await Promise.resolve();

      localFixture.destroy();

      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });

    it('focuses the projected operation error after an async failure', () => {
      const body = fixture.nativeElement.querySelector('.modal-body') as HTMLElement;
      const error = document.createElement('div');
      error.setAttribute('role', 'alert');
      error.setAttribute('data-modal-error', '');
      error.tabIndex = -1;
      body.appendChild(error);

      expect(component.focusError()).toBeTrue();
      expect(document.activeElement).toBe(error);
    });

    it('retries focus after render when async feedback is still pending', async () => {
      const hostFixture = TestBed.createComponent(ModalAsyncErrorHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(hostFixture.componentInstance.resolveFailure()).toBeFalse();
      await hostFixture.whenStable();

      const error = hostFixture.nativeElement.querySelector('[data-modal-error]') as HTMLElement;
      expect(error).not.toBeNull();
      expect(document.activeElement).toBe(error);
      hostFixture.destroy();
    });

    it('automates busy, Escape, close-before-toast and error-focus lifecycle', async () => {
      const hostFixture = TestBed.createComponent(ModalAsyncLifecycleHost);
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      const successLauncher = hostFixture.nativeElement.querySelector(
        '[data-launch-success] button',
      ) as HTMLButtonElement;
      successLauncher.focus();
      successLauncher.click();
      await hostFixture.whenStable();

      let dialog = hostFixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
      let submit = hostFixture.nativeElement.querySelector('[data-submit] button') as HTMLButtonElement;
      submit.click();
      await hostFixture.whenStable();

      expect(dialog.getAttribute('aria-busy')).toBe('true');
      // El boton en curso ya no se pone `disabled` —se quitaba el foco a si
      // mismo—: lo dice `aria-disabled`, que se anuncia y no roba el foco.
      expect(submit.getAttribute('aria-disabled')).toBe('true');
      dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(hostFixture.componentInstance.opened()).toBeTrue();

      hostFixture.componentInstance.finish();
      await hostFixture.whenStable();

      expect(hostFixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
      const toast = hostFixture.nativeElement.querySelector('app-toast [role="alert"]') as HTMLElement;
      expect(toast.textContent).toContain('Configuración guardada.');
      expect(document.activeElement).toBe(successLauncher);

      const errorLauncher = hostFixture.nativeElement.querySelector(
        '[data-launch-error] button',
      ) as HTMLButtonElement;
      errorLauncher.focus();
      errorLauncher.click();
      await hostFixture.whenStable();
      submit = hostFixture.nativeElement.querySelector('[data-submit] button') as HTMLButtonElement;
      submit.click();
      await hostFixture.whenStable();
      hostFixture.componentInstance.finish();
      await hostFixture.whenStable();

      dialog = hostFixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
      const error = dialog.querySelector('[data-modal-error]') as HTMLElement;
      expect(dialog).not.toBeNull();
      expect(error.textContent).toContain('No fue posible guardar.');
      expect(document.activeElement).toBe(error);
      hostFixture.destroy();
    });
  });
});
