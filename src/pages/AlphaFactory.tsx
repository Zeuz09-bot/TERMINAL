import { ModuleStub } from '@/components/ModuleStub'
import { FlaskConical } from 'lucide-react'

export function AlphaFactory() {
  return (
    <ModuleStub
      name="Alpha Factory"
      description="The heart of TERMINAL. Every strategy follows a rigorous lifecycle from Idea through Production. Track version history, performance metrics, research references, code snippets, and backtests."
      milestone={3}
      icon={FlaskConical}
      features={[
        'Full strategy lifecycle: Idea → Research → Hypothesis → Implementation → Backtesting → Walk Forward → Monte Carlo → Paper Trading → Prop Evaluation Ready → Production',
        'Version history with diff tracking',
        'Performance metrics: Sharpe, Max Drawdown, Win Rate, Profit Factor, Expectancy',
        'Research paper linkage',
        'Code snippet storage with syntax highlighting',
        'Risk rating and priority management',
        'Multi-market and multi-timeframe support',
      ]}
    />
  )
}
