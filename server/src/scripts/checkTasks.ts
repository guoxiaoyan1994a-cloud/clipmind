import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = '/Users/guoyannew/Desktop/clipmind/server/.env';
if (!fs.existsSync(envPath)) {
    console.error(`❌ .env file not found at ${envPath}`);
    process.exit(1);
}

dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env');
    console.log('Current Env:', { supabaseUrl, hasKey: !!supabaseServiceKey });
    // Print all env keys for debugging (mask values)
    Object.keys(process.env).forEach(key => {
        if (key.includes('SUPABASE') || key.includes('VITE')) {
             console.log(`${key}: ${process.env[key] ? 'SET' : 'EMPTY'}`);
        }
    });
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('--- 🔍 Checking Latest Tasks ---');
    try {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        console.table(data.map((t: any) => ({
            id: t.id.substring(0, 8),
            status: t.status,
            progress: t.progress,
            result_keys: t.result ? Object.keys(t.result).join(', ') : 'null',
            updated: t.updated_at
        })));
        
        if (data.length > 0) {
            console.log('\nLatest Task Result Details:');
            console.log(JSON.stringify(data[0].result, null, 2));
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
