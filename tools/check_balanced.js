const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node check_balanced.js <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
function count(ch){return (s.split(ch).length-1)}
const items = ['`','"','\'','{','}','(',')','[',']'];
const res = {};
for(const ch of items){ res[ch]=count(ch); }
console.log('Counts for', path);
for(const k of Object.keys(res)) console.log(k, res[k]);
// attempt to find unclosed template literal by scanning
let bt = 0; let escaped = false;
for(let i=0;i<s.length;i++){
  const c = s[i];
  if(c==='`' && !escaped){ bt++; }
  if(c==='\\' && !escaped){ escaped=true; } else escaped=false;
}
console.log('backtick occurrences (scan aware):', bt);
// find line numbers for last few backticks
const lines = s.split(/\r?\n/);
for(let i=0;i<lines.length;i++){
  if(lines[i].includes('`')) console.log('L'+(i+1)+': '+lines[i].trim().slice(0,120));
}
