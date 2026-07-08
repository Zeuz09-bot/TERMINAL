// ============================================================
// TERMINAL — Hardcoded Mission Data
// ============================================================

export const MISSION_STATEMENT =
  'Build institutional-quality algorithmic trading systems through disciplined research, engineering, continuous learning, and execution while progressing toward financial independence.'

// ── Phases ──────────────────────────────────────────────────
export const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    status: 'active' as const,
    objectives: [
      'Build disciplined daily routines',
      'Complete BMC certification',
      'Begin CFA Level I preparation',
      'Read quantitative finance research papers daily',
      'Build the first backtesting engine',
      'Develop Version 1 of an algorithmic strategy',
      'Learn cloud fundamentals and improve Python engineering skills',
    ],
  },
  {
    id: 2,
    name: 'Research & Validation',
    status: 'locked' as const,
    objectives: [
      'Expand the strategy library',
      'Improve statistical and machine learning knowledge',
      'Validate strategies through backtesting and forward testing',
      'Maintain a detailed trading and research journal',
    ],
  },
  {
    id: 3,
    name: 'Evaluation',
    status: 'locked' as const,
    objectives: [
      'Pursue prop firm evaluations only after strategies meet predefined validation criteria',
      'Track evaluation progress and continuously refine systems based on evidence',
    ],
  },
  {
    id: 4,
    name: 'Scaling',
    status: 'locked' as const,
    objectives: [
      'Manage multiple compliant trading accounts where permitted',
      'Continue professional development through advanced certifications and engineering projects',
    ],
  },
]

// ── Level Ladder ─────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Recruit',           xpRequired: 0 },
  { level: 2, name: 'Researcher',        xpRequired: 500 },
  { level: 3, name: 'Developer',         xpRequired: 1500 },
  { level: 4, name: 'Engineer',          xpRequired: 3500 },
  { level: 5, name: 'Quant Researcher',  xpRequired: 7000 },
  { level: 6, name: 'System Builder',    xpRequired: 12000 },
  { level: 7, name: 'Algorithm Designer',xpRequired: 20000 },
  { level: 8, name: 'Portfolio Engineer',xpRequired: 32000 },
  { level: 9, name: 'Capital Operator',  xpRequired: 50000 },
  { level: 10, name: 'Institution',      xpRequired: 75000 },
]

// ── XP Awards ────────────────────────────────────────────────
export const XP_AWARDS = {
  research_paper_reviewed:       100,
  strategy_implemented:          400,
  backtest_completed:            250,
  certification_module_completed:200,
  journal_completed:             30,
  exercise:                      40,
  reading:                       30,
  experiment_created:            50,
  note_created:                  15,
  deep_work_hour:                25,
} as const

export type XPEventType = keyof typeof XP_AWARDS

// ── Certifications ────────────────────────────────────────────
export const CERTIFICATIONS = [
  // Software Engineering
  { id: 'python',         name: 'Python',           category: 'Software Engineering', priority: 1 },
  { id: 'git',            name: 'Git',               category: 'Software Engineering', priority: 2 },
  { id: 'docker',         name: 'Docker',            category: 'Software Engineering', priority: 3 },
  { id: 'aws',            name: 'AWS',               category: 'Software Engineering', priority: 4 },
  { id: 'system-design',  name: 'System Design',     category: 'Software Engineering', priority: 5 },
  // Finance
  { id: 'bmc',            name: 'BMC',               category: 'Finance', priority: 1 },
  { id: 'cmsa',           name: 'CMSA',              category: 'Finance', priority: 2 },
  { id: 'cfa',            name: 'CFA',               category: 'Finance', priority: 3 },
  { id: 'frm',            name: 'FRM',               category: 'Finance', priority: 4 },
  { id: 'cqf',            name: 'CQF',               category: 'Finance', priority: 5 },
  // Networking
  { id: 'aplus',          name: 'A+',                category: 'Networking', priority: 1 },
  { id: 'networkplus',    name: 'Network+',          category: 'Networking', priority: 2 },
  { id: 'ccna',           name: 'CCNA',              category: 'Networking', priority: 3 },
  // Cybersecurity
  { id: 'isc2cc',         name: 'ISC2 CC',           category: 'Cybersecurity', priority: 1 },
  { id: 'secplus',        name: 'Security+',         category: 'Cybersecurity', priority: 2 },
  { id: 'ejpt',           name: 'eJPT',              category: 'Cybersecurity', priority: 3 },
]

// ── Strategy Lifecycle ────────────────────────────────────────
export const STRATEGY_STAGES = [
  'Idea',
  'Research',
  'Hypothesis',
  'Implementation',
  'Backtesting',
  'Walk Forward Test',
  'Monte Carlo',
  'Paper Trading',
  'Prop Evaluation Ready',
  'Production',
] as const

export type StrategyStage = typeof STRATEGY_STAGES[number]

// ── Nav Modules ───────────────────────────────────────────────
export const NAV_MODULES = [
  { id: 'dashboard',       name: 'Dashboard',          path: '/',                    shortcut: null,  milestone: 1 },
  { id: 'alpha-factory',   name: 'Alpha Factory',      path: '/alpha-factory',       shortcut: 'S',   milestone: 3 },
  { id: 'research',        name: 'Research Center',    path: '/research',            shortcut: 'R',   milestone: 2 },
  { id: 'algorithm-lab',   name: 'Algorithm Lab',      path: '/algorithm-lab',       shortcut: 'A',   milestone: 3 },
  { id: 'prop-firms',      name: 'Prop Firm Center',   path: '/prop-firms',          shortcut: null,  milestone: 3 },
  { id: 'certifications',  name: 'Certifications',     path: '/certifications',      shortcut: null,  milestone: 2 },
  { id: 'knowledge-vault', name: 'Knowledge Vault',    path: '/knowledge-vault',     shortcut: 'N',   milestone: 2 },
  { id: 'journal',         name: 'Daily Journal',      path: '/journal',             shortcut: 'J',   milestone: 2 },
  { id: 'calendar',        name: 'Calendar',           path: '/calendar',            shortcut: 'C',   milestone: 2 },
  { id: 'analytics',       name: 'Analytics',          path: '/analytics',           shortcut: null,  milestone: 4 },
]

// ── Knowledge Folders ─────────────────────────────────────────
export const KNOWLEDGE_FOLDERS = [
  'Programming',
  'Finance',
  'Economics',
  'Statistics',
  'Machine Learning',
  'Trading',
  'Books',
  'Psychology',
  'Research',
]

// ── Algorithm Lab Sections ────────────────────────────────────
export const LAB_SECTIONS = [
  'Ideas',
  'Experiments',
  'Indicators',
  'Feature Engineering',
  'Datasets',
  'Optimization',
  'Machine Learning Models',
  'Risk Models',
  'Execution Models',
  'Broker Rules',
  'Market Regimes',
]

// ── Prop Firm Data ────────────────────────────────────────────
export const PROP_FIRM_STATUSES = [
  'researching',
  'attempting',
  'passed',
  'funded',
  'failed',
  'withdrawn',
] as const

export const PROP_FIRM_PROVIDERS = [
  'FTMO', 'MyForexFunds', 'The Funded Trader', 'Apex Trader Funding',
  'Earn2Trade', 'TopstepTrader', 'SurgeTrader', '5%ers', 'True Forex Funds',
  'E8 Funding', 'MyFundedFx', 'Alpha Capital Group', 'Fidelcrest',
  'Ment Funding', 'City Traders Imperium', 'Instant Funding',
]

