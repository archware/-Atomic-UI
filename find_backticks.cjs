const fs = require('fs');
const content = fs.readFileSync('C:/Users/havel.contreras/Documents/Repos/-Atomic-UI/src/app/shared/ui/molecules/pagination/pagination.component.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('`')) {
    console.log(`Line ${index + 1}: ${line}`);
  }
});
