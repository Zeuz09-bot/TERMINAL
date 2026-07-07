import { ModuleStub } from '@/components/ModuleStub'
import { BookMarked } from 'lucide-react'

export function KnowledgeVault() {
  return (
    <ModuleStub
      name="Knowledge Vault"
      description="Markdown knowledge base organized into structured folders. Full-text search, bidirectional linking between notes and strategies, tags, and favorites."
      milestone={2}
      icon={BookMarked}
      features={[
        'Folders: Programming, Finance, Economics, Statistics, Machine Learning, Trading, Books, Psychology, Research',
        'Markdown editor with live preview',
        'Full-text indexed search',
        'Bidirectional note linking',
        'Tags and favorites',
        'Link notes to strategies and research papers',
        'XP award on note creation (+15 XP)',
      ]}
    />
  )
}
