// src/components/Presence/PresenceTracker.jsx
import React, { useState, useEffect } from 'react';
import { presenceService } from '../../services/presenceService';
import { teacherService } from '../../services/teacherService';

const PresenceTracker = () => {
  const [teachers, setTeachers] = useState([]);
  const [todayPresences, setTodayPresences] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, presencesData] = await Promise.all([
        teacherService.getTeachers(),
        presenceService.getPresencesByDateRange(selectedDate, selectedDate)
      ]);
      
      setTeachers(teachersData);
      
      // Convertir les présences en objet pour accès rapide
      const presencesMap = {};
      presencesData.forEach(presence => {
        presencesMap[presence.enseignantId] = presence;
      });
      setTodayPresences(presencesMap);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const handlePresenceChange = async (teacherId, statut) => {
    try {
      const presenceData = {
        enseignantId: teacherId,
        enseignantNom: teachers.find(t => t.id === teacherId)?.nom,
        enseignantPrenom: teachers.find(t => t.id === teacherId)?.prenom,
        date: selectedDate,
        statut: statut,
        heureArrivee: statut === 'present' ? new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : null
      };

      await presenceService.markPresence(presenceData);
      
      // Mettre à jour l'état local
      setTodayPresences(prev => ({
        ...prev,
        [teacherId]: presenceData
      }));

      // Notifier les autres composants
      window.dispatchEvent(new Event('presencesUpdated'));
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      alert('Erreur lors du marquage de la présence');
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'present': return '#28a745';
      case 'absent': return '#dc3545';
      case 'conge': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'present': return '🟢 Présent';
      case 'absent': return '🔴 Absent';
      case 'conge': return '🟡 Congé';
      default: return '⚪ Non marqué';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des présences...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>📅 Suivi des Présences</h2>
          <p style={styles.subTitle}>
            {teachers.length} enseignant(s) - {selectedDate}
          </p>
        </div>
        <div style={styles.headerRight}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <button 
            style={styles.refreshButton}
            onClick={loadData}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {Object.values(todayPresences).filter(p => p.statut === 'present').length}
          </span>
          <span style={styles.statLabel}>Présents</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {Object.values(todayPresences).filter(p => p.statut === 'absent').length}
          </span>
          <span style={styles.statLabel}>Absents</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {Object.values(todayPresences).filter(p => p.statut === 'conge').length}
          </span>
          <span style={styles.statLabel}>Congés</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {teachers.length - Object.keys(todayPresences).length}
          </span>
          <span style={styles.statLabel}>Non marqués</span>
        </div>
      </div>

      {/* Liste des enseignants */}
      <div style={styles.teachersList}>
        {teachers.map(teacher => {
          const presence = todayPresences[teacher.id];
          const currentStatus = presence?.statut || 'non_marque';
          
          return (
            <div key={teacher.id} style={styles.teacherCard}>
              <div style={styles.teacherInfo}>
                <h4 style={styles.teacherName}>
                  {teacher.nom} {teacher.prenom}
                </h4>
                <p style={styles.teacherDepartment}>{teacher.departement}</p>
                {presence?.heureArrivee && (
                  <p style={styles.arrivalTime}>🕐 {presence.heureArrivee}</p>
                )}
              </div>
              
              <div style={styles.statusSection}>
                <span style={{
                  ...styles.currentStatus,
                  color: getStatusColor(currentStatus)
                }}>
                  {getStatusText(currentStatus)}
                </span>
                
                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.statusButton,
                      ...(currentStatus === 'present' ? styles.statusButtonActive : {})
                    }}
                    onClick={() => handlePresenceChange(teacher.id, 'present')}
                  >
                    ✅ Présent
                  </button>
                  <button
                    style={{
                      ...styles.statusButton,
                      ...(currentStatus === 'absent' ? styles.statusButtonActive : {})
                    }}
                    onClick={() => handlePresenceChange(teacher.id, 'absent')}
                  >
                    ❌ Absent
                  </button>
                  <button
                    style={{
                      ...styles.statusButton,
                      ...(currentStatus === 'conge' ? styles.statusButtonActive : {})
                    }}
                    onClick={() => handlePresenceChange(teacher.id, 'conge')}
                  >
                    🏖️ Congé
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {teachers.length === 0 && (
        <div style={styles.empty}>
          <h3>👨‍🏫 Aucun enseignant trouvé</h3>
          <p>Ajoutez des enseignants pour pouvoir suivre leurs présences.</p>
        </div>
      )}
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
    alignItems: 'flex-start',
    marginBottom: '30px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subTitle: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  stat: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '5px'
  },
  statLabel: {
    color: '#666',
    fontSize: '12px',
    fontWeight: '500'
  },
  teachersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  teacherCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    background: '#fafafa',
    transition: 'all 0.3s ease'
  },
  teacherInfo: {
    flex: 1
  },
  teacherName: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '16px',
    fontWeight: '600'
  },
  teacherDepartment: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  arrivalTime: {
    margin: '5px 0 0 0',
    color: '#888',
    fontSize: '12px'
  },
  statusSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px'
  },
  currentStatus: {
    fontSize: '14px',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  statusButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    background: 'white',
    transition: 'all 0.3s ease'
  },
  statusButtonActive: {
    background: '#5784BA',
    color: 'white',
    borderColor: '#5784BA'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  }
};

export default PresenceTracker;