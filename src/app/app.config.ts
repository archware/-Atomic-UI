import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, HttpClient } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withPreloading, withInMemoryScrolling } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './shared/ui/interceptors/auth.interceptor';
import { cacheInterceptor } from './shared/ui/interceptors/cache.interceptor';
import { GlobalErrorHandlerService } from './shared/ui/services/error-handler.service';

/**
 * Custom HTTP loader for translations.
 * Loads JSON translation files from /i18n/ directory.
 * Files are served from public/i18n/ which maps to root-level /i18n/.
 */
class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient) { }

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`./i18n/${lang}.json`);
  }
}

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new CustomTranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes, withPreloading(PreloadAllModules), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, cacheInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
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
