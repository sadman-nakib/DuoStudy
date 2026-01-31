
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uiktmznmgqjxfkrnjnwg.supabase.co';
const supabaseKey = 'sb_publishable_bDITWWVl56sSKDT04cLRXA_TpnGqGHX';

export const supabase = createClient(supabaseUrl, supabaseKey);
