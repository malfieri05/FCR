'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function SupabaseTest() {
  const [result, setResult] = useState('Loading...');

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        if (error) setResult('Error: ' + error.message);
        else setResult('Success! Data: ' + JSON.stringify(data));
      });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Supabase Connection Test</h2>
      <pre>{result}</pre>
    </div>
  );
}
