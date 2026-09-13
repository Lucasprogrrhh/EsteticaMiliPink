const { Client } = require('./server/node_modules/pg');

async function testSupabasePoolers() {
    const urls = [
        'postgresql://postgres.rnvpomhelozwotjldwxt:Cirogimenez1@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
        'postgresql://postgres.rnvpomhelozwotjldwxt:Cirogimenez1@aws-1-us-west-2.pooler.supabase.com:5432/postgres',
        'postgresql://postgres:Cirogimenez1@db.rnvpomhelozwotjldwxt.supabase.co:5432/postgres'
    ];

    for (const url of urls) {
        console.log('\nProbando:', url);
        const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
        try {
            await client.connect();
            console.log('¡CONECTADO EXITOSAMENTE!');
            const res = await client.query('SELECT count(*) FROM "User"');
            console.log('Total de usuarios registrados:', res.rows[0].count);
            await client.end();
            return;
        } catch (e) {
            console.log('Error:', e.message);
            await client.end().catch(()=>{});
        }
    }
}

testSupabasePoolers();
