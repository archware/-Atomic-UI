import { Component, ViewEncapsulation, ChangeDetectionStrategy, Input } from '@angular/core';
import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [ScrollOverlayComponent],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-scroll-overlay
      class="atomic-table-container so-block"
      [class.atomic-table-striped]="striped"
      [maxBodyHeight]="maxHeight"
      [minColumnWidth]="40"
      [columnTemplate]="columnTemplate"
      [lockColumnTemplate]="!!columnTemplate">
      <table class="atomic-table">
        <ng-content></ng-content>
      </table>
    </app-scroll-overlay>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .atomic-table-container {
      width: 100%;
      overflow: hidden; 
    }

    .atomic-table {
      width: 100%;
      display: table;
      border-collapse: separate;
      border-spacing: 0;
      text-align: left;
      font-family: var(--table-font-family);
      font-size: var(--table-font-size);
      color: var(--table-color-text);
      table-layout: auto;
    }

    .atomic-table > app-table-head {
      display: contents;
    }

    .atomic-table tbody {
      display: table-row-group;
    }

    .atomic-table-striped .atomic-table tbody tr:nth-child(odd) {
      background-color: var(--table-color-stripe);
    }

    /* ============================================
       RESPONSIVE: Cards en m�vil (Sin usar !important)
       Usamos selectores de alta especificidad para anular ScrollOverlay
       ============================================ */
    @media screen and (max-width: 768px) {
      .so-root[data-so-table].atomic-table-container,
      .atomic-table-container {
        border: none;
        border-radius: 0;
        overflow: auto;
        max-height: none;
      }

      .so-root[data-so-table] .atomic-table,
      .atomic-table,
      .so-root[data-so-table] .atomic-table > app-table-head,
      .atomic-table > app-table-head,
      .so-root[data-so-table] .atomic-table tbody,
      .atomic-table tbody {
        display: block;
      }

      .so-root[data-so-table][data-so-sync-columns] .atomic-table thead,
      .so-root[data-so-table] .atomic-table thead,
      .atomic-table thead,
      .atomic-table .atomic-thead {
        display: none;
      }

      .so-root[data-so-table][data-so-sync-columns] .atomic-table tbody tr,
      .so-root[data-so-table] .atomic-table tbody tr,
      .atomic-table tbody tr {
        display: flex;
        flex-direction: column;
        width: 100%; 
        background: var(--table-color-background);
        border: 1px solid var(--table-color-border);
        border-radius: var(--table-border-radius);
        padding: var(--table-card-padding);
        margin-bottom: var(--table-card-gap);
        box-shadow: var(--table-card-shadow);
      }

      .so-root[data-so-table][data-so-sync-columns] .atomic-table tbody tr:hover,
      .so-root[data-so-table] .atomic-table tbody tr:hover,
      .atomic-table tbody tr:hover {
        transform: none;
        box-shadow: var(--table-card-shadow);
      }

      .so-root[data-so-table] .atomic-table tbody td,
      .atomic-table tbody td {
        display: flex;
        padding: var(--space-2) 0;
        border-bottom: 1px solid var(--table-color-border-light);
      }

      .so-root[data-so-table] .atomic-table tbody td:last-child,
      .atomic-table tbody td:last-child {
        border-bottom: none;
      }

      .so-root[data-so-table] .atomic-table tbody td[data-label]::before,
      .atomic-table tbody td[data-label]::before {
        content: attr(data-label);
        display: block;
        font-weight: var(--table-font-weight-label);
        color: var(--table-color-primary);
        flex: 0 0 120px;
        margin-right: var(--space-3);
      }

      .so-root[data-so-table] .atomic-table tbody td.actions-cell,
      .atomic-table tbody td.actions-cell {
        justify-content: flex-end;
        padding-top: var(--space-3);
        border-top: 1px solid var(--table-color-border);
        border-bottom: none;
      }
    }
  `]
})
export class TableComponent {
  @Input() striped = false;
  @Input() maxHeight?: number;
  @Input() columnTemplate?: string;
}



