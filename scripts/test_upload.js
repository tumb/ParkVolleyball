const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'components', 'database', 'test-upload.txt');
    const data = fs.readFileSync(filePath);
    const safeName = `test-upload-${Date.now()}.txt`;
    const bucket = 'playoff-team-photos';

    console.log('Uploading to bucket:', bucket, 'as', safeName);
    const upload = await supabase.storage.from(bucket).upload(safeName, data, { upsert: true, contentType: 'text/plain' });
    console.log('upload result:', JSON.stringify(upload, null, 2));

    const pub = await supabase.storage.from(bucket).getPublicUrl(safeName);
    console.log('getPublicUrl:', JSON.stringify(pub, null, 2));

    // Try inserting a row into bracket_team_photo to verify DB permissions
    const payload = {
      bracketid: 1,
      teamid: 1,
      photo_type: 'champion',
      image_url: pub?.data?.publicUrl ?? null,
      storage_path: safeName,
    };
    console.log('Attempting upsert into bracket_team_photo:', payload);
    const { data, error } = await supabase.from('bracket_team_photo').upsert(payload, { onConflict: 'bracketid,teamid,photo_type' }).select().single();
    console.log('upsert result error:', error);
    console.log('upsert result data:', data);
  } catch (err) {
    console.error('UNCAUGHT ERROR', err.message || String(err), err);
  }
})();
