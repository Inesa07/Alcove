// Sends the reminders that are due as push notifications.
// Supabase calls it every minute (see supabase/push.sql). Calling it more often is harmless:
// each reminder is sent once.
// Secrets it needs (Edge Functions → Secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.
import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
webpush.setVapidDetails('mailto:inesasargsyan2021@gmail.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

Deno.serve(async () => {
  const now = new Date()
  const late = new Date(now.getTime() - 30 * 60 * 1000) // reminders more than 30 minutes late are skipped
  const { data: due, error } = await db.from('push_reminders').select('*').is('sent_at', null).lte('at', now.toISOString()).gte('at', late.toISOString()).limit(200)
  if (error) return new Response(error.message, { status: 500 })
  let sent = 0
  for (const r of due ?? []) {
    // mark it first, so two calls at the same time never send it twice
    const { data: mine } = await db.from('push_reminders').update({ sent_at: now.toISOString() }).eq('user_id', r.user_id).eq('id', r.id).is('sent_at', null).select('id')
    if (!mine?.length) continue
    const { data: subs } = await db.from('push_subscriptions').select('endpoint, keys').eq('user_id', r.user_id)
    const payload = JSON.stringify({ title: r.title, body: r.body, tag: r.id, url: r.url })
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 1800 })
        sent++
      } catch (e) {
        // the device is gone (app removed, permission taken back): forget it
        if (e?.statusCode === 404 || e?.statusCode === 410) await db.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
      }
    }
  }
  return new Response(JSON.stringify({ due: due?.length ?? 0, sent }), { headers: { 'Content-Type': 'application/json' } })
})
