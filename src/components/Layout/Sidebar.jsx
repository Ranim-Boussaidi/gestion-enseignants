// src/components/Layout/Sidebar.jsx
import React from 'react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: '📊' },
    { id: 'teachers', label: 'Enseignants', icon: '👨‍🏫' },
    { id: 'presence', label: 'Présences', icon: '✅' },
    { id: 'conges', label: 'Congés', icon: '🏖️' },
    { id: 'finance', label: 'Finances', icon: '💰' },
    { id: 'departments', label: 'Départements', icon: '🏢' },
    { id: 'reports', label: 'Rapports', icon: '📈' },
    { id: 'settings', label: 'Paramètres', icon: '⚙️' }
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logo}>🎓</div>
        <h3 style={styles.logoText}>ISET Jendouba</h3>
        <p style={styles.logoSubText}>Admin</p>
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
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            <span style={styles.menuLabel}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer Sidebar */}
      <div style={styles.sidebarFooter}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>A</div>
          <div style={styles.userDetails}>
            <p style={styles.userName}>Administrateur</p>
            <p style={styles.userEmail}>admin@ecole.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Styles de la Sidebar
const styles = {
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
    color: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
  },
  logoSection: {
    padding: '30px 20px 20px',
    borderBottom: '1px solid #4a6572',
    textAlign: 'center'
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
    gap: '5px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px 25px',
    background: 'transparent',
    border: 'none',
    color: '#ecf0f1',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '15px',
    textAlign: 'left',
    width: '100%'
  },
  menuItemActive: {
    background: 'rgba(52, 152, 219, 0.2)',
    borderRight: '4px solid #3498db',
    color: '#3498db'
  },
  menuIcon: {
    fontSize: '18px',
    width: '20px',
    textAlign: 'center'
  },
  menuLabel: {
    fontWeight: '500'
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid #4a6572',
    background: 'rgba(0,0,0,0.1)'
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
    background: '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    margin: '0 0 2px 0',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  userEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#bdc3c7',
    opacity: 0.8
  }
};

export default Sidebar;