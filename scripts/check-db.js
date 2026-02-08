const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function checkTables() {
    try {
        // Read .env.local
        const envPath = path.join(__dirname, '..', '.env.local');
        if (!fs.existsSync(envPath)) {
            console.error('❌ .env.local not found!');
            return;
        }

        const envContent = fs.readFileSync(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });

        const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
        const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

        if (!supabaseUrl || !supabaseKey) {
            console.error('❌ Supabase URL or Key not found in .env.local');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const tablesToCheck = ['hero_slides', 'chat_sessions', 'chat_messages'];
        console.log('🔍 Checking tables...');

        for (const table of tablesToCheck) {
            const { error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.error(`❌ Table '${table}' check failed: ${error.message}`);
            } else {
                console.log(`✅ Table '${table}' exists.`);
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

checkTables();
