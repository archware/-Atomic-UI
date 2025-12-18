import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../../../shared/ui/surfaces/panel/panel.component';
import { TextComponent } from '../../../../shared/ui/atoms/text/text.component';

@Component({
  selector: 'app-showcase-typography',
  standalone: true,
  imports: [
    CommonModule,
    PanelComponent,
    TextComponent
  ],
  template: `
    <!-- TYPOGRAPHY -->
    <app-panel title="Tipografía" variant="flat" padding="md" class="showcase-section">
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <app-text variant="h1" color="primary">Heading 1</app-text>
        <app-text variant="h2">Heading 2</app-text>
        <app-text variant="h3">Heading 3</app-text>
        <app-text variant="h4">Heading 4</app-text>
        <app-text variant="body" weight="medium">Body text (Medium)</app-text>
        <app-text variant="caption" color="muted">Caption text</app-text>
      </div>
    </app-panel>
  `,
  styles: [`
    .showcase-section {
      margin-bottom: 2rem;
      display: block;
    }
  `]
})
export class ShowcaseTypographyComponent { }
