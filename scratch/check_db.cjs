require('dotenv').config({ path: 'apps/web/.env' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  console.log('Querying URL:', url);
  const { data, error } = await supabase.from('produits').select('*').limit(1);
  if (error) {
    console.error('Error fetching produits:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns found in produits table:', Object.keys(data[0]));
  } else {
    console.log('No data found in produits table.');
  }
}

check();
