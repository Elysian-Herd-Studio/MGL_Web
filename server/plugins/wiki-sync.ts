import { syncWiki } from '../utils/wiki'

const SYNC_INTERVAL_MS = 60 * 60 * 1000

export default defineNitroPlugin(() => {
  const g = globalThis as typeof globalThis & { __mglWikiSyncStarted?: boolean }

  // Nitro re-runs plugins on dev HMR; don't stack intervals.
  if (g.__mglWikiSyncStarted) return
  g.__mglWikiSyncStarted = true

  // Sync once at boot, detached so it never blocks startup.
  syncWiki().catch((error) => {
    console.warn('[wiki] initial sync failed:', (error as Error).message)
  })

  const timer = setInterval(() => {
    syncWiki().catch((error) => {
      console.warn('[wiki] scheduled sync failed:', (error as Error).message)
    })
  }, SYNC_INTERVAL_MS)

  timer.unref?.()
})
