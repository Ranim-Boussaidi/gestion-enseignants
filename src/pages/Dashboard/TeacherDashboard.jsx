// src/pages/Dashboard/TeacherDashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import TeacherSidebar from '../../components/Layout/TeacherSidebar';
import TeacherProfile from '../../components/Teachers/TeacherProfile';
import PresenceTracker from '../../components/Presence/PresenceTracker';
import CongesList from '../../components/Conges/CongeList';
import TeacherSchedule from '../../components/Schedule/TeacherSchedule';
import CourseManagement from '../../components/Courses/CourseManagement';
import FinanceManagement from '../../components/Finance/FinanceManagement';
import { presenceService } from '../../services/presenceService';
import { financeService } from '../../services/financeService';
import { courseService } from '../../services/courseService';

const TeacherDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    presenceCount: 0,
    congesRestants: 0,
    tauxPresence: 0,
    matieresCount: 0,
    primesTotal: 0,
    acomptesTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && activeSection === 'dashboard') {
      loadDashboardStats();
    }
  }, [user, activeSection]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const teacherId = user?.id || user?.uid;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Récupérer les statistiques réelles
      const [
        presenceStats,
        financeStats,
        courses,
        congesData
      ] = await Promise.all([
        presenceService.getPresenceStats(teacherId, currentMonth, currentYear),
        financeService.getStatsFinancieres(teacherId),
        courseService.getCoursesByTeacher(teacherId),
        // Si vous avez un service pour les congés, utilisez-le ici
        Promise.resolve({ congesRestants: 20 }) // Valeur par défaut
      ]);

      // Calculer les statistiques
      const matieresUniques = [...new Set(courses.map(c => c.matiere))];
      const tauxPresence = presenceStats.totalJours > 0 
        ? Math.round((presenceStats.presences / presenceStats.totalJours) * 100)
        : 0;

      setDashboardStats({
        presenceCount: presenceStats.presences || 0,
        congesRestants: congesData.congesRestants || 20,
        tauxPresence: tauxPresence,
        matieresCount: matieresUniques.length || 0,
        primesTotal: financeStats?.montantTotalPrimes || 0,
        acomptesTotal: financeStats?.montantTotalAcomptes || 0
      });

    } catch (error) {
      console.error('Erreur chargement stats dashboard:', error);
      // Valeurs par défaut en cas d'erreur
      setDashboardStats({
        presenceCount: 0,
        congesRestants: 20,
        tauxPresence: 0,
        matieresCount: 0,
        primesTotal: 0,
        acomptesTotal: 0
      });
    }
    setLoading(false);
  };

  // Contenu selon la section active
  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return <TeacherDashboardContent 
          setActiveSection={setActiveSection} 
          stats={dashboardStats}
          loading={loading}
          user={user}
        />;
      case 'profile':
        return <TeacherProfile />;
      case 'presence':
        return <PresenceTracker />;
      case 'conges':
        return <CongesList />;
      case 'emploi_temps':
        return <TeacherSchedule />;
      case 'examens':
        return <CourseManagement />;
      case 'finance':
        return <FinanceManagement />;
      default:
        return <TeacherDashboardContent 
          setActiveSection={setActiveSection} 
          stats={dashboardStats}
          loading={loading}
          user={user}
        />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Enseignant */}
      <TeacherSidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.welcome}>
              {getSectionTitle(activeSection)}
            </h1>
            <p style={styles.subWelcome}>
              Bonjour, {user?.prenom} {user?.nom}
            </p>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.department}>{user?.departement}</span>
            <span style={styles.role}>Enseignant</span>
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
    profile: 'Mon Profil',
    presence: 'Gestion des Présences',
    conges: 'Mes Congés',
    examens: 'Cours & Examens',
    finance: 'Mes Finances',
    emploi_temps: 'Emploi du Temps'
  };
  return titles[section] || 'Tableau de Bord';
};

