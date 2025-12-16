import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Custom HTTP loader for translations.
 * Loads JSON translation files from /i18n/ directory.
 */
class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`./assets/i18n/${lang}.json`);
  }
}

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new CustomTranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: [HttpClient]
        }
      })
    )
  ]
};
