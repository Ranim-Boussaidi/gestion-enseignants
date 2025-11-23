// src/components/Presence/PresenceCalendar.jsx
import React, { useState, useEffect } from 'react';
import { presenceService } from '../../services/presenceService';
import { teacherService } from '../../services/teacherService';

const PresenceCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [presences, setPresences] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, presencesData] = await Promise.all([
        teacherService.getTeachers(),
        presenceService.getPresencesByDateRange(
          `${currentMonth}-01`,
          `${currentMonth}-31`
        )
      ]);
      
      setTeachers(teachersData);
      setPresences(presencesData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month - 1, i));
    }
    
    return days;
  };

  const getPresenceForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return presences.filter(p => p.date === dateStr);
  };

  const getStatusStats = (datePresences) => {
    const stats = {
      present: datePresences.filter(p => p.statut === 'present').length,
      absent: datePresences.filter(p => p.statut === 'absent').length,
      conge: datePresences.filter(p => p.statut === 'conge').length,
      total: teachers.length
    };
    
    stats.nonMarque = stats.total - (stats.present + stats.absent + stats.conge);
    stats.tauxPresence = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
    
    return stats;
  };

  const getDayColor = (stats) => {
    if (stats.total === 0) return '#f8f9fa';
    if (stats.tauxPresence >= 80) return '#d4edda';
    if (stats.tauxPresence >= 60) return '#fff3cd';
    return '#f8d7da';
  };

  const days = getDaysInMonth();
  const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement du calendrier...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>📅 Calendrier des Présences</h2>
          <p style={styles.subTitle}>
            {teachers.length} enseignant(s) - {new Date(currentMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={styles.headerRight}>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            style={styles.monthInput}
          />
          <button 
            style={styles.refreshButton}
            onClick={loadData}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Légende */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#d4edda'}}></div>
          <span>≥ 80% présence</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#fff3cd'}}></div>
          <span>60-79% présence</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#f8d7da'}}></div>
          <span>&lt; 60% présence</span>
        </div>
      </div>

      {/* Calendrier */}
      <div style={styles.calendar}>
        {/* En-têtes des jours */}
        <div style={styles.weekHeader}>
          {weekDays.map(day => (
            <div key={day} style={styles.weekDayHeader}>
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div style={styles.daysGrid}>
          {days.map(day => {
            const datePresences = getPresenceForDate(day);
            const stats = getStatusStats(datePresences);
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
            
            return (
              <div
                key={day.toISOString()}
                style={{
                  ...styles.dayCell,
                  background: getDayColor(stats),
                  ...(isToday && styles.todayCell),
                  ...(isSelected && styles.selectedCell)
                }}
                onClick={() => setSelectedDate(day)}
                title={`${stats.present} présent(s), ${stats.absent} absent(s), ${stats.conge} congé(s)`}
              >
                <div style={styles.dayNumber}>
                  {day.getDate()}
                  {isToday && <span style={styles.todayDot}>•</span>}
                </div>
                
                <div style={styles.dayStats}>
                  <span style={styles.presentStat}>✅{stats.present}</span>
                  {stats.absent > 0 && <span style={styles.absentStat}>❌{stats.absent}</span>}
                  {stats.conge > 0 && <span style={styles.congeStat}>🏖️{stats.conge}</span>}
                </div>
                
                {stats.total > 0 && (
                  <div style={styles.presenceRate}>
                    {stats.tauxPresence}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Détails de la date sélectionnée */}
      {selectedDate && (
        <div style={styles.detailsPanel}>
          <div style={styles.detailsHeader}>
            <h3>Détails du {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
            <button 
              style={styles.closeButton}
              onClick={() => setSelectedDate(null)}
            >
              ✕
            </button>
          </div>
          
          <div style={styles.detailsStats}>
            <div style={styles.detailStat}>
              <span style={styles.detailNumber}>
                {getStatusStats(getPresenceForDate(selectedDate)).present}
              </span>
              <span style={styles.detailLabel}>Présents</span>
            </div>
            <div style={styles.detailStat}>
              <span style={styles.detailNumber}>
                {getStatusStats(getPresenceForDate(selectedDate)).absent}
              </span>
              <span style={styles.detailLabel}>Absents</span>
            </div>
            <div style={styles.detailStat}>
              <span style={styles.detailNumber}>
                {getStatusStats(getPresenceForDate(selectedDate)).conge}
              </span>
              <span style={styles.detailLabel}>Congés</span>
            </div>
          </div>

          <div style={styles.presenceList}>
            <h4>Liste des présences :</h4>
            {getPresenceForDate(selectedDate).map(presence => (
              <div key={presence.id} style={styles.presenceItem}>
                <span style={styles.teacherName}>
                  {presence.enseignantNom} {presence.enseignantPrenom}
                </span>
                <span style={{
                  ...styles.statusBadge,
                  ...(presence.statut === 'present' && styles.statusPresent),
                  ...(presence.statut === 'absent' && styles.statusAbsent),
                  ...(presence.statut === 'conge' && styles.statusConge)
                }}>
                  {presence.statut === 'present' ? '✅ Présent' : 
                   presence.statut === 'absent' ? '❌ Absent' : '🏖️ Congé'}
                </span>
                {presence.heureArrivee && (
                  <span style={styles.arrivalTime}>{presence.heureArrivee}</span>
                )}
              </div>
            ))}
            
            {getPresenceForDate(selectedDate).length === 0 && (
              <p style={styles.noData}>Aucune présence enregistrée pour cette date</p>
            )}
          </div>
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
    marginBottom: '20px'
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
  monthInput: {
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
  legend: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#666'
  },
  legendColor: {
    width: '15px',
    height: '15px',
    borderRadius: '3px'
  },
  calendar: {
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  weekHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    background: '#5784BA',
    color: 'white'
  },
  weekDayHeader: {
    padding: '12px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    background: '#e9ecef'
  },
  dayCell: {
    background: 'white',
    padding: '8px',
    minHeight: '100px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  todayCell: {
    border: '2px solid #5784BA'
  },
  selectedCell: {
    border: '2px solid #28a745',
    background: '#f0fff0 !important'
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  todayDot: {
    color: '#5784BA',
    fontSize: '16px'
  },
  dayStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    fontSize: '10px'
  },
  presentStat: {
    color: '#28a745'
  },
  absentStat: {
    color: '#dc3545'
  },
  congeStat: {
    color: '#ffc107'
  },
  presenceRate: {
    fontSize: '10px',
    color: '#666',
    marginTop: 'auto',
    textAlign: 'center'
  },
  detailsPanel: {
    marginTop: '20px',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    background: '#f8f9fa'
  },
  detailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#666'
  },
  detailsStats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  detailStat: {
    textAlign: 'center',
    background: 'white',
    padding: '15px',
    borderRadius: '6px',
    flex: 1
  },
  detailNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '5px'
  },
  detailLabel: {
    fontSize: '12px',
    color: '#666'
  },
  presenceList: {
    maxHeight: '300px',
    overflowY: 'auto'
  },
  presenceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'white',
    marginBottom: '8px',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  teacherName: {
    fontWeight: '500',
    color: '#333'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '500'
  },
  statusPresent: {
    background: '#d4edda',
    color: '#155724'
  },
  statusAbsent: {
    background: '#f8d7da',
    color: '#721c24'
  },
  statusConge: {
    background: '#fff3cd',
    color: '#856404'
  },
  arrivalTime: {
    fontSize: '11px',
    color: '#666'
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  }
};

export default PresenceCalendar;