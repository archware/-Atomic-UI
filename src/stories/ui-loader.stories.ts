import type { Meta, StoryObj } from '@storybook/angular';
import { LoaderComponent } from '../app/shared/ui/atoms/loader/loader.component';

const meta: Meta<LoaderComponent> = {
  title: '1. Atoms/Loader',
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
      <div style="display: flex; gap: 2rem; align-items: flex-end; flex-wrap: wrap;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="spinner" size="lg"></app-loader>
          <p style="margin: 0;">Spinner</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="dots" size="lg"></app-loader>
          <p style="margin: 0;">Dots</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="pulse" size="lg"></app-loader>
          <p style="margin: 0;">Pulse</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="bars" size="lg"></app-loader>
          <p style="margin: 0;">Bars</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="gradient" size="lg"></app-loader>
          <p style="margin: 0;">Gradient</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
          <app-loader variant="orbit" size="lg"></app-loader>
          <p style="margin: 0;">Orbit</p>
        </div>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 2rem; align-items: stretch;">
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 5.5rem; gap: 0.5rem;">
          <app-loader style="margin: auto 0;" variant="spinner" size="sm"></app-loader>
          <p style="margin: 0;">Small</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 5.5rem; gap: 0.5rem;">
          <app-loader style="margin: auto 0;" variant="spinner" size="md"></app-loader>
          <p style="margin: 0;">Medium</p>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 5.5rem; gap: 0.5rem;">
          <app-loader style="margin: auto 0;" variant="spinner" size="lg"></app-loader>
          <p style="margin: 0;">Large</p>
        </div>
      </div>
    `,
  }),
};
