import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from '../app/shared/ui/molecules/pagination/pagination.component';

const meta: Meta<PaginationComponent> = {
  title: '2. Molecules/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {
  render: () => ({
    template: `<app-pagination [total]="100" [pageSize]="10"></app-pagination>`,
  }),
};

export const MiddlePage: Story = {
  render: () => ({
    template: `<app-pagination [total]="100" [pageSize]="10"></app-pagination>`,
  }),
};

export const FewPages: Story = {
  render: () => ({
    template: `<app-pagination [total]="30" [pageSize]="10"></app-pagination>`,
  }),
};

export const ManyPages: Story = {
  render: () => ({
    template: `<app-pagination [total]="500" [pageSize]="10"></app-pagination>`,
  }),
};

export const LargePageSize: Story = {
  render: () => ({
    template: `<app-pagination [total]="100" [pageSize]="25"></app-pagination>`,
  }),
};

export const SmallPageSize: Story = {
  render: () => ({
    template: `<app-pagination [total]="100" [pageSize]="5"></app-pagination>`,
  }),
};

export const Minimal: Story = {
  args: {
    variant: 'minimal',
    total: 100,
    pageSize: 10,
    page: 4,
  },
};

export const Rounded: Story = {
  args: {
    variant: 'rounded',
    total: 100,
    pageSize: 10,
    page: 4,
  },
};

export const Cards: Story = {
  args: {
    variant: 'cards',
    total: 100,
    pageSize: 10,
    page: 4,
  },
};

export const Compact: Story = {
  args: {
    size: 'sm',
    total: 100,
    pageSize: 10,
    page: 4,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    total: 100,
    pageSize: 10,
    page: 4,
  },
};
