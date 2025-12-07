// src/App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components Auth
import AuthChoice from './components/Auth/AuthChoice';
import TeacherLogin from './components/Auth/TeacherLogin';
import TeacherRegister from './components/Auth/TeacherRegister';
import AdminLogin from './components/Auth/Login';

// Components Dashboard
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import TeacherDashboard from './pages/Dashboard/TeacherDashboard';

// Composant pour le contenu conditionnel
const AppContent = () => {
  const { user, loading } = useContext(AuthContext);

  // Afficher un loading pendant la vérification de l'authentification
  if (loading) {
    return (
      <div style={loadingStyles}>
        <div style={loadingStyles.spinner}>⏳</div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<AuthChoice />} />
      <Route path="/enseignant/login" element={<TeacherLogin />} />
      <Route path="/enseignant/register" element={<TeacherRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Routes protégées Admin */}
      <Route 
        path="/admin/*" 
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" />} 
      />

      {/* Routes protégées Enseignant */}
      <Route 
        path="/enseignant/*" 
        element={user?.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/enseignant/login" />} 
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// Styles pour le loading
const loadingStyles = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontSize: '18px',
  spinner: {
    fontSize: '50px',
    marginBottom: '20px',
    animation: 'spin 1s linear infinite'
  }
};

// Composant principal
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;