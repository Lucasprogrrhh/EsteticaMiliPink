const { Client } = require('./server/node_modules/pg');

// Render's external hostnames follow different patterns.
// Try multiple variants to find which one responds from outside Render's network.
const BASE_USER = 'estetica_db_q3op_user';
const BASE_PASS = 'KPxmMcSE3NHEAsrCdHhBa2s1GTaHh1iS';
const BASE_DB   = 'estetica_db_q3op';

const HOSTS_TO_TRY = [
    'dpg-d7ta02dckfvc73amlngg-a.oregon-postgres.render.com',
    'oregon-postgres.render.com',
];

async function tryConnect(host) {
    const client = new Client({
        host,
        port: 5432,
        user: BASE_USER,
        password: BASE_PASS,
        database: BASE_DB,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000,
    });
    try {
        await client.connect();
        console.log(`✅ Conectado a: ${host}`);
        const r = await client.query(`SELECT COUNT(*) as total FROM "Appointment"`);
        console.log(`   Total Appointments: ${r.rows[0].total}`);
        const latest = await client.query(`SELECT MAX("dateTime") as last_dt FROM "Appointment"`);
        console.log(`   MAX(dateTime): ${latest.rows[0].last_dt}`);

        const delfina = await client.query(`
            SELECT a.id, a."dateTime", a.status, u.name, s.name as service
            FROM "Appointment" a
            JOIN "User" u ON a."clientId" = u.id
            JOIN "Service" s ON a."serviceId" = s.id
            WHERE u.email = 'delfinamnaguel2@gmail.com'
        `);
        console.log(`   Delfina: ${delfina.rows.length > 0 ? 'ENCONTRADA - ' + delfina.rows.map(r=>r.service+'('+r.status+')').join(', ') : 'NO encontrada'}`);
        await client.end();
        return true;
    } catch(e) {
        console.log(`❌ ${host}: ${e.message}`);
        await client.end().catch(()=>{});
        return false;
    }
}

async function main() {
    console.log('Intentando conectar a Render Postgres desde fuera de su red...');
    for (const host of HOSTS_TO_TRY) {
        const ok = await tryConnect(host);
        if (ok) break;
    }
    console.log('\nNOTA: Si todos fallan, Render Postgres no admite conexiones externas desde esta IP.');
    console.log('En ese caso, la única forma de comparar datos es via la API de Render o desde dentro de su red.');
}

main();
