// Supabase project for sign-in and sync between devices.
// Paste the two values from Supabase → Project Settings → API. Both are safe to be public:
// the database only lets each person read and write their own rows.
export const SUPABASE_URL = 'https://hugsvebdqfmvpleqitym.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_mvBhXP7ZpL5shSWbWJ-lTg_Crdu3-Ha'

// The owner of the app: only this account can open #admin and read the usage statistics.
export const OWNER_EMAIL = 'inesasargsyan2021@gmail.com'

// Push reminders (when Alcove is closed): the public half of the key pair.
// The private half lives only in Supabase → Edge Functions → Secrets.
export const VAPID_PUBLIC_KEY = 'BGNvl8dUgukIUdMJTUHo4NYPhqEhZnNphj8gn8jLwYIQzWdrCwlO6jI9bWYhuWfoGaexVS9RGl5TpuWE5EeH5e0'
