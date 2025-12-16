import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AvatarComponent, AvatarSize, AvatarStatus } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initials generation', () => {
    it('should generate initials from full name', () => {
      component.name = 'Juan Pérez';
      fixture.detectChanges();

      expect(component.computedInitials()).toBe('JP');
    });

    it('should generate initials from single name', () => {
      component.name = 'María';
      fixture.detectChanges();

      expect(component.computedInitials()).toBe('M');
    });

    it('should limit initials to 2 characters', () => {
      component.name = 'Juan Carlos López';
      fixture.detectChanges();

      expect(component.computedInitials().length).toBeLessThanOrEqual(2);
    });

    it('should use provided initials over name', () => {
      component.name = 'Juan Pérez';
      component.initials = 'AB';
      fixture.detectChanges();

      expect(component.computedInitials()).toBe('AB');
    });

    it('should uppercase initials', () => {
      component.name = 'juan pérez';
      fixture.detectChanges();

      expect(component.computedInitials()).toBe('JP');
    });
  });

  describe('size classes', () => {
    const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    sizes.forEach(size => {
      it(`should apply avatar-${size} class when size is ${size}`, () => {
        component.size = size;
        fixture.detectChanges();

        const avatar = fixture.nativeElement.querySelector('.avatar');
        expect(avatar.classList.contains(`avatar-${size}`)).toBeTrue();
      });
    });
  });

  describe('status indicator', () => {
    const statuses: AvatarStatus[] = ['online', 'offline', 'busy', 'away'];

    statuses.forEach(status => {
      it(`should show status-${status} indicator when status is ${status}`, () => {
        component.status = status;
        fixture.detectChanges();

        const statusEl = fixture.nativeElement.querySelector('.avatar-status');
        expect(statusEl).toBeTruthy();
        expect(statusEl.classList.contains(`status-${status}`)).toBeTrue();
      });
    });

    it('should not show status indicator when status is undefined', () => {
      component.status = undefined;
      fixture.detectChanges();

      const statusEl = fixture.nativeElement.querySelector('.avatar-status');
      expect(statusEl).toBeNull();
    });

    it('should have aria-label on status indicator', () => {
      component.status = 'online';
      fixture.detectChanges();

      const statusEl = fixture.nativeElement.querySelector('.avatar-status');
      expect(statusEl.getAttribute('aria-label')).toBe('online');
    });
  });

  describe('color generation', () => {
    it('should generate consistent color for same name', () => {
      component.name = 'Test User';
      fixture.detectChanges();
      const color1 = component.colorFromName();

      component.name = 'Test User';
      fixture.detectChanges();
      const color2 = component.colorFromName();

      expect(color1).toBe(color2);
    });

    it('should use fallback color when no name', () => {
      component.name = '';
      fixture.detectChanges();

      expect(component.colorFromName()).toBe('#6b7280');
    });
  });

  describe('image', () => {
    it('should display image when src is provided', () => {
      component.src = 'https://example.com/avatar.jpg';
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
      expect(img.src).toBe('https://example.com/avatar.jpg');
    });

    it('should show initials on image error', () => {
      component.src = 'invalid-url.jpg';
      component.name = 'John Doe';
      fixture.detectChanges();

      component.onImageError();
      fixture.detectChanges();

      const initialsEl = fixture.nativeElement.querySelector('.avatar-initials');
      expect(initialsEl).toBeTruthy();
    });
  });

  describe('rounded variant', () => {
    it('should add rounded class when rounded is true', () => {
      component.rounded = true;
      fixture.detectChanges();

      const avatar = fixture.nativeElement.querySelector('.avatar');
      expect(avatar.classList.contains('avatar-rounded')).toBeTrue();
    });
  });

  describe('placeholder', () => {
    it('should show placeholder when no name, initials, or src', () => {
      component.name = '';
      component.initials = undefined;
      component.src = undefined;
      fixture.detectChanges();

      const placeholder = fixture.nativeElement.querySelector('.avatar-placeholder');
      expect(placeholder).toBeTruthy();
    });
  });
});
