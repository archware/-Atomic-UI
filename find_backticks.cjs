const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  'src',
  'app',
  'shared',
  'ui',
  'molecules',
  'pagination',
  'pagination.component.ts',
);
const content = fs.readFileSync(targetPath, 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('`')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
