import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { FormsModule } from '@angular/forms';
import { RatingComponent } from '../app/shared/ui/atoms/rating/rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Atoms/Rating',
  component: RatingComponent,
  decorators: [
    moduleMetadata({
      imports: [FormsModule],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    max: {
      control: { type: 'number', min: 3, max: 10 },
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = {
  args: {
    value: 3,
    max: 5,
    readonly: false,
  },
};

export const ReadOnly: Story = {
  args: {
    value: 4,
    max: 5,
    readonly: true,
  },
};

export const FiveStars: Story = {
  args: {
    value: 5,
    max: 5,
    readonly: true,
  },
};

export const HalfRating: Story = {
  args: {
    value: 3.5,
    max: 5,
    readonly: true,
  },
};

export const TenStars: Story = {
  args: {
    value: 7,
    max: 10,
    readonly: false,
  },
};

export const Small: Story = {
  args: {
    value: 4,
    max: 5,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    value: 4,
    max: 5,
    size: 'lg',
  },
};

export const AllRatings: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="width: 80px;">1 estrella:</span>
          <app-rating [value]="1" [max]="5" [readonly]="true"></app-rating>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="width: 80px;">2 estrellas:</span>
          <app-rating [value]="2" [max]="5" [readonly]="true"></app-rating>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="width: 80px;">3 estrellas:</span>
          <app-rating [value]="3" [max]="5" [readonly]="true"></app-rating>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="width: 80px;">4 estrellas:</span>
          <app-rating [value]="4" [max]="5" [readonly]="true"></app-rating>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="width: 80px;">5 estrellas:</span>
          <app-rating [value]="5" [max]="5" [readonly]="true"></app-rating>
        </div>
      </div>
    `,
  }),
};
