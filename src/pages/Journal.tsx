import { ModuleStub } from '@/components/ModuleStub'
import { NotebookPen } from 'lucide-react'

export function Journal() {
  return (
    <ModuleStub
      name="Daily Journal"
      description="Structured daily journal automatically created each day. Tracks morning planning, deep work, research, trading activity, reflections, wins, failures, lessons, and physical metrics."
      milestone={2}
      icon={NotebookPen}
      features={[
        'Auto-created daily entry: Morning Plan, Deep Work Log, Research Log, Trading Log',
        'Evening reflection: Wins, Failures, Lessons',
        'Biometric tracking: Mood (1–5), Energy (1–5), Focus (1–5), Sleep (hours)',
        'Tomorrow\'s plan section',
        'Streak tracking across completed journal days',
        'XP award on journal completion (+30 XP)',
        'Calendar integration to surface journal entries by date',
      ]}
    />
  )
}
