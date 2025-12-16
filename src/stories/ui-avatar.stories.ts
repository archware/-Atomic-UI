import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { AvatarComponent } from '../app/shared/ui/atoms/avatar/avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Atoms/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [AvatarComponent],
    }),
  ],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Size of the avatar',
    },
    name: {
      control: 'text',
      description: 'User name for generating initials',
    },
    initials: {
      control: 'text',
      description: 'Custom initials (overrides name)',
    },
    src: {
      control: 'text',
      description: 'Image URL',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'busy', 'away'],
      description: 'Online status indicator',
    },
    rounded: {
      control: 'boolean',
      description: 'Use rounded corners instead of circle',
    },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const WithName: Story = {
  args: {
    name: 'Juan Pérez',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    initials: 'AB',
    size: 'md',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'John Doe',
    size: 'lg',
  },
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <app-avatar name="Juan Pérez" size="xs"></app-avatar>
        <app-avatar name="Juan Pérez" size="sm"></app-avatar>
        <app-avatar name="Juan Pérez" size="md"></app-avatar>
        <app-avatar name="Juan Pérez" size="lg"></app-avatar>
        <app-avatar name="Juan Pérez" size="xl"></app-avatar>
      </div>
    `,
  }),
};

export const OnlineStatus: Story = {
  args: {
    name: 'María García',
    size: 'lg',
    status: 'online',
  },
};

export const OfflineStatus: Story = {
  args: {
    name: 'Carlos López',
    size: 'lg',
    status: 'offline',
  },
};

export const BusyStatus: Story = {
  args: {
    name: 'Ana Martínez',
    size: 'lg',
    status: 'busy',
  },
};

export const AwayStatus: Story = {
  args: {
    name: 'Pedro Sánchez',
    size: 'lg',
    status: 'away',
  },
};

export const AllStatuses: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <app-avatar name="Online User" size="lg" status="online"></app-avatar>
        <app-avatar name="Offline User" size="lg" status="offline"></app-avatar>
        <app-avatar name="Busy User" size="lg" status="busy"></app-avatar>
        <app-avatar name="Away User" size="lg" status="away"></app-avatar>
      </div>
    `,
  }),
};

export const Rounded: Story = {
  args: {
    name: 'Rounded Avatar',
    size: 'lg',
    rounded: true,
  },
};

export const Placeholder: Story = {
  args: {
    size: 'lg',
  },
};

export const UserList: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <app-avatar name="Juan Pérez" size="md" status="online"></app-avatar>
          <div>
            <div style="font-weight: 600;">Juan Pérez</div>
            <div style="font-size: 0.875rem; color: #6b7280;">Online</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <app-avatar name="María García" size="md" status="away"></app-avatar>
          <div>
            <div style="font-weight: 600;">María García</div>
            <div style="font-size: 0.875rem; color: #6b7280;">Away</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <app-avatar name="Carlos López" size="md" status="busy"></app-avatar>
          <div>
            <div style="font-weight: 600;">Carlos López</div>
            <div style="font-size: 0.875rem; color: #6b7280;">Busy</div>
          </div>
        </div>
      </div>
    `,
  }),
};
