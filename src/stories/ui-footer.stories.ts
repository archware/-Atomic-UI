import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FooterComponent, SocialLink, LegalLink } from '../app/shared/ui/organisms/footer/footer.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';

// Fake translation loader for Storybook
class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({
      'FOOTER.LEGAL': 'Legal',
      'FOOTER.FOLLOW_US': 'Follow Us',
      'FOOTER.ALL_RIGHTS_RESERVED': 'All rights reserved.',
      'FOOTER.TERMS': 'Terms of Use',
      'FOOTER.PRIVACY': 'Privacy Policy',
      'FOOTER.CONTACT': 'Contact'
    });
  }
}

const meta: Meta<FooterComponent> = {
  title: 'Organisms/Footer',
  component: FooterComponent,
  decorators: [
    moduleMetadata({
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['simple', 'inline', 'columns'],
      description: 'Footer variant style',
    },
    companyName: {
      control: 'text',
      description: 'Company name displayed in copyright',
    },
    year: {
      control: 'number',
      description: 'Copyright year',
    },
    description: {
      control: 'text',
      description: 'Company description (columns variant)',
    },
  },
};

export default meta;
type Story = StoryObj<FooterComponent>;

const socialLinks: SocialLink[] = [
  { platform: 'facebook', url: 'https://facebook.com' },
  { platform: 'twitter', url: 'https://twitter.com' },
  { platform: 'instagram', url: 'https://instagram.com' },
  { platform: 'linkedin', url: 'https://linkedin.com' },
  { platform: 'github', url: 'https://github.com' },
];

const legalLinks: LegalLink[] = [
  { label: 'FOOTER.TERMS', url: '/terms' },
  { label: 'FOOTER.PRIVACY', url: '/privacy' },
  { label: 'FOOTER.CONTACT', url: '/contact' },
];

export const Simple: Story = {
  args: {
    variant: 'simple',
    companyName: 'Atomic UI',
    year: 2025,
  },
};

export const Inline: Story = {
  args: {
    variant: 'inline',
    companyName: 'Atomic UI',
    year: 2025,
    socialLinks: socialLinks,
    legalLinks: legalLinks,
  },
};

export const Columns: Story = {
  args: {
    variant: 'columns',
    companyName: 'Atomic UI',
    year: 2025,
    description: 'A modern UI component library based on Atomic Design for Angular.',
    socialLinks: socialLinks,
    legalLinks: legalLinks,
  },
};
