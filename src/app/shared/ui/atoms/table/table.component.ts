import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="atomic-table-container" [class.atomic-table-striped]="striped">
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </div>
  `,
  styles: [`
    /* Usando tokens RTC de responsive-table.css */
    :host {
      display: block;
      width: 100%;
    }

    .atomic-table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: var(--rtc-border-radius);
      border: 1px solid var(--rtc-color-border);
      background: var(--rtc-color-background);
    }
    
    .atomic-table {
      width: 100%;
      display: table;
      border-collapse: separate;
      border-spacing: 0;
      text-align: left;
      font-family: var(--rtc-font-family);
      font-size: var(--rtc-font-size-base);
      color: var(--rtc-color-text);
      table-layout: auto;
    }

    /* CRÍTICO: Hacer invisible el wrapper app-table-head */
    .atomic-table > app-table-head {
      display: contents;
    }

    /* Tbody */
    .atomic-table tbody {
      display: table-row-group;
    }

    /* Zebra stripes */
    .atomic-table-striped .atomic-table tbody tr:nth-child(odd) {
      background-color: var(--rtc-color-stripe);
    }

    /* Responsive: Cards en móvil (usa breakpoint RTC) */
    @media screen and (max-width: 768px) {
      .atomic-table-container {
        border: none;
        border-radius: 0;
        overflow: visible;
      }

      .atomic-table,
      .atomic-table > app-table-head,
      .atomic-table thead,
      .atomic-table tbody {
        display: block;
      }

      .atomic-table thead,
      .atomic-table .atomic-thead {
        display: none;
      }

      .atomic-table tbody tr {
        display: flex;
        flex-direction: column;
        background: var(--rtc-color-background);
        border: 1px solid var(--rtc-color-border);
        border-radius: var(--rtc-border-radius);
        padding: var(--rtc-card-padding);
        margin-bottom: var(--rtc-card-gap);
        box-shadow: var(--rtc-shadow-card);
      }

      .atomic-table tbody tr:hover {
        transform: none;
        box-shadow: var(--rtc-shadow-card);
      }

      .atomic-table tbody td {
        display: flex;
        padding: var(--space-2) 0;
        border-bottom: 1px solid var(--rtc-color-border-light);
      }

      .atomic-table tbody td:last-child {
        border-bottom: none;
      }

      .atomic-table tbody td[data-label]::before {
        content: attr(data-label);
        font-weight: var(--rtc-font-weight-label);
        color: var(--text-color-secondary);
        width: 40%;
        flex-shrink: 0;
      }
    }
  `]
})
export class TableComponent {
  @Input() striped = false;
}
