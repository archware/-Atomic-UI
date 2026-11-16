import { type Meta, type StoryObj } from '@storybook/angular';
import { ProfileCoverComponent } from '../app/shared/ui/molecules/profile-cover/profile-cover.component';

const meta: Meta<ProfileCoverComponent> = {
  id: 'molecules-profile-cover',
  title: '2. Molecules/ProfileCover',
  component: ProfileCoverComponent,
  tags: ['autodocs'],
  args: {
    loading: false,
    initials: 'HC',
    firstName: 'Havel',
    lastName: 'Contreras',
    role: 'Arquitecto de Software',
  },
};

export default meta;
type Story = StoryObj<ProfileCoverComponent>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};
