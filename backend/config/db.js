const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

// Use service-role key for backend (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const connectDB = async () => {
  try {
    // Test connection by querying a simple table
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (that's fine, table exists)
      console.log('Supabase connection test note:', error.message);
    }
    console.log(`Supabase connected: ${supabaseUrl}`);
  } catch (err) {
    console.error('Supabase connection failed:', err.message);
  }
};

module.exports = { supabase, connectDB };
