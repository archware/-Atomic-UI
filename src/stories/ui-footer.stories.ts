import type { Meta, StoryObj } from '@storybook/angular';
import { FooterComponent, SocialLink, LegalLink } from '../app/shared/ui/organisms/footer/footer.component';

const meta: Meta<FooterComponent> = {
  id: 'organisms-footer',
  title: '3. Organisms/Footer',
  component: FooterComponent,
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
  { label: 'Terms of Use', url: '/terms' },
  { label: 'Privacy Policy', url: '/privacy' },
  { label: 'Contact', url: '/contact' },
];

export const Simple: Story = {
  args: {
    variant: 'simple',
    companyName: 'Hospital Regional Ayacucho',
    year: 2026,
  },
};

export const Inline: Story = {
  args: {
    variant: 'inline',
    companyName: 'Hospital Regional Ayacucho',
    year: 2026,
    socialLinks: socialLinks,
    legalLinks: legalLinks,
  },
};

export const Columns: Story = {
  args: {
    variant: 'columns',
    companyName: 'Hospital Regional Ayacucho',
    year: 2026,
    description: 'Servicios digitales institucionales para la atención hospitalaria.',
    socialLinks: socialLinks,
    legalLinks: legalLinks,
  },
};
