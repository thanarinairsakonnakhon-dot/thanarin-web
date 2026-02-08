const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });

    const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
    const supabaseKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const tables = ['hero_slides', 'chat_sessions', 'chat_messages'];

    (async () => {
        console.log('Checking tables...');
        for (const table of tables) {
            const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
            if (error) {
                console.log(`❌ Table '${table}': NOT FOUND or Error (${error.message})`);
            } else {
                console.log(`✅ Table '${table}': OK`);
            }
        }
    })();

} catch (e) {
    console.error('Error reading .env.local:', e.message);
}
