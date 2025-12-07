import React from 'react';

const TeacherSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '📊', description: 'Vue d\'ensemble' },
    { id: 'profile', label: 'Mon Profil', icon: '👤', description: 'Informations personnelles' },
    { id: 'presence', label: 'Présences', icon: '📍', description: 'Pointage quotidien' },
    { id: 'conges', label: 'Mes Congés', icon: '🏖', description: 'Demandes de congés' },
    { id: 'examens', label: 'Cours & Examens', icon: '📝', description: 'Planification cours et examens' },
    { id: 'finance', label: 'Mes Finances', icon: '💰', description: 'Primes et acomptes' },
  
    { id: 'emploi_temps', label: 'Emploi du Temps', icon: '📅', description: 'Planning hebdomadaire' },
    
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logo}>👨‍🏫</div>
        <h3 style={styles.logoText}>ISET Jendouba</h3>
        <p style={styles.logoSubText}>Espace Enseignant</p>
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menuItems.map(item => (
          <button
            key={item.id}
            style={{
              ...styles.menuItem,
              ...(activeSection === item.id ? styles.menuItemActive : {})
            }}
            onClick={() => setActiveSection(item.id)}
            title={item.description}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <div style={styles.menuContent}>
              <span style={styles.menuLabel}>{item.label}</span>
              {item.description && (
                <span style={styles.menuDescription}>{item.description}</span>
              )}
            </div>
           
          </button>
        ))}
      </nav>

      {/* Section Aide */}
      <div style={styles.helpSection}>
        <div style={styles.helpCard}>
          <span style={styles.helpIcon}>💡</span>
          <p style={styles.helpText}>
            Besoin d'aide ? Contactez l'administration
          </p>
        </div>
      </div>

      {/* Footer Sidebar */}
      <div style={styles.sidebarFooter}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            👨‍🏫
          </div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>Enseignant</p>
            <p style={styles.userEmail}>Bienvenue !</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #1a7c4d 0%, #0d5c34 100%)',
    color: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    overflowY: 'auto',
    zIndex: 100
  },
  logoSection: {
    padding: '30px 20px 20px',
    borderBottom: '1px solid #2e8b57',
    textAlign: 'center',
    flexShrink: 0
  },
  logo: {
    fontSize: '40px',
    marginBottom: '10px'
  },
  logoText: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ecf0f1'
  },
  logoSubText: {
    margin: 0,
    fontSize: '12px',
    color: '#bdc3c7',
    opacity: 0.8
  },
  nav: {
    flex: 1,
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    overflowY: 'auto'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    textAlign: 'left',
    width: '100%',
    position: 'relative'
  },
  menuItemActive: {
    background: 'rgba(255, 255, 255, 0.15)',
    borderRight: '4px solid #ffd700',
    color: '#ffd700'
  },
  menuIcon: {
    fontSize: '20px',
    width: '24px',
    textAlign: 'center',
    flexShrink: 0
  },
  menuContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  menuLabel: {
    fontWeight: '500',
    fontSize: '14px',
    lineHeight: '1.2'
  },
  menuDescription: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400'
  },
  newBadge: {
    background: '#ff6b6b',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '10px',
    fontSize: '9px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    flexShrink: 0
  },
  helpSection: {
    padding: '15px 20px',
    borderTop: '1px solid #2e8b57',
    flexShrink: 0
  },
  helpCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  helpIcon: {
    fontSize: '24px',
    display: 'block',
    marginBottom: '8px'
  },
  helpText: {
    margin: 0,
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.4'
  },
  sidebarFooter: {
    padding: '15px 20px',
    borderTop: '1px solid #2e8b57',
    background: 'rgba(0,0,0,0.15)',
    flexShrink: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0
  },
  userDetails: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    margin: '0 0 2px 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff'
  },
  userEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#bdc3c7',
    opacity: 0.8
  }
};

export default TeacherSidebar;