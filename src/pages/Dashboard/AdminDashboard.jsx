// src/pages/Dashboard/AdminDashboard.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Layout/Sidebar';
import TeacherList from '../../components/Teachers/TeacherList';
import StatsWidget from '../../components/Dashboard/StatsWidget';
import PresenceChart from '../../components/Dashboard/PresenceChart';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import QuickActions from '../../components/Dashboard/QuickActions';
import DepartmentList from '../../components/Departments/DepartmentList';
import AdminPresenceManagement from '../../components/Presence/AdminPresenceManagement';
import CongeList from '../../components/Conges/CongeList';
import CongeValidation from '../../components/Conges/CongeValidation';
import FinanceManagement from '../../components/Finance/FinanceManagement';
import CourseManagement from '../../components/Courses/CourseManagement';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Contenu selon la section active
  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'teachers':
        return <TeacherList />;
      case 'presence':
        return <AdminPresenceManagement />;
      case 'conges':
        return <CongeValidation />;
      case 'finance':
        return <FinanceManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'departments':
        return <DepartmentList />;
      case 'reports':
        return <div style={styles.contentPlaceholder}>📈 Rapports - Bientôt disponible</div>;
      case 'settings':
        return <div style={styles.contentPlaceholder}>⚙️ Paramètres - Bientôt disponible</div>;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.welcome}>
              {getSectionTitle(activeSection)}
            </h1>
            <p style={styles.subWelcome}>Bienvenue, {user?.email}</p>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.role}>Administrateur</span>
            <button onClick={logout} style={styles.logoutButton}>
              Déconnexion
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Fonction pour les titres des sections
const getSectionTitle = (section) => {
  const titles = {
    dashboard: 'Tableau de Bord',
    teachers: 'Gestion des Enseignants',
    presence: 'Gestion des Présences',
    conges: 'Validation des Congés',
    finance: 'Gestion Financière',
    courses: 'Cours & Examens',
    departments: 'Gestion des Départements',
    reports: 'Rapports et Statistiques',
    settings: 'Paramètres'
  };
  return titles[section] || 'Tableau de Bord';
};

// Composant pour le contenu du dashboard AVANCÉ
const DashboardContent = () => (
  <div>
    {/* Widgets de statistiques */}
    <div style={dashboardStyles.statsGrid}>
      <StatsWidget 
        title="Enseignants Total" 
        value="24" 
        icon="👨‍🏫" 
        color="#5784BA"
        subtitle="+2 ce mois"
      />
      <StatsWidget 
        title="Présences Aujourd'hui" 
        value="85%" 
        icon="✅" 
        color="#28a745"
        subtitle="18/21 enseignants"
      />
      <StatsWidget 
        title="Congés en Attente" 
        value="5" 
        icon="🏖️" 
        color="#ffc107"
        subtitle="À valider"
      />
      <StatsWidget 
        title="Départements" 
        value="8" 
        icon="🏢" 
        color="#6f42c1"
        subtitle="Actifs"
      />
    </div>

    {/* Grille principale */}
    <div style={dashboardStyles.mainGrid}>
      <div style={dashboardStyles.leftColumn}>
        <PresenceChart />
        <QuickActions />
      </div>
      <div style={dashboardStyles.rightColumn}>
        <RecentActivity />
      </div>
    </div>
  </div>
);

// Styles pour le dashboard avancé
const dashboardStyles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
    alignItems: 'flex-start'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  }
};

// Styles principaux
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8f9fa',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  mainContent: {
    flex: 1,
    marginLeft: '280px'
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderBottom: '3px solid #5784BA'
  },
  headerLeft: {
    flex: 1
  },
  welcome: {
    margin: 0,
    color: '#333',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  subWelcome: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '16px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  role: {
    background: '#5784BA',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500'
  },
  logoutButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  content: {
    padding: '30px 40px',
    minHeight: 'calc(100vh - 100px)'
  },
  contentPlaceholder: {
    background: 'white',
    padding: '60px 40px',
    textAlign: 'center',
    borderRadius: '10px',
    fontSize: '18px',
    color: '#666',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  // Anciens styles conservés pour compatibilité
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '25px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderTop: '4px solid #5784BA'
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    color: '#333'
  },
  statLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  },
  sectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px'
  },
  section: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '20px',
    fontWeight: '600',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  actionButton: {
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    textAlign: 'left',
    transition: 'all 0.3s ease'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '6px'
  },
  activityTime: {
    marginLeft: 'auto',
    color: '#888',
    fontSize: '12px'
  }
};


export default AdminDashboard;