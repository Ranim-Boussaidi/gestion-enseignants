// src/components/Presence/AdminPresenceManagement.jsx
import React, { useState, useEffect } from 'react';
import { presenceService } from '../../services/presenceService';
import { teacherService } from '../../services/teacherService';
import PresenceCalendar from './PresenceCalendar';
import PresenceStats from './PresenceStats';
import AbsenceAlerts from './AbsenceAlerts';

const AdminPresenceManagement = () => {
  const [activeTab, setActiveTab] = useState('calendar'); // calendar, stats, alerts
  const [todayPresences, setTodayPresences] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, presencesData] = await Promise.all([
        teacherService.getTeachers(),
        presenceService.getTodayPresences()
      ]);
      
      setTeachers(teachersData || []);
      setTodayPresences(presencesData || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
    setLoading(false);
  };

  const stats = {
    total: teachers.length,
    presents: todayPresences.filter(p => p.statut === 'present').length,
    absents: todayPresences.filter(p => p.statut === 'absent').length,
    nonMarques: teachers.length - todayPresences.length,
    taux: teachers.length > 0 
      ? Math.round((todayPresences.filter(p => p.statut === 'present').length / teachers.length) * 100)
      : 0
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>✅ Gestion des Présences</h2>
          <p style={styles.subtitle}>Suivi des présences de tous les enseignants</p>
        </div>
        <button 
          style={styles.refreshButton}
          onClick={loadData}
        >
          🔄 Actualiser
        </button>
      </div>

      {/* Statistiques du jour */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍🏫</div>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Enseignants total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statNumber}>{stats.presents}</div>
          <div style={styles.statLabel}>Présents</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statNumber}>{stats.absents}</div>
          <div style={styles.statLabel}>Absents</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statNumber}>{stats.nonMarques}</div>
          <div style={styles.statLabel}>Non marqués</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statNumber}>{stats.taux}%</div>
          <div style={styles.statLabel}>Taux de présence</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'calendar' && styles.tabActive)
          }}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendrier
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'stats' && styles.tabActive)
          }}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistiques
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'alerts' && styles.tabActive)
          }}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alertes
        </button>
      </div>

      {/* Contenu selon l'onglet */}
      {activeTab === 'calendar' && <PresenceCalendar />}
      {activeTab === 'stats' && <PresenceStats />}
      {activeTab === 'alerts' && <AbsenceAlerts />}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statIcon: {
    fontSize: '30px',
    marginBottom: '10px'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '2px solid #e9ecef'
  },
  tab: {
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease'
  },
  tabActive: {
    color: '#5784BA',
    borderBottomColor: '#5784BA'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default AdminPresenceManagement;

