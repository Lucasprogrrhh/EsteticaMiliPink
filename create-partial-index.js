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
        
        console.log("Buscando citas duplicadas activas (PENDING o CONFIRMED)...");
        const res = await client.query(`
            SELECT "dateTime", count(*), array_agg(id) as ids 
            FROM "Appointment" 
            WHERE "status" IN ('PENDING', 'CONFIRMED')
            GROUP BY "dateTime"
            HAVING count(*) > 1
        `);
        
        console.log("Duplicados encontrados:", res.rows);
        
        if (res.rows.length > 0) {
            console.log("Limpiando duplicados... Mantendremos solo la cita más antigua de cada duplicado y cancelaremos las demás.");
            for (const row of res.rows) {
                const ids = row.ids;
                // Mantener el primero, cancelar el resto
                const toCancel = ids.slice(1);
                console.log(`Cancelando citas: ${toCancel.join(', ')}`);
                await client.query(`
                    UPDATE "Appointment" 
                    SET "status" = 'CANCELLED' 
                    WHERE id = ANY($1::text[])
                `, [toCancel]);
            }
            console.log("Limpieza completada.");
        }
        
        console.log("Creando el índice único parcial 'Appointment_dateTime_unique_partial' sobre la columna 'dateTime'...");
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_dateTime_unique_partial" 
            ON "Appointment" ("dateTime") 
            WHERE "status" IN ('PENDING', 'CONFIRMED');
        `);
        
        console.log("¡Índice parcial único creado exitosamente en PostgreSQL!");
    } catch (e) {
        console.error("Error al ejecutar:", e);
    } finally {
        await client.end();
    }
}

main();
