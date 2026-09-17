import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from '../../atoms/text/text.component';

@Component({
  selector: 'app-setting-item',
  standalone: true,
  imports: [CommonModule, TextComponent],
  templateUrl: './setting-item.component.html',
  styleUrl: './setting-item.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingItemComponent {
  title = input<string>('');
  description = input<string>('');
}
