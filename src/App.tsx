import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { CatalogFormPage } from './pages/catalog/CatalogFormPage'
import { MembersPage } from './pages/members/MembersPage'
import { CirculationPage } from './pages/circulation/CirculationPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { AboutPage } from './pages/settings/AboutPage'
import { DashboardLayout } from './components/layout/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/catalog"
          element={
            <DashboardLayout>
              <CatalogPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/catalog/new"
          element={
            <DashboardLayout>
              <CatalogFormPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/catalog/:id/edit"
          element={
            <DashboardLayout>
              <CatalogFormPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/members"
          element={
            <DashboardLayout>
              <MembersPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/circulation"
          element={
            <DashboardLayout>
              <CirculationPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <DashboardLayout>
              <ReportsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/settings/about"
          element={
            <DashboardLayout>
              <AboutPage />
            </DashboardLayout>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
