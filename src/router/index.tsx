// ============================================================
// TERMINAL — Router
// ============================================================

import { Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from '@/pages/Dashboard'
import { AlphaFactory } from '@/pages/AlphaFactory'
import { ResearchCenter } from '@/pages/ResearchCenter'
import { AlgorithmLab } from '@/pages/AlgorithmLab'
import { PropFirms } from '@/pages/PropFirms'
import { Certifications } from '@/pages/Certifications'
import { KnowledgeVault } from '@/pages/KnowledgeVault'
import { Journal } from '@/pages/Journal'
import { Calendar } from '@/pages/Calendar'
import { Analytics } from '@/pages/Analytics'
import { Settings } from '@/pages/Settings'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/"                index element={<Dashboard />} />
      <Route path="/alpha-factory"   element={<AlphaFactory />} />
      <Route path="/research"        element={<ResearchCenter />} />
      <Route path="/algorithm-lab"   element={<AlgorithmLab />} />
      <Route path="/prop-firms"      element={<PropFirms />} />
      <Route path="/certifications"  element={<Certifications />} />
      <Route path="/knowledge-vault" element={<KnowledgeVault />} />
      <Route path="/journal"         element={<Journal />} />
      <Route path="/calendar"        element={<Calendar />} />
      <Route path="/analytics"       element={<Analytics />} />
      <Route path="/settings"        element={<Settings />} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  )
}
