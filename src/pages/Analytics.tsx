import { ModuleStub } from '@/components/ModuleStub'
import { BarChart3 } from 'lucide-react'

export function Analytics() {
  return (
    <ModuleStub
      name="Analytics"
      description="Comprehensive performance analytics with charts, heatmaps, and trend analysis across all activity domains — research, coding, trading, study, and exercise."
      milestone={4}
      icon={BarChart3}
      features={[
        'Activity heatmaps: consistency by day/week/month',
        'Hours breakdown: Research, Coding, Trading, Study, Exercise, Reading',
        'XP trend charts over time',
        'Streak and goal completion rate',
        'Strategy performance aggregation',
        'Journal mood/energy/focus trends',
        'Extensible AI hook for behavioral pattern detection',
      ]}
    />
  )
}
