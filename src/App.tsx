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

import { OllamaPromptDialog } from './components/layout/OllamaPromptDialog';

function App() {
  const { mode, initSystem, isLoading, licenseError } = useSystemStore();

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

  if (licenseError) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#008080]">
        <div className="w-[450px] bg-classic-grey border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center mb-4">
            <span className="font-bold text-sm">System Activation Error</span>
            <div className="bg-classic-grey border border-t-white border-l-white border-b-black border-r-black px-1.5 text-black text-xs font-bold">X</div>
          </div>
          <div className="px-6 py-4 flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-4">
               <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-2 border-t-white border-l-white border-b-black border-r-black">!</div>
               <p className="text-black font-bold text-sm leading-tight">
                 {licenseError}
               </p>
            </div>
            <p className="text-gray-700 text-xs text-center">
              Please contact your system administrator or infoLib support to activate this machine.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-1 bg-classic-grey border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-sm font-bold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <OllamaPromptDialog />
      {mode === 'client' ? (
        <AttendancePage />
      ) : (
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
      )}
    </>
  );
}

export default App;
