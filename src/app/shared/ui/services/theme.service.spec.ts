import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Remove dark class from html
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial theme', () => {
    it('should default to system theme when no stored preference', () => {
      localStorage.removeItem('app-theme');
      const newService = TestBed.inject(ThemeService);

      expect(newService.getSelectedTheme()).toBe('system');
    });

    it('should use stored theme from localStorage', () => {
      localStorage.setItem('app-theme', 'dark');

      // Re-create service to pick up localStorage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          ThemeService,
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const newService = TestBed.inject(ThemeService);
      expect(newService.getSelectedTheme()).toBe('dark');
    });
  });

  describe('setLightTheme', () => {
    it('should set theme to light', () => {
      service.setLightTheme();

      expect(service.getSelectedTheme()).toBe('light');
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should remove dark class from html', () => {
      document.documentElement.classList.add('dark');

      service.setLightTheme();

      expect(document.documentElement.classList.contains('dark')).toBeFalse();
    });

    it('should set data-theme attribute to light', () => {
      service.setLightTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should persist to localStorage', () => {
      service.setLightTheme();

      expect(localStorage.getItem('app-theme')).toBe('light');
    });
  });

  describe('setDarkTheme', () => {
    it('should set theme to dark', () => {
      service.setDarkTheme();

      expect(service.getSelectedTheme()).toBe('dark');
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should add dark class to html', () => {
      service.setDarkTheme();

      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should set data-theme attribute to dark', () => {
      service.setDarkTheme();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should persist to localStorage', () => {
      service.setDarkTheme();

      expect(localStorage.getItem('app-theme')).toBe('dark');
    });
  });

  describe('setSystemTheme', () => {
    it('should set theme to system', () => {
      service.setSystemTheme();

      expect(service.getSelectedTheme()).toBe('system');
    });

    it('should persist to localStorage', () => {
      service.setSystemTheme();

      expect(localStorage.getItem('app-theme')).toBe('system');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.setLightTheme();

      service.toggleTheme();

      expect(service.isDarkMode()).toBeTrue();
    });

    it('should toggle from dark to light', () => {
      service.setDarkTheme();

      service.toggleTheme();

      expect(service.isDarkMode()).toBeFalse();
    });
  });

  describe('getEffectiveDarkMode', () => {
    it('should return light when light theme is set', () => {
      service.setLightTheme();

      expect(service.getEffectiveDarkMode()).toBe('light');
    });

    it('should return dark when dark theme is set', () => {
      service.setDarkTheme();

      expect(service.getEffectiveDarkMode()).toBe('dark');
    });
  });

  describe('isDarkMode signal', () => {
    it('should be false for light theme', () => {
      service.setLightTheme();

      expect(service.isDarkMode()).toBeFalse();
    });

    it('should be true for dark theme', () => {
      service.setDarkTheme();

      expect(service.isDarkMode()).toBeTrue();
    });
  });
});
