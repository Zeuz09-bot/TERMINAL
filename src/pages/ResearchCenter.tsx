import { ModuleStub } from '@/components/ModuleStub'
import { BookOpen } from 'lucide-react'

export function ResearchCenter() {
  return (
    <ModuleStub
      name="Research Center"
      description="Database of quantitative finance research papers. Track reading status, extract key equations, capture implementation ideas, and connect papers to live strategies."
      milestone={2}
      icon={BookOpen}
      features={[
        'Paper database: Title, Authors, Year, Journal, Link, Tags',
        'Status tracking: Unread → Reading → Implemented / Rejected',
        'Key equations and implementation idea extraction',
        'Bidirectional linkage to strategies and experiments',
        'Favorites and fast search',
        'XP award on paper review completion (+100 XP)',
      ]}
    />
  )
}
