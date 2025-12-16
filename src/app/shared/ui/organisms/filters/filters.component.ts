import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PanelComponent } from '../../surfaces/panel/panel.component';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule, PanelComponent],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Input() dateStart = '';
  @Output() dateStartChange = new EventEmitter<string>();

  @Input() dateEnd = '';
  @Output() dateEndChange = new EventEmitter<string>();

  @Input() status = '';
  @Output() statusChange = new EventEmitter<string>();

  @Output() filter = new EventEmitter<void>();

  onFilter() {
    this.filter.emit();
  }
}
