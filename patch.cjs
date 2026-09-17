const fs = require('fs');
let file = 'src/app/shared/ui/services/error-handler.service.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /this\.router\.navigate\(\['\/500'\], \{[\s\S]*?\}\);/g,
  \document.body.innerHTML = '<div style="color:red; font-size:24px; z-index:9999; position:absolute; top:0; left:0; background:white; padding:20px; width:100%; min-height:100vh;"><h1>Error:</h1><pre>' + err.stack + '</pre></div>';\
);
fs.writeFileSync(file, content, 'utf8');
