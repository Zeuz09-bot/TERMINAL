import { ModuleStub } from '@/components/ModuleStub'
import { GraduationCap } from 'lucide-react'

export function Certifications() {
  return (
    <ModuleStub
      name="Certifications"
      description="Hardcoded professional development roadmap across Software Engineering, Finance, Networking, and Cybersecurity. Track study hours, completion percentage, deadlines, and notes."
      milestone={2}
      icon={GraduationCap}
      features={[
        'Software Engineering: Python, Git, Docker, AWS, System Design',
        'Finance: BMC, CMSA, CFA, FRM, CQF',
        'Networking: A+, Network+, CCNA',
        'Cybersecurity: ISC2 CC, Security+, eJPT',
        'Study hours tracking',
        'Completion percentage and deadlines',
        'Per-cert notes and study log',
        'XP award on module completion (+200 XP)',
      ]}
    />
  )
}
