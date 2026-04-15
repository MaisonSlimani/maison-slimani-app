const { createClient } = require('@supabase/supabase-js');
const url = 'https://cvfpaxihnqcwypzmgrdr.supabase.co';
const key = 'sb_publishable_OsXwZC5gEVsxBucWgsB2Hw_GzwteVRk';
const supabase = createClient(url, key);

async function check() {
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
