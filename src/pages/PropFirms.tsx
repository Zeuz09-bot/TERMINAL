import { ModuleStub } from '@/components/ModuleStub'
import { Building2 } from 'lucide-react'

export function PropFirms() {
  return (
    <ModuleStub
      name="Prop Firm Command Center"
      description="Track multiple prop firm evaluations with firm-specific rules, risk calculators, and challenge progress dashboards. Only pursue evaluations after strategies meet predefined validation criteria."
      milestone={3}
      icon={Building2}
      features={[
        'Per-firm rule tracking: Daily Drawdown, Overall Drawdown, Profit Target, Min Trading Days',
        'News restrictions and scaling rules',
        'Challenge progress tracker with visual dashboard',
        'Risk calculator per account',
        'Evaluation journal and status management',
        'Firm comparison dashboard',
        'Compliance-first design — use only in accordance with each firm\'s terms',
      ]}
    />
  )
}
