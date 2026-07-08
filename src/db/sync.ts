import { create } from 'zustand'
import { db } from './schema'
import { supabase } from '@/lib/supabase'

interface SyncState {
  isSyncing: boolean
  lastSyncedAt: Date | null
  error: string | null
  sync: () => Promise<void>
}

const TABLES_TO_SYNC = [
  'profiles', 'xpLog', 'journalEntries', 'notes', 'strategies',
  'researchPapers', 'experiments', 'propFirms', 'certProgress', 'calendarEvents'
]

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncedAt: new Date(localStorage.getItem('terminal_last_sync') || 0),
  error: null,

  sync: async () => {
    if (get().isSyncing) return
    set({ isSyncing: true, error: null })

    try {
      const lastSyncIso = get().lastSyncedAt?.toISOString() || '1970-01-01T00:00:00.000Z'
      const newSyncTime = new Date()

      // 1. PULL changes from Supabase
      const { data: remoteChanges, error: pullError } = await supabase
        .from('terminal_sync')
        .select('*')
        .gt('updated_at', lastSyncIso)

      if (pullError) throw pullError

      if (remoteChanges && remoteChanges.length > 0) {
        // Apply remote changes locally inside a transaction
        // @ts-ignore
        await db.transaction('rw', [...TABLES_TO_SYNC, 'tombstones'].map(t => db[t]), async () => {
          for (const record of remoteChanges) {
            // @ts-ignore
            const localTable = db[record.collection]
            if (!localTable) continue

            if (record.deleted) {
              const item = await localTable.where({ uuid: record.uuid }).first()
              if (item) {
                await localTable.delete(item.id)
                // The deleting hook will create a tombstone, but since its deletedAt
                // is older than the newSyncTime (or equal), we won't push it back if we filter right.
              }
            } else {
              const localItem = await localTable.where('uuid').equals(record.uuid).first()
              
              if (!localItem) {
                const { id, ...dataWithoutId } = record.data
                await localTable.add({ ...dataWithoutId, uuid: record.uuid })
              } else {
                // Update if remote is newer
                if (record.updated_at > (localItem.updatedAt || '1970')) {
                  // Pass the remote updatedAt so the hook doesn't overwrite it
                  const { id, ...dataWithoutId } = record.data
                  await localTable.update(localItem.id, { ...dataWithoutId, updatedAt: record.updated_at })
                }
              }
            }
          }
        })
      }

      // 2. PUSH local changes to Supabase
      const toPush = []

      for (const collection of TABLES_TO_SYNC) {
        // @ts-ignore
        const localTable = db[collection]
        const localChanges = await localTable
          .filter((item: any) => (item.updatedAt || '1970') > lastSyncIso && (item.updatedAt || '1970') <= newSyncTime.toISOString())
          .toArray()
        
        for (const item of localChanges) {
          if (!item.uuid) continue
          toPush.push({
            uuid: item.uuid,
            collection,
            data: item,
            updated_at: item.updatedAt,
            deleted: false
          })
        }
      }

      // Tombstones
      const localTombstones = await db.tombstones
        .filter(t => t.deletedAt > lastSyncIso && t.deletedAt <= newSyncTime.toISOString())
        .toArray()

      for (const t of localTombstones) {
        toPush.push({
          uuid: t.uuid,
          collection: t.collection,
          data: {},
          updated_at: t.deletedAt,
          deleted: true
        })
      }

      if (toPush.length > 0) {
        const { error: pushError } = await supabase
          .from('terminal_sync')
          .upsert(toPush, { onConflict: 'uuid' })
        
        if (pushError) throw pushError
      }

      // 3. Update Sync Time
      localStorage.setItem('terminal_last_sync', newSyncTime.toISOString())
      set({ lastSyncedAt: newSyncTime })

    } catch (err: any) {
      console.error('Sync error:', err)
      set({ error: err.message || 'Sync failed' })
    } finally {
      set({ isSyncing: false })
    }
  }
}))
