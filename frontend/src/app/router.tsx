import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { MainLayout } from '@/widgets/Layout/MainLayout';
import { AuthLayout } from '@/widgets/Layout/AuthLayout';

// Import pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ChatPage } from '@/pages/ChatPage';
import { DeclaracionPage } from '@/pages/DeclaracionPage';
import { BoletasPage } from '@/pages/BoletasPage';
import { FacturasPage } from '@/pages/FacturasPage';
import { HistorialPage } from '@/pages/HistorialPage';
import { SuscripcionPage } from '@/pages/SuscripcionPage';
import { AlertasPage } from '@/pages/AlertasPage';
import { MetricsPage } from '@/pages/MetricsPage';
import { FAQPage } from '@/pages/FAQPage';
import { MenuPage } from '@/pages/MenuPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SunatConfigPage } from '@/pages/SunatConfigPage';
import { SirePage } from '@/pages/SirePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to home if authenticated)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ChatPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/declarar"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DeclaracionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/boletas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <BoletasPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/facturas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FacturasPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <MainLayout>
              <HistorialPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/suscripcion"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SuscripcionPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/alertas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AlertasPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/metricas"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MetricsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FAQPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/menu"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MenuPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sunat-config"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SunatConfigPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/sire"
        element={
          <ProtectedRoute>
            <MainLayout>
              <SirePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};