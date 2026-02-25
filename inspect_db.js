const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
    console.log("Fetching a row to infer property_id necessity...");
    const { data: cols, error: colsErr } = await supabase.from('service_requests').select('*').limit(1);
    console.log("Empty row fetch:", { cols, colsErr });
}

checkCols();
