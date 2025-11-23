// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; // MAINTENANT AuthContext est exporté

// Components Auth
import AuthChoice from './components/Auth/AuthChoice';
import TeacherLogin from './components/Auth/TeacherLogin';
import TeacherRegister from './components/Auth/TeacherRegister';
import AdminLogin from './components/Auth/Login';

// Components Dashboard
import AdminDashboard from './pages/Dashboard/AdminDashboard';
// import TeacherDashboard from './pages/Dashboard/TeacherDashboard'; // À créer plus tard

// Composant pour le contenu conditionnel
const AppContent = () => {
  const { user } = React.useContext(AuthContext);

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

      {/* Routes protégées Enseignant - TEMPORAIREMENT REDIRIGÉ VERS LOGIN */}
      <Route 
        path="/enseignant/*" 
        element={user?.role === 'teacher' ? <div>Dashboard Enseignant - À implémenter</div> : <Navigate to="/enseignant/login" />} 
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
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