// Composant pour le contenu principal du dashboard
const TeacherDashboardContent = ({ setActiveSection, stats, loading, user }) => {

  // Fonction pour pointer la présence
  const handlePointage = () => {
    console.log('📍 Pointer présence - Redirection vers section présence');
    setActiveSection('presence');
  };

  // Fonction pour demander un congé
  const handleDemanderConge = () => {
    console.log('🏖 Demander congé - Redirection vers section congés');
    setActiveSection('conges');
  };

  // Fonction pour consulter l'emploi du temps
  const handleConsulterEmploiTemps = () => {
    console.log('📚 Consulter emploi du temps - Redirection vers section emploi du temps');
    setActiveSection('emploi_temps');
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Statistiques personnelles */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <h3 style={styles.statNumber}>{stats.presenceCount}</h3>
          <p style={styles.statLabel}>Présences ce mois</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏖</div>
          <h3 style={styles.statNumber}>{stats.congesRestants}</h3>
          <p style={styles.statLabel}>Jours de congé restants</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <h3 style={styles.statNumber}>{stats.tauxPresence}%</h3>
          <p style={styles.statLabel}>Taux de présence</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📚</div>
          <h3 style={styles.statNumber}>{stats.matieresCount}</h3>
          <p style={styles.statLabel}>Matières enseignées</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <h3 style={styles.statNumber}>{stats.primesTotal.toFixed(2)} TND</h3>
          <p style={styles.statLabel}>Total primes approuvées</p>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💸</div>
          <h3 style={styles.statNumber}>{stats.acomptesTotal.toFixed(2)} TND</h3>
          <p style={styles.statLabel}>Total acomptes approuvés</p>
        </div>
      </div>

      {/* Sections principales */}
      <div style={styles.sectionsGrid}>
        {/* Présence du jour */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🕐 Gestion de Présence</h3>
          <div style={styles.presenceInfo}>
            <p style={styles.presenceText}>
              Votre présence aujourd'hui n'a pas encore été enregistrée.
            </p>
            <p style={styles.presenceHint}>
              Cliquez sur le bouton ci-dessous pour pointer votre présence.
            </p>
          </div>
          <button 
            style={styles.presenceButton}
            onClick={handlePointage}
          >
            📍 Pointer ma présence
          </button>
          <div style={styles.statsMini}>
            <div style={styles.statMini}>
              <span style={styles.statMiniLabel}>Présents ce mois:</span>
              <span style={styles.statMiniValue}>{stats.presenceCount}</span>
            </div>
            <div style={styles.statMini}>
              <span style={styles.statMiniLabel}>Taux:</span>
              <span style={styles.statMiniValue}>{stats.tauxPresence}%</span>
            </div>
          </div>
        </div>

        {/* Informations financières */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>💰 Résumé Financier</h3>
          <div style={styles.financeSummary}>
            <div style={styles.financeItem}>
              <span style={styles.financeLabel}>Primes approuvées:</span>
              <span style={styles.financeValue}>{stats.primesTotal.toFixed(2)} TND</span>
            </div>
            <div style={styles.financeItem}>
              <span style={styles.financeLabel}>Acomptes approuvés:</span>
              <span style={styles.financeValue}>{stats.acomptesTotal.toFixed(2)} TND</span>
            </div>
            <div style={styles.financeItem}>
              <span style={styles.financeLabel}>Solde disponible:</span>
              <span style={styles.financeValue}>
                {(stats.primesTotal - stats.acomptesTotal).toFixed(2)} TND
              </span>
            </div>
          </div>
          <button 
            style={styles.financeButton}
            onClick={() => setActiveSection('finance')}
          >
            💰 Voir le détail financier
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={styles.sectionsGrid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📚 Gestion des Cours</h3>
          <div style={styles.courseInfo}>
            <div style={styles.infoItem}>
              <span style={styles.infoIcon}>📖</span>
              <div>
                <p style={styles.infoTitle}>Matières enseignées</p>
                <p style={styles.infoValue}>{stats.matieresCount} matières</p>
              </div>
            </div>
            <button 
              style={styles.courseButton}
              onClick={() => setActiveSection('examens')}
            >
              📋 Voir tous mes cours
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🚀 Actions Rapides</h3>
          <div style={styles.quickActions}>
            <button 
              style={styles.actionButton}
              onClick={handlePointage}
            >
              <span style={styles.actionIcon}>📍</span>
              <div>
                <p style={styles.actionTitle}>Pointer présence</p>
                <p style={styles.actionDesc}>Enregistrer votre présence aujourd'hui</p>
              </div>
            </button>
            <button 
              style={styles.actionButton}
              onClick={handleDemanderConge}
            >
              <span style={styles.actionIcon}>🏖</span>
              <div>
                <p style={styles.actionTitle}>Demander congé</p>
                <p style={styles.actionDesc}>Soumettre une demande de congé</p>
              </div>
            </button>
            <button 
              style={styles.actionButton}
              onClick={handleConsulterEmploiTemps}
            >
              <span style={styles.actionIcon}>📅</span>
              <div>
                <p style={styles.actionTitle}>Emploi du temps</p>
                <p style={styles.actionDesc}>Consulter votre planning</p>
              </div>
            </button>
            <button 
              style={styles.actionButton}
              onClick={() => setActiveSection('finance')}
            >
              <span style={styles.actionIcon}>💰</span>
              <div>
                <p style={styles.actionTitle}>Mes finances</p>
                <p style={styles.actionDesc}>Consulter primes et acomptes</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
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
    borderBottom: '3px solid #1a7c4d'
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
  department: {
    background: '#e7f3ff',
    color: '#1a7c4d',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    border: '1px solid #bee5eb'
  },
  role: {
    background: '#1a7c4d',
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
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#c82333'
    }
  },
  content: {
    padding: '30px 40px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px',
    textAlign: 'center'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a7c4d',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '25px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderTop: '4px solid #1a7c4d',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)'
    }
  },
  statIcon: {
    fontSize: '30px',
    marginBottom: '15px'
  },
  statNumber: {
    fontSize: '32px',
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
    gap: '30px',
    marginBottom: '30px'
  },
  section: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 12px rgba(0,0,0,0.15)'
    }
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '20px',
    fontWeight: '600',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '10px'
  },
  presenceInfo: {
    marginBottom: '20px'
  },
  presenceText: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '15px'
  },
  presenceHint: {
    margin: 0,
    color: '#666',
    fontSize: '13px',
    fontStyle: 'italic'
  },
  presenceButton: {
    width: '100%',
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.3s ease',
    marginBottom: '15px',
    '&:hover': {
      background: '#166a3e'
    }
  },
  statsMini: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    borderTop: '1px solid #eee'
  },
  statMini: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  statMiniLabel: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px'
  },
  statMiniValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a7c4d'
  },
  financeSummary: {
    marginBottom: '20px'
  },
  financeItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  financeLabel: {
    color: '#666',
    fontSize: '14px'
  },
  financeValue: {
    color: '#333',
    fontWeight: '600',
    fontSize: '15px'
  },
  financeButton: {
    width: '100%',
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#138496'
    }
  },
  courseInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  infoIcon: {
    fontSize: '24px'
  },
  infoTitle: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  infoValue: {
    margin: 0,
    color: '#1a7c4d',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  courseButton: {
    width: '100%',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#5a6268'
    }
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
    textAlign: 'left',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
    '&:hover': {
      background: '#e9ecef',
      borderColor: '#1a7c4d',
      transform: 'translateX(5px)'
    }
  },
  actionIcon: {
    fontSize: '20px',
    width: '40px',
    height: '40px',
    background: '#e7f3ff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '15px',
    fontWeight: '600'
  },
  actionDesc: {
    margin: 0,
    color: '#666',
    fontSize: '13px'
  }
};

// Ajouter l'animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default TeacherDashboard;