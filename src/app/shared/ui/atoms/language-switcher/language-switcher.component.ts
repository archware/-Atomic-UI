import { Component, inject, signal, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

/** Available language options */
export interface Language {
  code: string;
  name: string;
  flag: string;
}

/**
 * Language switcher component for changing application language.
 * Persists language preference in localStorage.
 * 
 * @example
 * ```html
 * <app-language-switcher></app-language-switcher>
 * ```
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css'
})
export class LanguageSwitcherComponent {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);

  /** Available languages */
  readonly languages: Language[] = [
    { code: 'es', name: 'Español', flag: '' },
    { code: 'en', name: 'English', flag: '' }
  ];

  isOpen = signal(false);
  currentLanguage = signal<Language>(this.languages[0]);

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('app-language');
      if (saved) {
        const lang = this.languages.find(l => l.code === saved);
        if (lang) {
          this.currentLanguage.set(lang);
          this.translate.use(lang.code);
        }
      }
    }
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  selectLanguage(lang: Language): void {
    this.currentLanguage.set(lang);
    this.translate.use(lang.code);
    this.isOpen.set(false);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('app-language', lang.code);
    }
  }
}
