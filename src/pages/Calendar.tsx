import { ModuleStub } from '@/components/ModuleStub'
import { CalendarDays } from 'lucide-react'

export function Calendar() {
  return (
    <ModuleStub
      name="Calendar"
      description="Multi-view calendar with daily, weekly, monthly, and agenda layouts. Designed for deep work scheduling, study sessions, trading events, and deadline management."
      milestone={2}
      icon={CalendarDays}
      features={[
        'Views: Daily, Weekly, Monthly, Agenda',
        'Event categories: Study, Trading, Meeting, Exercise, Personal, Deadline',
        'Google Calendar synchronization (OAuth)',
        'Auto-import of meetings, study sessions, deadlines, and personal events',
        'Deep work block scheduling',
        'Recurring event support',
        'Integration with Journal — events appear in daily log',
      ]}
    />
  )
}
