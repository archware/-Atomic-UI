import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <thead class="atomic-table-head">
      <ng-content></ng-content>
    </thead>
  `,
  styles: [`
    .atomic-table-head {
      background-color: var(--surface-section);
      border-bottom: 1px solid var(--border-color);
    }
    
    .atomic-table-head th {
      font-weight: 600;
      color: var(--text-color-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.875rem 1rem;
    }
  `]
})
export class TableHeadComponent { }
