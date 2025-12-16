import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

export class ServerTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({});
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: TranslateLoader,
      useClass: ServerTranslateLoader
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
