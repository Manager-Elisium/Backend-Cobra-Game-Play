const { Client } = require('pg');

// Database configuration from .env
const client = new Client({
    host: 'cobra.c7kq2s4amhi5.ap-south-1.rds.amazonaws.com',
    port: 5432,
    user: 'postgres',
    password: 'Cobra202520',
    database: 'cobra_game_play', // ✅ Updated to correct database
    ssl: {
        rejectUnauthorized: false // AWS RDS requires SSL
    }
});

const migrations = [
    // INSTANT_PLAY_ROOM
    `ALTER TABLE "INSTANT_PLAY_ROOM" 
     ADD COLUMN IF NOT EXISTS "TURN_SEQUENCE" integer DEFAULT 0,
     ADD COLUMN IF NOT EXISTS "GAME_PHASE" varchar,
     ADD COLUMN IF NOT EXISTS "TIMER" integer DEFAULT 30,
     ADD COLUMN IF NOT EXISTS "DISTRIBUTED_CARD_PLAYER" varchar,
     ADD COLUMN IF NOT EXISTS "WINNER_USER_ID" varchar;`,
    
    // FRIEND_PLAY_ROOM (if exists)
    `DO $$
     BEGIN
         IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'FRIEND_PLAY_ROOM') THEN
             ALTER TABLE "FRIEND_PLAY_ROOM" 
             ADD COLUMN IF NOT EXISTS "TURN_SEQUENCE" integer DEFAULT 0,
             ADD COLUMN IF NOT EXISTS "GAME_PHASE" varchar,
             ADD COLUMN IF NOT EXISTS "TIMER" integer DEFAULT 30,
             ADD COLUMN IF NOT EXISTS "DISTRIBUTED_CARD_PLAYER" varchar,
             ADD COLUMN IF NOT EXISTS "WINNER_USER_ID" varchar;
             RAISE NOTICE 'FRIEND_PLAY_ROOM table updated';
         ELSE
             RAISE NOTICE 'FRIEND_PLAY_ROOM table does not exist, skipping';
         END IF;
     END $$;`,
    
    // LOBBY_PLAY_ROOM (if exists)
    `DO $$
     BEGIN
         IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'LOBBY_PLAY_ROOM') THEN
             ALTER TABLE "LOBBY_PLAY_ROOM" 
             ADD COLUMN IF NOT EXISTS "TURN_SEQUENCE" integer DEFAULT 0,
             ADD COLUMN IF NOT EXISTS "GAME_PHASE" varchar,
             ADD COLUMN IF NOT EXISTS "TIMER" integer DEFAULT 30,
             ADD COLUMN IF NOT EXISTS "DISTRIBUTED_CARD_PLAYER" varchar,
             ADD COLUMN IF NOT EXISTS "WINNER_USER_ID" varchar;
             RAISE NOTICE 'LOBBY_PLAY_ROOM table updated';
         ELSE
             RAISE NOTICE 'LOBBY_PLAY_ROOM table does not exist, skipping';
         END IF;
     END $$;`,
    
    // CLUB_PLAY_ROOM (if exists)
    `DO $$
     BEGIN
         IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'CLUB_PLAY_ROOM') THEN
             ALTER TABLE "CLUB_PLAY_ROOM" 
             ADD COLUMN IF NOT EXISTS "TURN_SEQUENCE" integer DEFAULT 0,
             ADD COLUMN IF NOT EXISTS "GAME_PHASE" varchar,
             ADD COLUMN IF NOT EXISTS "TIMER" integer DEFAULT 30,
             ADD COLUMN IF NOT EXISTS "DISTRIBUTED_CARD_PLAYER" varchar,
             ADD COLUMN IF NOT EXISTS "WINNER_USER_ID" varchar;
             RAISE NOTICE 'CLUB_PLAY_ROOM table updated';
         ELSE
             RAISE NOTICE 'CLUB_PLAY_ROOM table does not exist, skipping';
         END IF;
     END $$;`,
    
    // Initialize existing rows
    `UPDATE "INSTANT_PLAY_ROOM" 
     SET "TURN_SEQUENCE" = 0, "TIMER" = 30 
     WHERE "TURN_SEQUENCE" IS NULL OR "TIMER" IS NULL;`,
];

async function runMigration() {
    try {
        console.log('🔌 Connecting to AWS RDS PostgreSQL...');
        console.log(`   Host: ${client.host}`);
        console.log(`   Database: ${client.database}`);
        await client.connect();
        console.log('✅ Connected successfully!\n');
        
        console.log('📝 Running migrations...');
        for (let i = 0; i < migrations.length; i++) {
            console.log(`   ⏳ Running migration ${i + 1}/${migrations.length}...`);
            await client.query(migrations[i]);
            console.log(`   ✅ Migration ${i + 1}/${migrations.length} completed`);
        }
        
        console.log('\n✅ All migrations completed successfully!\n');
        
        // Verify
        console.log('📊 Verifying columns...');
        const result = await client.query(`
            SELECT 
                table_name,
                column_name,
                data_type,
                column_default
            FROM information_schema.columns 
            WHERE table_name IN ('INSTANT_PLAY_ROOM', 'FRIEND_PLAY_ROOM', 'LOBBY_PLAY_ROOM', 'CLUB_PLAY_ROOM')
            AND column_name IN ('TURN_SEQUENCE', 'GAME_PHASE', 'TIMER', 'DISTRIBUTED_CARD_PLAYER', 'WINNER_USER_ID')
            ORDER BY table_name, column_name;
        `);
        
        if (result.rows.length > 0) {
            console.log('\n✅ New columns successfully added:\n');
            console.table(result.rows);
        } else {
            console.log('⚠️ No columns found. Please check table names.');
        }
        
        // Count tables updated
        const tablesUpdated = [...new Set(result.rows.map(r => r.table_name))];
        console.log(`\n📈 Summary: ${tablesUpdated.length} table(s) updated with 5 new columns each`);
        console.log(`   Tables: ${tablesUpdated.join(', ')}`);
        
    } catch (error) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('password')) {
            console.error('\n💡 Tip: Check your database password');
        } else if (error.message.includes('connection')) {
            console.error('\n💡 Tip: Check AWS Security Group allows your IP on port 5432');
        } else if (error.message.includes('does not exist')) {
            console.error('\n💡 Tip: Check database name is correct');
        }
        
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Disconnected from database');
    }
}

// Run migration
console.log('🚀 Starting AWS RDS Database Migration for Production-Ready Features\n');
runMigration();
