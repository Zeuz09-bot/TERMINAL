import { ModuleStub } from '@/components/ModuleStub'
import { Beaker } from 'lucide-react'

export function AlgorithmLab() {
  return (
    <ModuleStub
      name="Algorithm Lab"
      description="Development workspace for quantitative experiments. Organize ideas, indicators, datasets, ML models, risk models, and execution models in a structured research environment."
      milestone={3}
      icon={Beaker}
      features={[
        'Sections: Ideas, Experiments, Indicators, Feature Engineering, Datasets, Optimization, ML Models, Risk Models, Execution Models, Broker Rules, Market Regimes',
        'Experiment tracking: Objective, Variables, Expected vs Actual Outcome, Conclusion',
        'Linkage to strategies and research papers',
        'Code snippet storage',
        'Status: Active, Completed, Failed, Archived',
      ]}
    />
  )
}
