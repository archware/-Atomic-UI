import type { Meta, StoryObj } from '@storybook/angular';
import { SkeletonComponent } from '../app/shared/ui/atoms/skeleton/skeleton.component';

const meta: Meta<SkeletonComponent> = {
  title: '1. Atoms/Skeleton',
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
    template: `<app-skeleton variant="circular" width="var(--space-8)" height="var(--space-8)"></app-skeleton>`,
  }),
};

export const Rectangle: Story = {
  render: () => ({
    template: `<app-skeleton variant="rectangular" width="100%" height="var(--skeleton-card-media-block-size)"></app-skeleton>`,
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
    template: `<app-skeleton variant="text" width="100%" height="var(--control-height)"></app-skeleton>`,
  }),
};

export const TextLines: Story = {
  render: () => ({
    template: `
      <div class="story-skeleton-lines">
        <app-skeleton variant="text" width="100%"></app-skeleton>
        <app-skeleton variant="text" width="85%"></app-skeleton>
        <app-skeleton variant="text" width="70%"></app-skeleton>
      </div>
    `,
    styles: [
      `.story-skeleton-lines {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        max-inline-size: 25rem;
      }`,
    ],
  }),
};

export const CardList: Story = {
  render: () => ({
    template: `
      <div class="story-skeleton-list">
        <app-skeleton variant="card"></app-skeleton>
        <app-skeleton variant="card"></app-skeleton>
        <app-skeleton variant="card"></app-skeleton>
      </div>
    `,
    styles: [
      `.story-skeleton-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
      }`,
    ],
  }),
};
