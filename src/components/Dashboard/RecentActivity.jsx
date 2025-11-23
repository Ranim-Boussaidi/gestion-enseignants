// src/components/Dashboard/RecentActivity.jsx
import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, type: 'new', message: 'Nouvel enseignant ajouté - Prof. Ahmed', time: 'Il y a 2h', icon: '🆕' },
    { id: 2, type: 'presence', message: 'Présence enregistrée - Dépt. Informatique', time: 'Il y a 4h', icon: '✅' },
    { id: 3, type: 'conge', message: 'Demande de congé soumise - M. Ben Ali', time: 'Il y a 1j', icon: '🏖️' },
    { id: 4, type: 'update', message: 'Profil enseignant modifié - Mme. Trabelsi', time: 'Il y a 2j', icon: '✏️' }
  ];

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📈 Activité Récente</h3>
      <div style={styles.activityList}>
        {activities.map(activity => (
          <div key={activity.id} style={styles.activityItem}>
            <div style={styles.activityIcon}>{activity.icon}</div>
            <div style={styles.activityContent}>
              <p style={styles.activityMessage}>{activity.message}</p>
              <span style={styles.activityTime}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={styles.viewAllButton}>
        Voir toute l'activité →
      </button>
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
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    background: '#f8f9fa',
    borderRadius: '8px',
    transition: 'background 0.3s ease'
  },
  activityIcon: {
    fontSize: '18px',
    marginTop: '2px'
  },
  activityContent: {
    flex: 1
  },
  activityMessage: {
    margin: '0 0 5px 0',
    fontSize: '14px',
    color: '#333'
  },
  activityTime: {
    fontSize: '12px',
    color: '#888'
  },
  viewAllButton: {
    width: '100%',
    background: 'transparent',
    border: '1px solid #5784BA',
    color: '#5784BA',
    padding: '10px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  }
};

export default RecentActivity;