import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Get SQL from request body
    const { sql } = await req.json();
    
    if (!sql) {
      return new Response(
        JSON.stringify({ error: 'No SQL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Execute SQL using supabase-js raw query
    // Note: This requires the postgres_fdw extension or similar
    // For security, we'll validate the SQL first
    const forbiddenKeywords = ['DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE', 'DELETE FROM', 'UPDATE.*SET.*='];
    const sqlUpper = sql.toUpperCase();
    
    for (const keyword of forbiddenKeywords) {
      if (sqlUpper.match(keyword)) {
        return new Response(
          JSON.stringify({ error: `Forbidden SQL pattern: ${keyword}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        );
      }
    }

    // Execute via RPC if exec_sql exists, otherwise return instructions
    const { data, error } = await supabaseClient.rpc('exec_sql', { sql });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
