import sys
with open('src/blueprints/crud-table/crud-table.component.html', 'r', encoding='utf-8') as f:
    data = f.read()

# Replace header meta total
data = data.replace(
    '<app-text variant="body-sm" color="muted">{{ meta().total }} registros</app-text>',
    ''
)

# Add data pager above table wrapper
table_wrapper_target = '<div class="table-wrapper">'
data_pager_html = '''  <div class="mt-4 pt-4 border-t">
    <app-data-pager 
      [page]="currentPage()" 
      [total]="meta().total" 
      [pageSize]="pageSize()"
      (pageChange)="onPageChange()"
      (pageSizeChange)="onPageSizeChange()">
    </app-data-pager>
  </div>
  
  <div class="table-wrapper mt-4">'''
data = data.replace(table_wrapper_target, data_pager_html)

# Wrap table in scroll overlay
table_start_target = '''      } @else {
          <div style="overflow-x: auto; width: 100%; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <table class="rtc-table">'''
table_start_replacement = '''      } @else {
        <app-scroll-overlay class="so-block w-full max-w-full" [minColumnWidth]="40" [maxBodyHeight]="450"
          [lockColumnTemplate]="true"
          [columnTemplate]="'50px minmax(200px, 1.5fr) minmax(200px, 1fr) 120px 100px 120px 100px'">
        <table class="rtc-table">'''
data = data.replace(table_start_target, table_start_replacement)

# Close scroll overlay
table_end_target = '''        </table>
      </div>'''
table_end_replacement = '''        </table>
        </app-scroll-overlay>'''
data = data.replace(table_end_target, table_end_replacement)

# Replace bottom pagination with the 3 variants
bottom_pagination_target = '''  <!-- ============================================ -->
  <!-- PAGINATION -->
  <!-- ============================================ -->
  <!-- ============================================ -->
  <!-- PAGINATION -->
  <!-- ============================================ -->
  @if (meta().totalPages > 1) {
  <app-row justify="center" class="mt-4 pt-4 border-t">
    <app-pagination [page]="currentPage()" [total]="meta().total" [pageSize]="PAGE_SIZE"
      (pageChange)="onPageChange()">
    </app-pagination>
  </app-row>
  }'''
bottom_pagination_replacement = '''  <!-- ============================================ -->
  <!-- DEMO PAGINATIONS (BOTTOM) -->
  <!-- ============================================ -->
  @if (meta().totalPages > 1) {
  <div class="mt-6 pt-6 border-t">
    <app-text variant="h4" weight="semibold" class="mb-4">Otras opciones de paginación (Molecules):</app-text>
    
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <div>
        <app-text variant="label" color="muted" class="mb-2" style="display: block;">Variante Minimal:</app-text>
        <app-pagination [page]="currentPage()" [total]="meta().total" [pageSize]="pageSize()" variant="minimal" (pageChange)="onPageChange()"></app-pagination>
      </div>

      <div>
        <app-text variant="label" color="muted" class="mb-2" style="display: block;">Variante Rounded:</app-text>
        <app-pagination [page]="currentPage()" [total]="meta().total" [pageSize]="pageSize()" variant="rounded" (pageChange)="onPageChange()"></app-pagination>
      </div>

      <div>
        <app-text variant="label" color="muted" class="mb-2" style="display: block;">Variante Cards:</app-text>
        <app-pagination [page]="currentPage()" [total]="meta().total" [pageSize]="pageSize()" variant="cards" (pageChange)="onPageChange()"></app-pagination>
      </div>
    </div>
  </div>
  }'''
data = data.replace(bottom_pagination_target, bottom_pagination_replacement)

with open('src/blueprints/crud-table/crud-table.component.html', 'w', encoding='utf-8') as f:
    f.write(data)
