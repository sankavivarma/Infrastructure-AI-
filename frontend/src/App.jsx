import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import DataManagement from './pages/DataManagement';
import MLModels from './pages/MLModels';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import CostDelayTrends from './pages/CostDelayTrends';
import Benchmarks from './pages/Benchmarks';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="risk-analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ai-assistant" element={<AIAssistant />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="cost-delay-trends" element={<CostDelayTrends />} />
          <Route path="benchmarks" element={<Benchmarks />} />
          <Route path="reports" element={<Reports />} />
          <Route path="scenario" element={<ProjectDetail />} />
          <Route path="data-management" element={<DataManagement />} />
          <Route path="ml-models" element={<MLModels />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
