import { Component, output } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [TranslateModule, IconButtonComponent],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css'
})
export class TableActionsComponent {
  readonly view = output<void>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
