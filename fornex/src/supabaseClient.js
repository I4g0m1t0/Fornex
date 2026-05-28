import { createClient } from '@supabase/supabase-js'

// Retiramos o "/rest/v1/" do final!
const supabaseUrl = 'https://mczbuiyhlwvlelsacifu.supabase.co'
const supabaseKey = 'sb_publishable_M_UGnlOW5aHX2kPggZ9Sqg_fF45dwmb'

export const supabase = createClient(supabaseUrl, supabaseKey)