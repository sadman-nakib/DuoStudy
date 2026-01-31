
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://uiktmznmgqjxfkrnjnwg.supabase.co';
const supabaseKey = 'sb_publishable_bDITWWVl56sSKDT04cLRXA_TpnGqGHX';

export const supabase = createClient(supabaseUrl, supabaseKey);
