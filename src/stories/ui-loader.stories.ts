import type { Meta, StoryObj } from '@storybook/angular';
import { LoaderComponent } from '../app/shared/ui/atoms/loader/loader.component';

const meta: Meta<LoaderComponent> = {
  title: 'Atoms/Loader',
  component: LoaderComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<LoaderComponent>;

export const Spinner: Story = {
  render: () => ({
    template: `<app-loader variant="spinner" size="md"></app-loader>`,
  }),
};

export const Dots: Story = {
  render: () => ({
    template: `<app-loader variant="dots" size="md"></app-loader>`,
  }),
};

export const Pulse: Story = {
  render: () => ({
    template: `<app-loader variant="pulse" size="md"></app-loader>`,
  }),
};

export const Bars: Story = {
  render: () => ({
    template: `<app-loader variant="bars" size="md"></app-loader>`,
  }),
};

export const Small: Story = {
  render: () => ({
    template: `<app-loader variant="spinner" size="sm"></app-loader>`,
  }),
};

export const Large: Story = {
  render: () => ({
    template: `<app-loader variant="spinner" size="lg"></app-loader>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <div style="text-align: center;">
          <app-loader variant="spinner" size="md"></app-loader>
          <p>Spinner</p>
        </div>
        <div style="text-align: center;">
          <app-loader variant="dots" size="md"></app-loader>
          <p>Dots</p>
        </div>
        <div style="text-align: center;">
          <app-loader variant="pulse" size="md"></app-loader>
          <p>Pulse</p>
        </div>
        <div style="text-align: center;">
          <app-loader variant="bars" size="md"></app-loader>
          <p>Bars</p>
        </div>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 2rem; align-items: center;">
        <div style="text-align: center;">
          <app-loader variant="spinner" size="sm"></app-loader>
          <p>Small</p>
        </div>
        <div style="text-align: center;">
          <app-loader variant="spinner" size="md"></app-loader>
          <p>Medium</p>
        </div>
        <div style="text-align: center;">
          <app-loader variant="spinner" size="lg"></app-loader>
          <p>Large</p>
        </div>
      </div>
    `,
  }),
};
