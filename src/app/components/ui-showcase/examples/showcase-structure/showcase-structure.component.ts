import { Component } from '@angular/core';

import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';
import { DividerComponent } from '../../../../shared/ui/atoms/divider/divider.component';
import { RowComponent } from '../../../../shared/ui/atoms/row/row.component';
import { ScrollOverlayComponent } from '../../../../shared/ui/organisms/scroll-overlay/scroll-overlay.component';
import { IconButtonComponent } from '../../../../shared/ui/atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-showcase-structure',
  standalone: true,
  imports: [
    PanelComponent,
    TextComponent,
    DividerComponent,
    RowComponent,
    ScrollOverlayComponent,
    IconButtonComponent
],
  template: `
    <!-- SCROLL OVERLAY DEMO -->
    <app-panel title="Scroll Overlay (Desplazamiento Canónico R10)" variant="flat" padding="md" class="showcase-section">
      <app-text variant="caption" color="muted">
        Variantes canónicas de <code>&lt;app-scroll-overlay&gt;</code>: <code>variant="default"</code> (neutro plomo con auto-ocultamiento) y <code>variant="brand"</code> (degradado primario-secundario de marca con riel suave visible en reposo).
      </app-text>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 0.75rem;">
        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface-background); padding: 0.5rem;">
          <app-text variant="caption" weight="semibold">variant="default" (Neutro / Auto-hide)</app-text>
          <app-scroll-overlay
            class="so-block"
            variant="default"
            [maxBodyHeight]="'13rem'"
            [skipTableDetection]="true"
            [disableHorizontal]="true"
            scrollAreaAriaLabel="Demostración de Scroll Overlay variante default"
          >
            <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem 0.75rem 0.5rem 0.25rem;">
              @for (item of scrollDemoItems; track item.id) {
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.625rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface-elevated);">
                  <div>
                    <app-text variant="body" weight="semibold">{{ item.title }}</app-text>
                    <app-text variant="caption" color="muted">{{ item.subtitle }}</app-text>
                  </div>
                  <app-icon-button
                    [variant]="item.closeVariant"
                    size="sm"
                    animation="none"
                    [ariaLabel]="'Quitar ' + item.title"
                  ></app-icon-button>
                </div>
              }
            </div>
          </app-scroll-overlay>
        </div>

        <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--surface-background); padding: 0.5rem;">
          <app-text variant="caption" weight="semibold">variant="brand" (Degradado de Marca)</app-text>
          <app-scroll-overlay
            class="so-block"
            variant="brand"
            [maxBodyHeight]="'13rem'"
            [skipTableDetection]="true"
            [disableHorizontal]="true"
            scrollAreaAriaLabel="Demostración de Scroll Overlay variante brand"
          >
            <div style="display: flex; flex-direction: column; gap: 0.5rem; padding: 0.5rem 0.75rem 0.5rem 0.25rem;">
              @for (item of scrollDemoItems; track item.id) {
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.625rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--surface-elevated);">
                  <div>
                    <app-text variant="body" weight="semibold">{{ item.title }}</app-text>
                    <app-text variant="caption" color="muted">{{ item.subtitle }}</app-text>
                  </div>
                  <app-icon-button
                    [variant]="item.closeVariant"
                    size="sm"
                    animation="none"
                    [ariaLabel]="'Quitar ' + item.title"
                  ></app-icon-button>
                </div>
              }
            </div>
          </app-scroll-overlay>
        </div>
      </div>
    </app-panel>

    <!-- DIVIDERS -->
    <app-panel title="Dividers" variant="flat" padding="md" class="showcase-section">
      <app-text variant="body">Párrafo superior</app-text>
      <app-divider></app-divider>
      <app-text variant="body">Párrafo inferior (Divider simple)</app-text>

      <br>

      <app-text variant="body">Sección A</app-text>
      <app-divider text="O"></app-divider>
      <app-text variant="body">Sección B (Divider con texto)</app-text>

      <br>

      <app-text variant="body">Inicio</app-text>
      <app-divider text="Continuar" align="start"></app-divider>
      <app-text variant="body">Fin (Divider alineado al inicio)</app-text>
    </app-panel>

    <!-- PANEL TITLE CUSTOMIZATION DEMO -->
    <app-panel title="Panel Title Customization" variant="flat" padding="md" titleSize="lg" titleWeight="bold" class="showcase-section">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <app-panel title="Izquierda (Left)" variant="outlined" padding="sm" titleAlign="left" titleWeight="bold">
          <app-text variant="caption">titleAlign="left"</app-text>
        </app-panel>
        <app-panel title="Centrado (Center)" variant="outlined" padding="sm" titleAlign="center" titleWeight="bold">
          <app-text variant="caption">titleAlign="center"</app-text>
        </app-panel>
        <app-panel title="Derecha (Right)" variant="outlined" padding="sm" titleAlign="right" titleWeight="bold">
          <app-text variant="caption">titleAlign="right"</app-text>
        </app-panel>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <app-panel title="Size SM" variant="card" padding="sm" titleSize="sm">
          <app-text variant="caption">titleSize="sm"</app-text>
        </app-panel>
        <app-panel title="Size MD" variant="card" padding="sm" titleSize="md">
          <app-text variant="caption">titleSize="md"</app-text>
        </app-panel>
        <app-panel title="Size LG" variant="card" padding="sm" titleSize="lg">
          <app-text variant="caption">titleSize="lg"</app-text>
        </app-panel>
        <app-panel title="Size XL" variant="card" padding="sm" titleSize="xl">
          <app-text variant="caption">titleSize="xl"</app-text>
        </app-panel>
      </div>
    </app-panel>

    <!-- ROW CONTAINER DEMO -->
    <app-panel title="Row Container" variant="flat" padding="md" titleSize="lg" titleWeight="bold" class="showcase-section">
      <app-row columns="1fr 1fr 1fr" gap="1rem" align="center">
        <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
          <app-text variant="caption">Column 1</app-text>
        </div>
        <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
          <app-text variant="caption">Column 2</app-text>
        </div>
        <div style="background: var(--primary-color-lighter); padding: 1rem; border-radius: 0.5rem;">
          <app-text variant="caption">Column 3</app-text>
        </div>
      </app-row>

      <div style="margin-top: 1rem;">
        <app-text variant="caption" color="muted">align="left"</app-text>
        <app-row columns="repeat(3, auto)" gap="1rem" align="left" style="margin-bottom: 0.5rem;">
          <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
          <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
          <div style="background: var(--success-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
        </app-row>
      </div>

      <div style="margin-top: 0.5rem;">
        <app-text variant="caption" color="muted">align="center"</app-text>
        <app-row columns="repeat(3, auto)" gap="1rem" align="center" justify="center" style="margin-bottom: 0.5rem;">
          <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
          <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
          <div style="background: var(--warning-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
        </app-row>
      </div>

      <div style="margin-top: 0.5rem;">
        <app-text variant="caption" color="muted">align="right"</app-text>
        <app-row columns="repeat(3, auto)" gap="1rem" align="right" justify="end">
          <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item A</div>
          <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item B</div>
          <div style="background: var(--danger-color); color: white; padding: 0.5rem 1rem; border-radius: 0.25rem;">Item C</div>
        </app-row>
      </div>
    </app-panel>

    <!-- CARDS -->
    <section class="showcase-section">
      <h3 class="section-title">Cards</h3>
      <div class="card-grid">
        <div class="card">
          <div class="card-header">
            <span class="card-icon">📊</span>
            <h4 class="card-title">Estadísticas</h4>
          </div>
          <p class="card-content">Visualiza tus métricas de rendimiento en tiempo real.</p>
          <div class="card-footer">
            <button class="btn btn-ghost btn-sm">Ver más</button>
          </div>
        </div>

        <div class="card card-elevated">
          <div class="card-header">
            <span class="card-icon">⚙️</span>
            <h4 class="card-title">Configuración</h4>
          </div>
          <p class="card-content">Personaliza tu experiencia según tus preferencias.</p>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm">Configurar</button>
          </div>
        </div>

        <div class="card card-success">
          <div class="card-header">
            <span class="card-icon">✅</span>
            <h4 class="card-title">Completado</h4>
          </div>
          <p class="card-content">Tu proceso se ha completado exitosamente.</p>
          <div class="card-footer">
            <span class="badge badge-success">Activo</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .showcase-section {
      margin-bottom: 2rem;
      display: block;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: var(--font-weight-emphasis);
      margin-bottom: 1rem;
      color: var(--text-color);
    }
    /* Estilos Card (Legacy - should use app-card if available, but preserving structure for now) */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    /* ... Copiado estilos básicos de card inline ... */
    .card {
      background: var(--surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
    }
    .card-elevated { box-shadow: var(--shadow-md); border-color: transparent; }
    .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .card-icon { font-size: 1.5rem; }
    .card-title { font-weight: var(--font-weight-emphasis); margin: 0; }
    .card-content { color: var(--text-color-secondary); margin-bottom: 1.5rem; line-height: 1.5; }
    .badge { padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: var(--font-weight-emphasis); background: var(--surface-hover); }
    .badge-success { background: var(--success-color); color: white; }

    /* Helper buttons for card demo */
    .btn { padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
    .btn-primary { background: var(--primary-color); color: white; }
    .btn-ghost { background: transparent; color: var(--text-color); }
    .btn-sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
  `]
})
export class ShowcaseStructureComponent {
  readonly scrollDemoItems = [
    { id: 1, title: 'Expediente Clínico #1041 — Emergencia', subtitle: 'Variante close-ghost (solo X roja en hover)', closeVariant: 'close-ghost' as const },
    { id: 2, title: 'Expediente Clínico #1042 — Hospitalización', subtitle: 'Variante close-ghost (solo X roja en hover)', closeVariant: 'close-ghost' as const },
    { id: 3, title: 'Expediente Clínico #1043 — Consulta Externa', subtitle: 'Variante close-soft (círculo suave danger)', closeVariant: 'close-soft' as const },
    { id: 4, title: 'Expediente Clínico #1044 — Laboratorio', subtitle: 'Variante close-ghost (solo X roja en hover)', closeVariant: 'close-ghost' as const },
    { id: 5, title: 'Expediente Clínico #1045 — Farmacia Central', subtitle: 'Variante close-soft (círculo suave danger)', closeVariant: 'close-soft' as const },
    { id: 6, title: 'Expediente Clínico #1046 — Diagnóstico por Imágenes', subtitle: 'Variante close-ghost (solo X roja en hover)', closeVariant: 'close-ghost' as const },
    { id: 7, title: 'Expediente Clínico #1047 — Unidad de Cuidados Intensivos', subtitle: 'Variante close-soft (círculo suave danger)', closeVariant: 'close-soft' as const },
    { id: 8, title: 'Expediente Clínico #1048 — Centro Quirúrgico', subtitle: 'Variante close-ghost (solo X roja en hover)', closeVariant: 'close-ghost' as const },
  ];
}
