import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';

export interface SidebarMenuItem {
  id?: string;
  label: string;
  icon: string;
  active?: boolean;
  route?: string;
  badge?: string | number;
}

export interface SidebarUser {
  name: string;
  role: string;
  initials?: string;
  photo?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  /** Menu items to display */
  @Input() menuItems: SidebarMenuItem[] = [];

  /** Current user information */
  @Input() user?: SidebarUser | null;

  /** Check if the sidebar is expanded (visual mode) */
  @Input() collapsed = false;

  /** Event emitted when a menu item is clicked */
  @Output() navigate = new EventEmitter<SidebarMenuItem>();

  onItemClick(item: SidebarMenuItem) {
    this.navigate.emit(item);
  }
}
