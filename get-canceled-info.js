const { Client } = require('./server/node_modules/pg');
const fs = require('fs');

// Force dotenv parsing to read DIRECT_URL from server/.env
const dotenvContent = fs.readFileSync('./server/.env', 'utf-8');
dotenvContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
    }
});

const connectionString = process.env.DIRECT_URL;

async function main() {
    const client = new Client({
        connectionString,
    });
    
    try {
        await client.connect();
        
        console.log("Obteniendo detalles de las citas en conflicto del 2026-06-24...");
        const res = await client.query(`
            SELECT 
                a.id, 
                a."dateTime", 
                a.status, 
                u.name as "clientName", 
                u.email as "clientEmail", 
                u.phone as "clientPhone",
                s.name as "serviceName"
            FROM "Appointment" a
            JOIN "User" u ON a."clientId" = u.id
            JOIN "Service" s ON a."serviceId" = s.id
            WHERE a.id IN ('7e565cd1-2011-4597-9187-7d7dbf97d486', '075e20a3-4171-468b-a7ad-34d99f216eba')
        `);
        
        console.log("DATOS_CITAS_CONFLIC_INICIO");
        console.dir(res.rows);
        console.log("DATOS_CITAS_CONFLIC_FIN");
    } catch (e) {
        console.error("Error al obtener detalles:", e);
    } finally {
        await client.end();
    }
}

main();
