// ============================================================
// TERMINAL — Knowledge Vault
// ============================================================

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  BookMarked, Plus, Search, Star, Folder, X, Check,
  Edit3, Trash2, ChevronRight, Tag, Link
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Note, awardXP } from '@/db/schema'
import { KNOWLEDGE_FOLDERS, XP_AWARDS } from '@/data/mission'
import './KnowledgeVault.css'

const EMPTY_NOTE: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', content: '', folder: KNOWLEDGE_FOLDERS[0],
  tags: [], isFavorite: false, linkedNoteIds: [], linkedStrategyIds: [], linkedResearchIds: [],
}

// ── Note Editor ───────────────────────────────────────────────
function NoteEditor({ note, onSave, onCancel }: {
  note: Partial<Note>
  onSave: (data: Partial<Note>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<Note>>({ ...EMPTY_NOTE, ...note })
  const [tagInput, setTagInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const set = (key: keyof Note, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.tags?.includes(t)) set('tags', [...(form.tags ?? []), t])
    setTagInput('')
  }
  const removeTag = (t: string) => set('tags', (form.tags ?? []).filter(x => x !== t))

  return (
    <div className="note-editor">
      <div className="note-editor-toolbar">
        <input
          className="note-title-input"
          value={form.title ?? ''}
          onChange={e => set('title', e.target.value)}
          placeholder="Note title…"
        />
        <div className="note-editor-controls">
          <select
            className="input input-sm"
            value={form.folder ?? KNOWLEDGE_FOLDERS[0]}
            onChange={e => set('folder', e.target.value)}
            style={{ width: 160 }}
          >
            {KNOWLEDGE_FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <button
            className={`btn btn-icon btn-ghost ${form.isFavorite ? 'status-yellow' : ''}`}
            onClick={() => set('isFavorite', !form.isFavorite)}
            title="Favorite"
          >
            <Star size={14} fill={form.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={() => onSave(form)}>
            <Check size={12} /> {note.id ? 'Update' : 'Create Note'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="note-tag-bar">
        <Tag size={11} className="muted" />
        <div className="tag-list">
          {(form.tags ?? []).map(t => (
            <span key={t} className="tag tag-removable">
              {t}<button onClick={() => removeTag(t)}><X size={9} /></button>
            </span>
          ))}
        </div>
        <input
          className="tag-inline-input"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          placeholder="+ Add tag"
        />
      </div>

      <textarea
        ref={textareaRef}
        className="note-content-area"
        value={form.content ?? ''}
        onChange={e => set('content', e.target.value)}
        placeholder={`# ${form.title || 'Note title'}\n\nStart writing in markdown…\n\nUse ## for headings, **bold**, *italic*, - for lists, \`code\``}
      />
    </div>
  )
}

// ── Note Card ─────────────────────────────────────────────────
function NoteCard({ note, isSelected, onSelect, onEdit, onDelete, onFavorite }: {
  note: Note
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onFavorite: () => void
}) {
  const preview = note.content.split('\n').filter(l => l.trim() && !l.startsWith('#')).join(' ').slice(0, 120)

  return (
    <div className={`note-card ${isSelected ? 'note-card--selected' : ''}`} onClick={onSelect}>
      <div className="note-card-header">
        <div className="note-card-title">{note.title || 'Untitled'}</div>
        <div className="note-card-actions-row">
          <button
            className={`btn btn-icon btn-ghost ${note.isFavorite ? 'status-yellow' : ''}`}
            onClick={e => { e.stopPropagation(); onFavorite() }}
          >
            <Star size={11} fill={note.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      {preview && <div className="note-card-preview">{preview}</div>}
      <div className="note-card-footer">
        <span className="tag">{note.folder}</span>
        {note.tags.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
        {note.tags.length > 2 && <span className="tag">+{note.tags.length - 2}</span>}
        <span className="mono muted" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)' }}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export function KnowledgeVault() {
  const [search, setSearch] = useState('')
  const [filterFolder, setFilterFolder] = useState<string>('All')
  const [filterFav, setFilterFav] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray()) ?? []

  const filtered = useMemo(() => {
    return notes.filter(n => {
      if (filterFolder !== 'All' && n.folder !== filterFolder) return false
      if (filterFav && !n.isFavorite) return false
      if (search) {
        const q = search.toLowerCase()
        return n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some(t => t.includes(q))
      }
      return true
    })
  }, [notes, filterFolder, filterFav, search])

  const folderCounts = useMemo(() => {
    const c: Record<string, number> = { All: notes.length }
    KNOWLEDGE_FOLDERS.forEach(f => { c[f] = notes.filter(n => n.folder === f).length })
    return c
  }, [notes])

  const handleSave = async (data: Partial<Note>) => {
    const now = new Date().toISOString()
    if (editingNote?.id) {
      await db.notes.update(editingNote.id, { ...data, updatedAt: now })
    } else {
      const id = await db.notes.add({ ...EMPTY_NOTE, ...data, createdAt: now, updatedAt: now } as Note)
      await awardXP('note_created', `Note created: ${data.title}`, XP_AWARDS.note_created)
      const newNote = await db.notes.get(id)
      if (newNote) setSelectedNote(newNote)
    }
    setShowEditor(false)
    setEditingNote(null)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this note?')) {
      await db.notes.delete(id)
      if (selectedNote?.id === id) setSelectedNote(null)
    }
  }

  const handleFavorite = async (note: Note) => {
    await db.notes.update(note.id!, { isFavorite: !note.isFavorite, updatedAt: new Date().toISOString() })
    if (selectedNote?.id === note.id) {
      setSelectedNote({ ...note, isFavorite: !note.isFavorite })
    }
  }

  // Render markdown-ish content (basic, no dep)
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="note-h1">{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} className="note-h2">{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} className="note-h3">{line.slice(4)}</h3>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="note-li">{line.slice(2)}</li>
        if (line.trim() === '') return <div key={i} className="note-spacer" />
        // inline code
        const parts = line.split(/`([^`]+)`/)
        return (
          <p key={i} className="note-p">
            {parts.map((p, j) => j % 2 === 1 ? <code key={j} className="note-code">{p}</code> : p)}
          </p>
        )
      })
  }

  return (
    <div className="vault-page">
      {/* Header */}
      <div className="vault-header">
        <div>
          <div className="module-eyebrow mono muted">Knowledge System</div>
          <h1 className="module-title">Knowledge Vault</h1>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingNote({}); setShowEditor(true); setSelectedNote(null) }}>
          <Plus size={14} /> New Note
        </button>
      </div>

      <div className="vault-layout">
        {/* Sidebar: Folders + Notes List */}
        <div className="vault-sidebar">
          {/* Search */}
          <div className="search-wrap" style={{ marginBottom: 'var(--space-3)' }}>
            <Search size={13} className="search-icon muted" />
            <input
              className="input search-input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Folders */}
          <div className="vault-folders">
            {['All', ...KNOWLEDGE_FOLDERS].map(folder => (
              <button
                key={folder}
                className={`vault-folder-btn ${filterFolder === folder ? 'vault-folder-btn--active' : ''}`}
                onClick={() => setFilterFolder(folder)}
              >
                <Folder size={11} />
                <span>{folder}</span>
                <span className="vault-folder-count mono">{folderCounts[folder] ?? 0}</span>
              </button>
            ))}
            <button
              className={`vault-folder-btn ${filterFav ? 'vault-folder-btn--active' : ''}`}
              onClick={() => setFilterFav(f => !f)}
            >
              <Star size={11} fill={filterFav ? 'currentColor' : 'none'} />
              <span>Favorites</span>
              <span className="vault-folder-count mono">{notes.filter(n => n.isFavorite).length}</span>
            </button>
          </div>

          {/* Note List */}
          <div className="vault-note-list">
            {filtered.length === 0 ? (
              <div className="vault-empty">
                <BookMarked size={20} className="muted" />
                <div className="muted" style={{ fontSize: 'var(--text-xs)' }}>
                  {notes.length === 0 ? 'No notes yet' : 'No matches'}
                </div>
              </div>
            ) : (
              filtered.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isSelected={selectedNote?.id === note.id}
                  onSelect={() => { setSelectedNote(note); setShowEditor(false) }}
                  onEdit={() => { setEditingNote(note); setShowEditor(true) }}
                  onDelete={() => handleDelete(note.id!)}
                  onFavorite={() => handleFavorite(note)}
                />
              ))
            )}
          </div>
        </div>

        {/* Main: Editor or Viewer */}
        <div className="vault-main">
          {showEditor && editingNote !== null ? (
            <NoteEditor
              note={editingNote}
              onSave={handleSave}
              onCancel={() => { setShowEditor(false); setEditingNote(null) }}
            />
          ) : selectedNote ? (
            <div className="note-viewer">
              <div className="note-viewer-toolbar">
                <div>
                  <div className="note-viewer-title">{selectedNote.title || 'Untitled'}</div>
                  <div className="note-viewer-meta mono muted">
                    {selectedNote.folder} · Updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="note-viewer-actions">
                  <button
                    className={`btn btn-icon btn-ghost ${selectedNote.isFavorite ? 'status-yellow' : ''}`}
                    onClick={() => handleFavorite(selectedNote)}
                  >
                    <Star size={14} fill={selectedNote.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingNote(selectedNote); setShowEditor(true) }}>
                    <Edit3 size={12} /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedNote.id!)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              {selectedNote.tags.length > 0 && (
                <div className="note-viewer-tags">
                  {selectedNote.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              )}
              <div className="note-viewer-content">
                {renderContent(selectedNote.content)}
              </div>
            </div>
          ) : (
            <div className="vault-welcome">
              <BookMarked size={40} className="vault-welcome-icon" />
              <div className="vault-welcome-title">Knowledge Vault</div>
              <div className="vault-welcome-sub">Select a note to read, or create a new one.</div>
              <button className="btn btn-outline" onClick={() => { setEditingNote({}); setShowEditor(true) }}>
                <Plus size={14} /> New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
