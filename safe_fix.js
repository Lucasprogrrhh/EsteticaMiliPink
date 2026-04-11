const fs = require('fs');
const walk = (dir) => {
    let results = [];
    fs.readdirSync(dir).forEach(file => {
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
    
    // Replace const API
    c = c.replace(/const API = ['"]http:\/\/localhost:3001\/api['"];?/g, "const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';");

    // Replace fetch('http://localhost:3001/api...')
    c = c.replace(/fetch\(['"]http:\/\/localhost:3001\/api([^'"]*)['"]/g, "fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}$1`");

    // Replace fetch(`http://localhost:3001/api...`)
    c = c.replace(/fetch\(`http:\/\/localhost:3001\/api/g, "fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}");

    // Replace image sources backticks
    c = c.replace(/`http:\/\/localhost:3001\$\{([^}]+)\}`/g, "`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:3001'}${$1}`");

    // Special cases for string literals like in PublicPortfolioPage
    c = c.replace(/'http:\/\/localhost:3001\/api\/portfolio'/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/portfolio`");

    fs.writeFileSync(f, c);
});
