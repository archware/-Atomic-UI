import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelComponent } from '../../shared/ui/surfaces/panel/panel.component';
import { FooterComponent, SocialLink, LegalLink } from '../../shared/ui/organisms/footer/footer.component';

// Sub-componentes de ejemplos
import { ShowcaseTypographyComponent } from './examples/showcase-typography/showcase-typography.component';
import { ShowcaseStructureComponent } from './examples/showcase-structure/showcase-structure.component';
import { ShowcaseActionsComponent } from './examples/showcase-actions/showcase-actions.component';
import { ShowcaseFormsComponent } from './examples/showcase-forms/showcase-forms.component';
import { ShowcaseNavigationComponent } from './examples/showcase-navigation/showcase-navigation.component';
import { ShowcaseDataDisplayComponent } from './examples/showcase-data-display/showcase-data-display.component';
import { ShowcaseFeedbackComponent } from './examples/showcase-feedback/showcase-feedback.component';
import { ShowcaseStatusComponent } from './examples/showcase-status/showcase-status.component';

@Component({
  selector: 'app-ui-showcase',
  standalone: true,
  imports: [
    CommonModule,
    PanelComponent,
    FooterComponent,
    ShowcaseTypographyComponent,
    ShowcaseStructureComponent,
    ShowcaseActionsComponent,
    ShowcaseFormsComponent,
    ShowcaseNavigationComponent,
    ShowcaseDataDisplayComponent,
    ShowcaseFeedbackComponent,
    ShowcaseStatusComponent
  ],
  template: `
    <app-panel title="UI Components Showcase (Refactorizado)" icon="🎨" variant="elevated" padding="lg">
      
      <!-- 1. Navigation & Layout Examples -->
      <app-showcase-navigation></app-showcase-navigation>
      
      <!-- 2. Typography -->
      <app-showcase-typography></app-showcase-typography>
      
      <!-- 3. Structure (Dividers, Panels, Rows) -->
      <app-showcase-structure></app-showcase-structure>
      
      <!-- 4. Actions (Buttons) -->
      <app-showcase-actions></app-showcase-actions>
      
      <!-- 5. Forms (Inputs, Selects) -->
      <app-showcase-forms></app-showcase-forms>
      
      <!-- 6. Data Display (Tables, Avatars, Chips) -->
      <app-showcase-data-display></app-showcase-data-display>
      
      <!-- 7. Feedback (Modals, Toasts) -->
      <app-showcase-feedback></app-showcase-feedback>
      
      <!-- 8. Status (Loaders) -->
      <app-showcase-status></app-showcase-status>

      <!-- Footer Demo at the bottom -->
      <app-footer 
        appName="Atomic UI" 
        version="1.0.0" 
        [socialLinks]="footerSocialLinks" 
        [legalLinks]="footerLegalLinks"
        copyright="© 2024 Atomic UI Project. All rights reserved.">
      </app-footer>

    </app-panel>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1rem;
    }
  `]
})
export class UiShowcaseComponent {
  // Footer demo data (Only data left in main component)
  footerSocialLinks: SocialLink[] = [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'github', url: 'https://github.com' }
  ];

  footerLegalLinks: LegalLink[] = [
    { label: 'Terminos', url: '/terms' },
    { label: 'Privacidad', url: '/privacy' },
    { label: 'Contacto', url: '/contact' }
  ];
}
