import '@angular/compiler';
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withPreloading, withInMemoryScrolling } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { XhrFactory } from '@angular/common';

import { routes } from './app.routes';
import { authInterceptor } from './shared/ui/interceptors/auth.interceptor';
import { cacheInterceptor } from './shared/ui/interceptors/cache.interceptor';
import { GlobalErrorHandlerService } from './shared/ui/services/error-handler.service';

class CustomTranslateHttpLoader implements TranslateLoader {
  constructor() { }

  getTranslation(lang: string): Observable<TranslationObject> {
    return new Observable((observer) => {
      if (typeof window === 'undefined') {
        observer.next({});
        observer.complete();
        return;
      }
      fetch('/i18n/' + lang + '.json')
        .then((res) => res.json())
        .then((data) => {
          observer.next(data);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  }
}

export function createTranslateLoader(): TranslateLoader {
  return new CustomTranslateHttpLoader();
}

class MyXhrFactory implements XhrFactory {
  build(): XMLHttpRequest {
    return new XMLHttpRequest();
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(PreloadAllModules), withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideHttpClient(withInterceptors([authInterceptor, cacheInterceptor])),
    { provide: XhrFactory, useClass: MyXhrFactory },
    provideAnimationsAsync(),
    provideClientHydration(),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'es',
        loader: {
          provide: TranslateLoader,
          useFactory: createTranslateLoader,
          deps: []
        }
      })
    )
  ]
};
