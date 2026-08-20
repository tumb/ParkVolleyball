const fs = require('fs');
const s = fs.readFileSync(process.argv[2] || 'pages/playoffs.tsx','utf8');
const lines = s.split(/\r?\n/);
let inStyle=false;let styleStart=0, styleEnd=0;
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('<style') && lines[i].includes('{`')){ inStyle=true; styleStart=i; }
  if(inStyle && lines[i].includes('`}') && lines[i].includes('</style>')){ styleEnd=i; inStyle=false; break; }
}
console.log('style block lines', styleStart+1, styleEnd+1);
let stack=[];
for(let i=0;i<lines.length;i++){
  if(i>=styleStart && i<=styleEnd) continue;
  const line = lines[i];
  // find all opening <div (not </div) and not self-closing <div/>
  let openRegex = /<div(?=[\s>])/g;
  let closeRegex = /<\/div>/g;
  let m;
  while((m=openRegex.exec(line))){ stack.push({line:i+1, text:line.trim().slice(0,120)}); }
  while((m=closeRegex.exec(line))){ stack.pop(); }
}
console.log('unclosed div count', stack.length);
if(stack.length>0) console.log('first unclosed at line', stack[0]);
else console.log('all divs closed');
