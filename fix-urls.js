const fs = require('fs');
const path = require('path');

const walk = function(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else results.push(file);
    });
    return results;
};

const files = walk('C:/Users/lukas/.gemini/antigravity/scratch/estetica-app/client/src').filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Primero reemplazamos cualquier /api suelto
    if (c.includes(`'http://localhost:3001/api'`)) {
        c = c.replaceAll(`'http://localhost:3001/api'`, `(import.meta.env.VITE_API_URL || 'http://localhost:3001/api')`);
        changed = true;
    }
    if (c.includes(`"http://localhost:3001/api"`)) {
        c = c.replaceAll(`"http://localhost:3001/api"`, `(import.meta.env.VITE_API_URL || 'http://localhost:3001/api')`);
        changed = true;
    }
    
    // Y los fetch que usan template literals ej: `http://localhost:3001/api/reviews`
    if (c.includes('http://localhost:3001/api/')) {
        c = c.replaceAll('http://localhost:3001/api/', `\${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/`);
        changed = true;
    }

    // Para las imágenes (que no tienen /api):
    if (c.includes('http://localhost:3001')) {
        c = c.replaceAll('http://localhost:3001', `\${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001')}`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Fixed API URLs in:', f);
    }
});
