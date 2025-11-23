// src/components/Dashboard/QuickActions.jsx
import React from 'react';

const QuickActions = () => {
  const actions = [
    { id: 1, label: 'Ajouter un enseignant', icon: '👥', path: '/teachers' },
    { id: 2, label: 'Vérifier les présences', icon: '✅', path: '/presence' },
    { id: 3, label: 'Valider les congés', icon: '📝', path: '/conges' },
    { id: 4, label: 'Générer un rapport', icon: '📊', path: '/reports' }
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>⚡ Actions Rapides</h3>
      <div style={styles.actionsGrid}>
        {actions.map(action => (
          <button key={action.id} style={styles.actionButton}>
            <span style={styles.actionIcon}>{action.icon}</span>
            <span style={styles.actionLabel}>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  title: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px'
  },
  actionButton: {
    background: '#f8f9fa',
    border: '1px solid #e0e0e0',
    padding: '20px 15px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  actionIcon: {
    fontSize: '24px'
  },
  actionLabel: {
    fontWeight: '500',
    color: '#333'
  }
};

export default QuickActions;