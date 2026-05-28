import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
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
      component.title = 'Confirmar acción';
      fixture.detectChanges();
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
      component.size = 'sm';
      fixture.detectChanges();
      const modal: HTMLElement = fixture.nativeElement.querySelector('.modal');
      expect(modal.classList.contains('modal-sm')).toBeTrue();
    });

    it('should apply modal-lg class for size lg', () => {
      component.size = 'lg';
      fixture.detectChanges();
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
      component.closeOnBackdrop = true;
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBeTrue();
    });

    it('should NOT emit closed on backdrop click when closeOnBackdrop=false', () => {
      let emitted = false;
      component.closeOnBackdrop = false;
      component.closed.subscribe(() => { emitted = true; });

      component.onBackdropClick();

      expect(emitted).toBeFalse();
    });

    it('should emit closed on Escape when closeOnBackdrop=true', () => {
      let emitted = false;
      component.closeOnBackdrop = true;
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBeTrue();
    });

    it('should NOT emit closed on Escape when closeOnBackdrop=false', () => {
      let emitted = false;
      component.closeOnBackdrop = false;
      component.closed.subscribe(() => { emitted = true; });

      component.onEscape();

      expect(emitted).toBeFalse();
    });
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  describe('footer', () => {
    it('should render footer section when hasFooter=true', () => {
      component.hasFooter = true;
      fixture.detectChanges();
      const footer = fixture.nativeElement.querySelector('.modal-footer');
      expect(footer).not.toBeNull();
    });

    it('should hide footer section when hasFooter=false', () => {
      component.hasFooter = false;
      fixture.detectChanges();
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
  });
});
