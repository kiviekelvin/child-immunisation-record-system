import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { authService } from './lib/authService';

// Components
import { Layout } from './components/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/Dashboard';
import { PatientList } from './components/patients/PatientList';
import { PatientForm } from './components/patients/PatientForm';
import { VaccinationList } from './components/vaccinations/VaccinationList';
import { VaccinationForm } from './components/vaccinations/VaccinationForm';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { PendingRegistrations } from './components/admin/PendingRegistrations';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // useEffect callbacks can't be async directly, so we define an
    // async function inside and call it immediately.
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserProfile(currentUser);
        }
      } catch (err) {
        console.error('Error checking current user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      // Clear local state regardless, so the UI doesn't get stuck
      // logged-in if the network call fails.
      setUser(null);
      setUserProfile(null);
    }
  };

  const handleSignIn = (userData) => {
    setUser(userData);
    setUserProfile(userData);

    // Check if current location is accessible for the user's role
    const currentPath = location.pathname;
    const isAccessible = checkRouteAccess(currentPath, userData.role);

    // If current route is not accessible, redirect to dashboard
    if (!isAccessible) {
      navigate('/', { replace: true });
    }
  };

  // Function to check if a route is accessible for a given role
  const checkRouteAccess = (path, role) => {
    const routePermissions = {
      '/': ['admin', 'healthcare_worker', 'parent'],
      '/patients': ['admin', 'healthcare_worker'],
      '/patients/new': ['admin', 'healthcare_worker'],
      '/vaccinations': ['admin', 'healthcare_worker', 'parent'],
      '/vaccinations/new': ['admin', 'healthcare_worker'],
      '/reports': ['admin', 'healthcare_worker'],
      '/admin/registrations': ['admin'],
      '/settings': ['admin', 'healthcare_worker', 'parent'],
    };

    // Check exact path first
    if (routePermissions[path]) {
      return routePermissions[path].includes(role);
    }

    // Check path patterns
    if (path.startsWith('/patients/') && path.endsWith('/edit')) {
      return ['admin', 'healthcare_worker'].includes(role);
    }
    if (path.startsWith('/vaccinations/') && path.endsWith('/edit')) {
      return ['admin', 'healthcare_worker'].includes(role);
    }

    // Default to allowing access to dashboard and settings
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return <LoginForm onSignIn={handleSignIn} />;
  }

  return (
    <Layout user={userProfile} onSignOut={handleSignOut}>
      <Routes>
        <Route path="/" element={<Dashboard user={userProfile} />} />
        <Route
          path="/patients"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <PatientList userRole={userProfile.role} />
          }
        />
        <Route
          path="/patients/new"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <PatientForm />
          }
        />
        <Route
          path="/patients/:id/edit"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <PatientForm />
          }
        />
        <Route path="/vaccinations" element={<VaccinationList userRole={userProfile.role} />} />
        <Route
          path="/vaccinations/new"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <VaccinationForm />
          }
        />
        <Route
          path="/vaccinations/:id/edit"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <VaccinationForm />
          }
        />
        <Route
          path="/reports"
          element={
            userProfile.role === 'parent' ?
            <Navigate to="/" replace /> :
            <ReportsPage userRole={userProfile.role} />
          }
        />
        <Route
          path="/admin/registrations"
          element={
            userProfile.role !== 'admin' ?
            <Navigate to="/" replace /> :
            <PendingRegistrations />
          }
        />
        <Route path="/settings" element={<SettingsPage user={userProfile} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;