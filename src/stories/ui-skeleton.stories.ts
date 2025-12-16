import type { Meta, StoryObj } from '@storybook/angular';
import { SkeletonComponent } from '../app/shared/ui/atoms/skeleton/skeleton.component';

const meta: Meta<SkeletonComponent> = {
  title: 'Atoms/Skeleton',
  component: SkeletonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<SkeletonComponent>;

export const Text: Story = {
  render: () => ({
    template: `<app-skeleton variant="text" width="100%"></app-skeleton>`,
  }),
};

export const Circle: Story = {
  render: () => ({
    template: `<app-skeleton variant="circle" width="48px" height="48px"></app-skeleton>`,
  }),
};

export const Rectangle: Story = {
  render: () => ({
    template: `<app-skeleton variant="rectangle" width="100%" height="120px"></app-skeleton>`,
  }),
};

export const Card: Story = {
  render: () => ({
    template: `<app-skeleton variant="card"></app-skeleton>`,
  }),
};

export const AvatarText: Story = {
  render: () => ({
    template: `<app-skeleton variant="avatar-text"></app-skeleton>`,
  }),
};

export const TableRow: Story = {
  render: () => ({
    template: `<app-skeleton variant="table-row"></app-skeleton>`,
  }),
};

export const TextLines: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
        <app-skeleton variant="text" width="100%"></app-skeleton>
        <app-skeleton variant="text" width="85%"></app-skeleton>
        <app-skeleton variant="text" width="70%"></app-skeleton>
      </div>
    `,
  }),
};

export const CardList: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <app-skeleton variant="card"></app-skeleton>
        <app-skeleton variant="card"></app-skeleton>
        <app-skeleton variant="card"></app-skeleton>
      </div>
    `,
  }),
};
