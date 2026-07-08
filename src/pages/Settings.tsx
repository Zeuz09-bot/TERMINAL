import React, { useState, useRef } from 'react'
import { db } from '@/db/schema'
import { Download, Upload, Server, HardDrive, AlertTriangle } from 'lucide-react'
import './Settings.css'

export function Settings() {
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Export all data to JSON
  const handleExport = async () => {
    try {
      setExporting(true)
      const data = {
        profiles: await db.profiles.toArray(),
        xpLog: await db.xpLog.toArray(),
        journalEntries: await db.journalEntries.toArray(),
        notes: await db.notes.toArray(),
        strategies: await db.strategies.toArray(),
        researchPapers: await db.researchPapers.toArray(),
        experiments: await db.experiments.toArray(),
        propFirms: await db.propFirms.toArray(),
        certProgress: await db.certProgress.toArray(),
        calendarEvents: await db.calendarEvents.toArray(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `terminal_backup_${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
      alert('Failed to export data.')
    } finally {
      setExporting(false)
    }
  }

  // Import data from JSON
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      setImportMessage('Reading file...')
      
      const text = await file.text()
      const data = JSON.parse(text)

      setImportMessage('Merging data (this might trigger cloud sync)...')

      // Use a transaction to safely update all tables
      await db.transaction('rw', [
        db.profiles, db.xpLog, db.journalEntries, db.notes, db.strategies,
        db.researchPapers, db.experiments, db.propFirms, db.certProgress, db.calendarEvents
      ], async () => {
        if (data.profiles) await db.profiles.bulkPut(data.profiles)
        if (data.xpLog) await db.xpLog.bulkPut(data.xpLog)
        if (data.journalEntries) await db.journalEntries.bulkPut(data.journalEntries)
        if (data.notes) await db.notes.bulkPut(data.notes)
        if (data.strategies) await db.strategies.bulkPut(data.strategies)
        if (data.researchPapers) await db.researchPapers.bulkPut(data.researchPapers)
        if (data.experiments) await db.experiments.bulkPut(data.experiments)
        if (data.propFirms) await db.propFirms.bulkPut(data.propFirms)
        if (data.certProgress) await db.certProgress.bulkPut(data.certProgress)
        if (data.calendarEvents) await db.calendarEvents.bulkPut(data.calendarEvents)
      })

      setImportMessage('Import successful!')
      setTimeout(() => setImportMessage(''), 3000)
    } catch (err) {
      console.error('Import failed', err)
      setImportMessage('Failed to import data. Invalid format.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="settings-page module-page">
      <div className="module-header">
        <div>
          <h1 className="module-title">Settings</h1>
          <div className="module-subtitle">System configuration and data portability</div>
        </div>
      </div>

      <div className="settings-grid">
        {/* Data Portability Card */}
        <div className="card settings-card">
          <div className="panel-header">
            <span className="panel-title">Data Portability</span>
            <HardDrive size={14} className="muted" />
          </div>
          
          <div className="settings-card-body">
            <p className="muted text-sm">
              TERMINAL is local-first. Your data lives here on this device. You can export a snapshot of your entire system, or import a previous backup.
            </p>

            <div className="settings-actions">
              <button 
                className="btn btn-outline" 
                onClick={handleExport}
                disabled={exporting}
              >
                <Download size={14} />
                <span>{exporting ? 'Exporting...' : 'Export Backup (.json)'}</span>
              </button>

              <button 
                className="btn btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload size={14} />
                <span>Import Backup</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".json" 
                style={{ display: 'none' }} 
              />
            </div>

            {importMessage && (
              <div className="settings-message">
                <AlertTriangle size={14} className="status-yellow" />
                <span className="text-sm">{importMessage}</span>
              </div>
            )}
            
            <div className="settings-note">
              <strong>Note on importing:</strong> Importing a JSON backup will merge records. If an imported record has the same internal ID as an existing one, the existing one will be overwritten. New records will be appended. The cloud sync engine will automatically reconcile these changes.
            </div>
          </div>
        </div>

        {/* Sync Status Card */}
        <div className="card settings-card">
          <div className="panel-header">
            <span className="panel-title">Sync Infrastructure</span>
            <Server size={14} className="muted" />
          </div>
          <div className="settings-card-body">
            <p className="muted text-sm">
              Your data is automatically synced to the Supabase backend in real-time. No manual synchronization is required.
            </p>
            <div className="settings-env">
              <div className="env-row">
                <span className="env-key mono">Supabase URL:</span>
                <span className="env-val mono muted">{import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</span>
              </div>
              <div className="env-row">
                <span className="env-key">VITE_SUPABASE_ANON_KEY</span>
                <span className="env-val mono muted">{import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
