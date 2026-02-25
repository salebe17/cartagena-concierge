const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTable() {
    console.log("Fetching empty row to infer columns...");
    const { data: cols, error: colsErr } = await supabase.from('service_requests').select('*').limit(1);
    console.log("Empty row fetch:", { cols, colsErr });

    console.log("Attempting a fake insert as Anon to trigger RLS error and see the detail...");
    const { error: insertErr } = await supabase.from('service_requests').insert({
        requester_id: '123e4567-e89b-12d3-a456-426614174000',
        service_type: 'maintenance',
        description: 'test',
        offered_price: 100,
        address: 'test address',
        status: 'pending'
    });
    console.log("Insert Test Failure Detail:", insertErr);
}

inspectTable();
