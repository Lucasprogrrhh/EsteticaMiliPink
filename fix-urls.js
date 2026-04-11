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

    // Regla 1: Arreglar el `const API = ...` que quedó mal formateado
    const badApiRegex = /const API = \(import\.meta\.env\.VITE_API_URL \|\|\s*'[^']*'\);/g;
    if (badApiRegex.test(c)) {
        c = c.replace(badApiRegex, "const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';");
        changed = true;
    }

    // Regla 1b: Otras variables mal formadas de fallback
    const badApiRegex2 = /const API\s*=\s*\(import\.meta\.env\.VITE_API_URL \|\| '[^']*'\)/g;
    if (badApiRegex2.test(c)) {
        c = c.replace(badApiRegex2, "const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';");
        changed = true;
    }

    // Regla 2: Reparar URLs interpoladas rotas: `${(import.meta.env...}`
    const badInterpolatedRegex = /\$\{\(import\.meta\.env\.VITE_API_URL \? import\.meta\.env\.VITE_API_URL\.replace\('\/api',''\) : 'http:\/\/localhost:3001'\)\}/g;
    if (badInterpolatedRegex.test(c)) {
        c = c.replace(badInterpolatedRegex, "${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001'}");
        changed = true;
    }

    // Regla 3: Reparar strings de fetch mal resueltos
    const badFetchRegex = /\(import\.meta\.env\.VITE_API_URL \|\| 'http:\/\/localhost:3001\/api'\)/g;
    // Evitar aplicarlo en const API
    if (c.includes("fetch(") && badFetchRegex.test(c)) {
        c = c.replace(badFetchRegex, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(f, c);
        console.log('Fixed syntax in:', f);
    }
});
