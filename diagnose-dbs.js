const { Client } = require('./server/node_modules/pg');
const fs = require('fs');

// Read local .env for Supabase credentials
const dotenvContent = fs.readFileSync('./server/.env', 'utf-8');
dotenvContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
        process.env[key] = val;
    }
});

async function diagnose(label, connectionString) {
    const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
    try {
        await client.connect();
        const host = new URL(connectionString).hostname;
        console.log(`\n=== ${label} ===`);
        console.log(`Host conectado: ${host}`);

        const count = await client.query(`SELECT COUNT(*) as total FROM "Appointment"`);
        console.log(`Total Appointments: ${count.rows[0].total}`);

        const latest = await client.query(`SELECT MAX("dateTime") as last_dt, MAX("createdAt") as last_created FROM "Appointment"`);
        console.log(`MAX(dateTime):   ${latest.rows[0].last_dt}`);
        console.log(`MAX(createdAt):  ${latest.rows[0].last_created}`);

        // Check for Delfina
        const delfina = await client.query(`
            SELECT a.id, a."dateTime", a.status, u.name, u.email, s.name as service
            FROM "Appointment" a
            JOIN "User" u ON a."clientId" = u.id
            JOIN "Service" s ON a."serviceId" = s.id
            WHERE u.email = 'delfinamnaguel2@gmail.com'
        `);
        if (delfina.rows.length > 0) {
            console.log(`Delfina Naguel: ENCONTRADA (${delfina.rows.length} turno/s)`);
            delfina.rows.forEach(r => console.log(`  → id=${r.id} | fecha=${r.dateTime} | estado=${r.status} | servicio=${r.service}`));
        } else {
            console.log(`Delfina Naguel: NO encontrada en esta base`);
        }

        // List all appointments for full picture
        const all = await client.query(`
            SELECT a."dateTime", a.status, u.name, u.email, s.name as service, a."createdAt"
            FROM "Appointment" a
            JOIN "User" u ON a."clientId" = u.id
            JOIN "Service" s ON a."serviceId" = s.id
            ORDER BY a."createdAt" DESC
            LIMIT 20
        `);
        console.log(`\nÚltimos 20 turnos en esta base:`);
        all.rows.forEach(r => console.log(`  ${r.createdAt?.toISOString?.() || r.createdAt} | ${r.name} | ${r.dateTime} | ${r.status} | ${r.service}`));

    } catch (e) {
        console.error(`Error conectando a ${label}: ${e.message}`);
    } finally {
        await client.end().catch(() => {});
    }
}

async function main() {
    // --- SUPABASE ---
    await diagnose('SUPABASE (DIRECT_URL)', process.env.DIRECT_URL);

    // --- RENDER POSTGRES (external hostname) ---
    // Internal host: dpg-d7ta02dckfvc73amlngg-a
    // External host: dpg-d7ta02dckfvc73amlngg-a.oregon-postgres.render.com
    const renderExternal = 'postgresql://estetica_db_q3op_user:KPxmMcSE3NHEAsrCdHhBa2s1GTaHh1iS@dpg-d7ta02dckfvc73amlngg-a.oregon-postgres.render.com/estetica_db_q3op';
    await diagnose('RENDER POSTGRES (externo)', renderExternal);
}

main();
