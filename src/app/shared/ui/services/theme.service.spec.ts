import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  function flushThemeEffects(): void {
    TestBed.tick();
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Remove dark class from html
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');

    spyOn(document, 'startViewTransition').and.callFake((callbackOptions) => {
      if (typeof callbackOptions === 'function') {
        void callbackOptions();
      }
      return {
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
        finished: Promise.resolve(),
        skipTransition: () => undefined,
      } as unknown as ViewTransition;
    });

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
      flushThemeEffects();

      expect(service.getSelectedTheme()).toBe('light');
      expect(service.isDarkMode()).toBeFalse();
    });

    it('should remove dark class from html', () => {
      document.documentElement.classList.add('dark');

      service.setLightTheme();
      flushThemeEffects();

      expect(document.documentElement.classList.contains('dark')).toBeFalse();
    });

    it('should set data-theme attribute to light', () => {
      service.setLightTheme();
      flushThemeEffects();

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('should persist to localStorage', () => {
      service.setLightTheme();
      flushThemeEffects();

      expect(localStorage.getItem('app-theme')).toBe('light');
    });
  });

  describe('setDarkTheme', () => {
    it('should set theme to dark', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(service.getSelectedTheme()).toBe('dark');
      expect(service.isDarkMode()).toBeTrue();
    });

    it('should add dark class to html', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(document.documentElement.classList.contains('dark')).toBeTrue();
    });

    it('should set data-theme attribute to dark', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should persist to localStorage', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(localStorage.getItem('app-theme')).toBe('dark');
    });
  });

  describe('setSystemTheme', () => {
    it('should set theme to system', () => {
      service.setSystemTheme();
      flushThemeEffects();

      expect(service.getSelectedTheme()).toBe('system');
    });

    it('should persist to localStorage', () => {
      service.setSystemTheme();
      flushThemeEffects();

      expect(localStorage.getItem('app-theme')).toBe('system');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      service.setLightTheme();
      flushThemeEffects();

      service.toggleTheme();
      flushThemeEffects();

      expect(service.isDarkMode()).toBeTrue();
    });

    it('should toggle from dark to light', () => {
      service.setDarkTheme();
      flushThemeEffects();

      service.toggleTheme();
      flushThemeEffects();

      expect(service.isDarkMode()).toBeFalse();
    });
  });

  describe('getEffectiveDarkMode', () => {
    it('should return light when light theme is set', () => {
      service.setLightTheme();
      flushThemeEffects();

      expect(service.getEffectiveDarkMode()).toBe('light');
    });

    it('should return dark when dark theme is set', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(service.getEffectiveDarkMode()).toBe('dark');
    });
  });

  describe('isDarkMode signal', () => {
    it('should be false for light theme', () => {
      service.setLightTheme();
      flushThemeEffects();

      expect(service.isDarkMode()).toBeFalse();
    });

    it('should be true for dark theme', () => {
      service.setDarkTheme();
      flushThemeEffects();

      expect(service.isDarkMode()).toBeTrue();
    });
  });
});
