const fs = require('fs');
let r = fs.readFileSync('src/app/app.routes.ts', 'utf8');
r = r.replace(
  /{[\s\n]*path: 'crud',[\s\n]*loadComponent: \(\) =>[\s\n]*import\('\.\.\/blueprints\/crud-table\/crud-table\.component'\)\.then\(m => m\.CrudTableComponent\),[\s\n]*\/\/[^\n]*\n[\s]*},/,
  \{
    path: 'crud',
    loadComponent: () =>
      import('../blueprints/crud-table/crud-table.component').then(m => m.CrudTableComponent),
  },
  {
    path: 'crud-base',
    loadComponent: () =>
      import('../blueprints/crud-base/crud-base.component').then(m => m.CrudBaseComponent),
  },\
);
fs.writeFileSync('src/app/app.routes.ts', r, 'utf8');
