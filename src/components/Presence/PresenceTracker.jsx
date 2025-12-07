// src/components/Presence/PresenceTracker.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { presenceService } from '../../services/presenceService';

const PresenceTracker = () => {
  const { user } = useContext(AuthContext);
  const [todayPresence, setTodayPresence] = useState(null);
  const [presenceHistory, setPresenceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadPresenceData();
  }, [selectedMonth, user]);

  const loadPresenceData = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const [todayData, historyData] = await Promise.all([
        presenceService.getPresenceByDateAndTeacher(user.uid, today),
        presenceService.getPresencesByTeacher(user.uid, selectedMonth)
      ]);
      
      setTodayPresence(todayData);
      setPresenceHistory(historyData || []);
    } catch (error) {
      console.error('Erreur chargement présences:', error);
    }
    setLoading(false);
  };

  const markPresence = async (statut = 'present') => {
    if (!user?.uid) return;
    
    setMarking(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      
      await presenceService.markPresence({
        enseignantId: user.uid,
        enseignantNom: user.nom,
        enseignantPrenom: user.prenom,
        date: today,
        heure: now,
        statut: statut,
        departement: user.departement
      });
      
      await loadPresenceData();
      alert('✅ Présence enregistrée avec succès!');
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      alert('❌ Erreur lors de l\'enregistrement de la présence');
    }
    setMarking(false);
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'present': return '#28a745';
      case 'absent': return '#dc3545';
      case 'retard': return '#ffc107';
      case 'conge': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'retard': return 'En retard';
      case 'conge': return 'Congé';
      default: return 'Non défini';
    }
  };

  const stats = {
    total: presenceHistory.length,
    presents: presenceHistory.filter(p => p.statut === 'present').length,
    absents: presenceHistory.filter(p => p.statut === 'absent').length,
    retards: presenceHistory.filter(p => p.statut === 'retard').length,
    taux: presenceHistory.length > 0 
      ? Math.round((presenceHistory.filter(p => p.statut === 'present').length / presenceHistory.length) * 100)
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
          <h2 style={styles.title}>📍 Gestion des Présences</h2>
          <p style={styles.subtitle}>Pointage quotidien et historique</p>
        </div>
        <div style={styles.monthSelector}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
        </div>
      </div>

      {/* Présence du jour */}
      <div style={styles.todaySection}>
        <h3 style={styles.sectionTitle}>📅 Aujourd'hui</h3>
        {todayPresence ? (
          <div style={styles.todayCard}>
            <div style={styles.todayStatus}>
              <div style={{
                ...styles.statusBadge,
                background: getStatusColor(todayPresence.statut)
              }}>
                {getStatusLabel(todayPresence.statut)}
              </div>
              <div style={styles.todayInfo}>
                <p style={styles.todayTime}>Heure: {todayPresence.heure || 'N/A'}</p>
                <p style={styles.todayDate}>Date: {new Date(todayPresence.date).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <p style={styles.alreadyMarked}>✅ Présence déjà enregistrée</p>
          </div>
        ) : (
          <div style={styles.todayCard}>
            <p style={styles.noPresence}>Aucune présence enregistrée aujourd'hui</p>
            <div style={styles.actionButtons}>
              <button 
                style={{...styles.markButton, ...styles.presentButton}}
                onClick={() => markPresence('present')}
                disabled={marking}
              >
                {marking ? '⏳ Enregistrement...' : '✅ Marquer Présent'}
              </button>
              <button 
                style={{...styles.markButton, ...styles.retardButton}}
                onClick={() => markPresence('retard')}
                disabled={marking}
              >
                {marking ? '⏳ Enregistrement...' : '⏰ Marquer Retard'}
              </button>
              <button 
                style={{...styles.markButton, ...styles.absentButton}}
                onClick={() => markPresence('absent')}
                disabled={marking}
              >
                {marking ? '⏳ Enregistrement...' : '❌ Marquer Absent'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Jours total</div>
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
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statNumber}>{stats.taux}%</div>
          <div style={styles.statLabel}>Taux de présence</div>
        </div>
      </div>

      {/* Historique */}
      <div style={styles.historySection}>
        <h3 style={styles.sectionTitle}>📋 Historique du mois</h3>
        {presenceHistory.length > 0 ? (
          <div style={styles.historyList}>
            {presenceHistory.map((presence, index) => (
              <div key={presence.id || index} style={styles.historyItem}>
                <div style={styles.historyDate}>
                  {new Date(presence.date).toLocaleDateString('fr-FR', { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </div>
                <div style={styles.historyTime}>{presence.heure || 'N/A'}</div>
                <div style={{
                  ...styles.historyStatus,
                  background: getStatusColor(presence.statut)
                }}>
                  {getStatusLabel(presence.statut)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyHistory}>
            <p>Aucune présence enregistrée pour ce mois</p>
          </div>
        )}
      </div>
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
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  monthInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  todaySection: {
    marginBottom: '30px'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  todayCard: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '10px',
    border: '1px solid #e9ecef'
  },
  todayStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '15px'
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px'
  },
  todayInfo: {
    flex: 1
  },
  todayTime: {
    margin: '5px 0',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  todayDate: {
    margin: '5px 0',
    color: '#666',
    fontSize: '13px'
  },
  alreadyMarked: {
    margin: 0,
    color: '#28a745',
    fontWeight: '500'
  },
  noPresence: {
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '14px'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  markButton: {
    flex: 1,
    minWidth: '150px',
    padding: '12px 20px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  presentButton: {
    background: '#28a745'
  },
  retardButton: {
    background: '#ffc107',
    color: '#333'
  },
  absentButton: {
    background: '#dc3545'
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
    color: '#1a7c4d',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  historySection: {
    marginTop: '30px'
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  historyDate: {
    minWidth: '120px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  historyTime: {
    minWidth: '80px',
    color: '#666',
    fontSize: '13px'
  },
  historyStatus: {
    marginLeft: 'auto',
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500'
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default PresenceTracker;
