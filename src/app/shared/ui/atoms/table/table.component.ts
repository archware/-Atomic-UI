import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="atomic-table-container">
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </div>
  `,
  styles: [`
    .atomic-table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }
    
    .atomic-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
  `]
})
export class TableComponent { }
