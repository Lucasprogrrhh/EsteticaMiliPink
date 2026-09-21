
const fs = require('fs');
let txt = fs.readFileSync('client/src/App.tsx', 'utf8');

txt = txt.replace(/<h2 className="text-2xl font-bold text-white mb-1">/g, '<h2 className={	ext-2xl font-bold mb-1 }>');
txt = txt.replace(/<p className="text-slate-400 text-sm">/g, '<p className={	ext-sm }>');

fs.writeFileSync('client/src/App.tsx', txt, 'utf8');
console.log('App.tsx updated');

