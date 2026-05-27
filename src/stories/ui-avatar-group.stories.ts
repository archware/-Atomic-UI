import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarGroupComponent } from '../app/shared/ui/molecules/avatar-group/avatar-group.component';

const meta: Meta<AvatarGroupComponent> = {
  title: '2. Molecules/AvatarGroup',
  component: AvatarGroupComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    max: { control: { type: 'number', min: 1, max: 20 } },
    overlap: { control: 'boolean' },
  },
};
export default meta;
type Story = StoryObj<AvatarGroupComponent>;

const TEAM = [
  { name: 'Ana García', initials: 'AG', color: '#3b82f6' },
  { name: 'Carlos López', initials: 'CL', color: '#10b981' },
  { name: 'María Rodríguez', initials: 'MR', color: '#f59e0b' },
  { name: 'Juan Pérez', initials: 'JP', color: '#8b5cf6' },
  { name: 'Sofía Martínez', initials: 'SM', color: '#ef4444' },
  { name: 'Diego Torres', initials: 'DT', color: '#06b6d4' },
  { name: 'Lucía Fernández', initials: 'LF', color: '#84cc16' },
];

export const Default: Story = {
  args: {
    avatars: TEAM.slice(0, 4),
    max: 4,
    size: 'md',
    overlap: true,
  },
};

export const WithOverflow: Story = {
  args: {
    avatars: TEAM,
    max: 4,
    size: 'md',
    overlap: true,
  },
};

export const SmallSize: Story = {
  args: {
    avatars: TEAM.slice(0, 5),
    max: 5,
    size: 'sm',
    overlap: true,
  },
};

export const LargeSize: Story = {
  args: {
    avatars: TEAM.slice(0, 3),
    max: 5,
    size: 'lg',
    overlap: true,
  },
};

export const NoOverlap: Story = {
  args: {
    avatars: TEAM.slice(0, 5),
    max: 6,
    size: 'md',
    overlap: false,
  },
};

export const WithPhotos: Story = {
  args: {
    avatars: [
      { name: 'Ana García', photo: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Carlos López', photo: 'https://i.pravatar.cc/150?img=2' },
      { name: 'María Rodríguez', photo: 'https://i.pravatar.cc/150?img=3' },
      { name: 'Juan Pérez', initials: 'JP', color: '#8b5cf6' },
    ],
    max: 3,
    size: 'md',
    overlap: true,
  },
};
