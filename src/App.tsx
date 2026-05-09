import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { PatronPage } from './pages/patrons/PatronPage';
import { PatronForm } from './components/patrons/PatronForm';
import { CatalogForm } from './components/catalog/CatalogForm';
import { useAuthStore } from './stores/authStore';
import { MainLayout } from './components/layout/MainLayout';
import { useParams } from 'react-router-dom';
import { usePatronStore } from './stores/patronStore';
import { useSystemStore } from './stores/systemStore';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { useEffect } from 'react';
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PatronEditWrapper = () => {
  const { idno } = useParams();
  const { patrons } = usePatronStore();
  const patron = patrons.find((p) => p.idno === idno);

  if (!patron) return <div>Patron not found</div>;
  return <PatronForm initialData={patron} />;
};

function App() {
  const { mode, initSystem, isLoading } = useSystemStore();

  useEffect(() => {
    initSystem();
  }, [initSystem]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-classic-grey dark:bg-dark-surface">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="font-black text-2xl uppercase tracking-widest text-blue-900 dark:text-blue-100 italic">
            Initialising infoLib...
          </span>
        </div>
      </div>
    );
  }

  if (mode === 'client') {
    return <AttendancePage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CatalogForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrons"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PatronPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrons/new"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PatronForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/patrons/edit/:idno"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PatronEditWrapper />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
