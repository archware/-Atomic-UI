import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css'
})
export class TableActionsComponent {
  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
}
