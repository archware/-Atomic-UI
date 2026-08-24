import { Component, output } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css'
})
export class TableActionsComponent {
  readonly view = output<void>();
  readonly edit = output<void>();
  readonly delete = output<void>();
}
