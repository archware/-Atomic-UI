import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { TextComponent } from '../../atoms/text/text.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { SkeletonComponent } from '../../atoms/skeleton/skeleton.component';

@Component({
  selector: 'app-profile-cover',
  standalone: true,
  imports: [CommonModule, AvatarComponent, TextComponent, ChipComponent, SkeletonComponent],
  templateUrl: './profile-cover.component.html',
  styleUrl: './profile-cover.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileCoverComponent {
  loading = input<boolean>(false);
  initials = input<string>('U');
  firstName = input<string>('');
  lastName = input<string>('');
  role = input<string>('');
}
