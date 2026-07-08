import React, { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { Activity, BrainCircuit, Target, Trophy, Clock, PieChart as PieChartIcon } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { STRATEGY_STAGES } from '@/data/mission'
import './Analytics.css'

const STAGE_COLORS: Record<string, string> = {
  Idea: 'var(--muted)',
  Research: 'var(--blue)',
  Hypothesis: 'var(--blue)',
  Implementation: 'var(--yellow)',
  Backtesting: 'var(--yellow)',
  'Walk Forward Test': 'var(--yellow)',
  'Monte Carlo': 'var(--yellow)',
  'Paper Trading': 'var(--primary)',
  'Prop Evaluation Ready': 'var(--green)',
  Production: 'var(--green)',
}

export function Analytics() {
  // Fetch Data
  const journalEntries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().limit(30).toArray())
  const strategies = useLiveQuery(() => db.strategies.toArray())
  const propFirms = useLiveQuery(() => db.propFirms.toArray())

  // Memoize Biometrics Chart Data (reverse so oldest is left, newest is right)
  const biometricsData = useMemo(() => {
    if (!journalEntries) return []
    return [...journalEntries].reverse().map(entry => ({
      date: entry.date.split('-').slice(1).join('/'), // MM/DD
      mood: entry.mood,
      energy: entry.energy,
      focus: entry.focus,
    }))
  }, [journalEntries])

  // Memoize Strategy Pie Chart
  const strategyData = useMemo(() => {
    if (!strategies) return []
    const counts: Record<string, number> = {}
    strategies.forEach(s => {
      counts[s.stage] = (counts[s.stage] || 0) + 1
    })
    return Object.entries(counts).map(([stage, count]) => {
      return {
        name: stage,
        value: count,
        color: STAGE_COLORS[stage] || 'var(--muted)',
      }
    })
  }, [strategies])

  // Memoize Aggregate Stats
  const stats = useMemo(() => {
    const liveStrategies = strategies?.filter(s => s.stage === 'Production').length || 0
    const totalPropCapital = propFirms?.filter(f => f.status === 'funded').reduce((acc, f) => acc + f.accountSize, 0) || 0
    
    let avgSharpe = 0
    if (strategies && strategies.length > 0) {
      const withSharpe = strategies.filter(s => s.metrics?.sharpe)
      if (withSharpe.length > 0) {
        avgSharpe = withSharpe.reduce((acc, s) => acc + (s.metrics?.sharpe || 0), 0) / withSharpe.length
      }
    }

    return {
      liveStrategies,
      totalPropCapital,
      avgSharpe,
    }
  }, [strategies, propFirms])

  return (
    <div className="analytics module-page">
      <div className="module-header">
        <div>
          <h1 className="module-title">Analytics</h1>
          <div className="module-subtitle">System-wide performance and progress tracking</div>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Top KPIs */}
        <div className="card KPI-card">
          <div className="panel-header">
            <span className="panel-title">Production Systems</span>
            <BrainCircuit size={14} className="status-green" />
          </div>
          <div className="kpi-val mono status-green">{stats.liveStrategies}</div>
          <div className="kpi-sub muted">Live Trading Strategies</div>
        </div>

        <div className="card KPI-card">
          <div className="panel-header">
            <span className="panel-title">Funded Capital</span>
            <Trophy size={14} className="status-yellow" />
          </div>
          <div className="kpi-val mono status-yellow">${stats.totalPropCapital.toLocaleString()}</div>
          <div className="kpi-sub muted">From Prop Firms</div>
        </div>

        <div className="card KPI-card">
          <div className="panel-header">
            <span className="panel-title">Avg System Sharpe</span>
            <Target size={14} className="status-blue" />
          </div>
          <div className="kpi-val mono status-blue">{stats.avgSharpe.toFixed(2)}</div>
          <div className="kpi-sub muted">Across All Strategies</div>
        </div>

        {/* Biometrics Chart */}
        <div className="card chart-card wide-chart">
          <div className="panel-header">
            <span className="panel-title">Biometrics (Last 30 Days)</span>
            <Activity size={14} className="muted" />
          </div>
          <div className="chart-container">
            {biometricsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={biometricsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--muted-2)" fontSize={11} tickMargin={10} />
                  <YAxis stroke="var(--muted-2)" fontSize={11} domain={[0, 5]} ticks={[1,2,3,4,5]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text)' }} />
                  <Line type="monotone" dataKey="focus" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="energy" stroke="var(--yellow)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="mood" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">Not enough journal data to display trends.</div>
            )}
          </div>
        </div>

        {/* Strategy Pipeline */}
        <div className="card chart-card">
          <div className="panel-header">
            <span className="panel-title">Strategy Pipeline</span>
            <PieChartIcon size={14} className="muted" />
          </div>
          <div className="chart-container">
            {strategyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={strategyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {strategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '6px', fontSize: '12px', color: 'var(--text)' }}
                    itemStyle={{ color: 'var(--text)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No strategies in pipeline.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
