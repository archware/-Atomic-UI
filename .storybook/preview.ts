import type { Preview } from '@storybook/angular'
import { renderToCanvas as renderizarLienzoAngular } from '@storybook/angular/client/config';
import { setCompodocJson } from "@storybook/addon-docs/angular";
import { applicationConfig } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import docJson from "../documentation.json";
setCompodocJson(docJson);

// ATOMIC-20261102-003: evita selectores invalidos al montar IDs numericos.
const renderizarLienzoConSelectorValido: NonNullable<Preview['renderToCanvas']> = (
  contexto,
  elemento,
) => {
  const idHistoria = contexto.storyContext.id;
  if (/^[A-Za-z]/.test(idHistoria)) {
    return renderizarLienzoAngular(contexto, elemento);
  }

  return renderizarLienzoAngular(
    {
      ...contexto,
      storyContext: {
        ...contexto.storyContext,
        id: 'app-historia-' + idHistoria,
      },
    },
    elemento,
  );
};

const preview: Preview = {
  renderToCanvas: renderizarLienzoConSelectorValido,
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        importProvidersFrom(BrowserAnimationsModule),
        importProvidersFrom(TranslateModule.forRoot())
      ],
    }),
  ],
  parameters: {
    a11y: {
      // Ejecuta auditoria automaticamente sobre el root de cada story
      element: '#storybook-root',
      manual: false,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
