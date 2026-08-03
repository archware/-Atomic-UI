import type { Meta, StoryObj } from '@storybook/angular';
import { StatusBadgeComponent } from '../app/shared/ui/atoms/status-badge/status-badge.component';

const meta: Meta<StatusBadgeComponent> = {
  title: '1. Atoms/StatusBadge',
  component: StatusBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'degraded', 'unconfigured'],
    },
    channel: {
      control: 'select',
      options: [null, 'web', 'telegram', 'sms'],
      description: 'Identidad visual opcional; nunca contiene credenciales.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<StatusBadgeComponent>;

export const TelegramActive: Story = {
  args: {
    channel: 'telegram',
    status: 'active',
  },
};

export const SmsDegraded: Story = {
  args: {
    channel: 'sms',
    status: 'degraded',
  },
};

export const WebUnconfigured: Story = {
  args: {
    channel: 'web',
    status: 'unconfigured',
  },
};

export const AllSemanticStates: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; padding: 1rem;">
        <app-status-badge channel="web" status="active" />
        <app-status-badge channel="telegram" status="inactive" />
        <app-status-badge channel="sms" status="degraded" />
        <app-status-badge channel="sms" status="unconfigured" />
      </div>
    `,
  }),
};

export const NarrowContainer: Story = {
  args: {
    channel: 'telegram',
    status: 'degraded',
    label: 'Entrega parcial en proceso de recuperación',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="width: 180px; max-width: 100%; padding: 1rem; box-sizing: border-box;">
        <app-status-badge [channel]="channel" [status]="status" [label]="label" />
      </div>
    `,
  }),
};
