import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TopbarComponent } from '../app/shared/ui/organisms/topbar/topbar.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { IconButtonComponent } from '../app/shared/ui/atoms/icon-button/icon-button.component';
import { UserMenuComponent } from '../app/shared/ui/molecules/user-menu/user-menu.component';
import { LanguageSwitcherComponent } from '../app/shared/ui/atoms/language-switcher/language-switcher.component';

class FakeTranslateLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

const meta: Meta<TopbarComponent> = {
  title: '3. Organisms/Topbar',
  component: TopbarComponent,
  decorators: [
    moduleMetadata({
      imports: [
        IconButtonComponent,
        UserMenuComponent,
        LanguageSwitcherComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeTranslateLoader }
        })
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Page title displayed in the topbar',
    },
    notificationCount: {
      control: 'number',
      description: 'Number of unread notifications',
    },
    userName: {
      control: 'text',
      description: 'User full name',
    },
    userEmail: {
      control: 'text',
      description: 'User email',
    },
    userInitials: {
      control: 'text',
      description: 'User initials for avatar',
    },
  },
};

export default meta;
type Story = StoryObj<TopbarComponent>;

export const Default: Story = {
  args: {
    title: 'Dashboard',
    notificationCount: 3,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userInitials: 'JD',
  },
};

export const NoNotifications: Story = {
  args: {
    title: 'Settings',
    notificationCount: 0,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userInitials: 'JS',
  },
};

export const LongTitle: Story = {
  args: {
    title: 'User Management & Administration Panel',
    notificationCount: 12,
    userName: 'Admin User',
    userEmail: 'admin@company.com',
    userInitials: 'AU',
  },
};
