const { Client } = require('pg');

async function findDatabase() {
    // First, connect to default postgres database to list all databases
    const client = new Client({
        host: 'cobra.c7kq2s4amhi5.ap-south-1.rds.amazonaws.com',
        port: 5432,
        user: 'postgres',
        password: 'Cobra202520',
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔌 Connecting to AWS RDS...');
        await client.connect();
        console.log('✅ Connected!\n');

        // List all databases
        console.log('📊 Available databases:');
        const dbResult = await client.query(`
            SELECT datname 
            FROM pg_database 
            WHERE datistemplate = false 
            AND datname NOT IN ('rdsadmin')
            ORDER BY datname;
        `);
        
        console.table(dbResult.rows);
        
        await client.end();

        // Now check each database for our tables
        console.log('\n🔍 Searching for game tables in each database...\n');
        
        for (const row of dbResult.rows) {
            const dbName = row.datname;
            console.log(`📂 Checking database: ${dbName}`);
            
            const dbClient = new Client({
                host: 'cobra.c7kq2s4amhi5.ap-south-1.rds.amazonaws.com',
                port: 5432,
                user: 'postgres',
                password: 'Cobra202520',
                database: dbName,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            try {
                await dbClient.connect();
                
                // Check for game tables
                const tableResult = await dbClient.query(`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name IN ('INSTANT_PLAY_ROOM', 'FRIEND_PLAY_ROOM', 'LOBBY_PLAY_ROOM', 'CLUB_PLAY_ROOM')
                    ORDER BY table_name;
                `);

                if (tableResult.rows.length > 0) {
                    console.log(`   ✅ FOUND! Database "${dbName}" contains:`);
                    tableResult.rows.forEach(t => {
                        console.log(`      - ${t.table_name}`);
                    });
                    console.log(`\n   🎯 USE THIS DATABASE NAME: "${dbName}"`);
                } else {
                    console.log(`   ⚪ No game tables found`);
                }

                await dbClient.end();
            } catch (err) {
                console.log(`   ❌ Error: ${err.message}`);
            }
        }

        console.log('\n📝 Next steps:');
        console.log('1. Copy the database name that contains your game tables');
        console.log('2. Open run-migration.js');
        console.log('3. Change line 9 from:');
        console.log('   database: \'postgres\',');
        console.log('   to:');
        console.log('   database: \'YOUR_DATABASE_NAME\',');
        console.log('4. Run migrate-database.bat again');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

console.log('🔍 Database Discovery Tool\n');
findDatabase();
