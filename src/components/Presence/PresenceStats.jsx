// src/components/Presence/PresenceStats.jsx
import React, { useState, useEffect } from 'react';
import { presenceService } from '../../services/presenceService';
import { teacherService } from '../../services/teacherService';
import { departmentService } from '../../services/departmentService';

const PresenceStats = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [stats, setStats] = useState({});
  const [departmentStats, setDepartmentStats] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [selectedMonth]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [teachersData, monthlyStats, presencesData] = await Promise.all([
        teacherService.getTeachers(),
        presenceService.getMonthlyStats(selectedMonth),
        presenceService.getPresencesByDateRange(
          `${selectedMonth}-01`,
          `${selectedMonth}-31`
        )
      ]);

      setTeachers(teachersData);
      setStats(monthlyStats);

      // Statistiques par département
      const deptStats = calculateDepartmentStats(teachersData, presencesData, selectedMonth);
      setDepartmentStats(deptStats);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
    setLoading(false);
  };

  const calculateDepartmentStats = (teachers, presences, month) => {
    const departments = [...new Set(teachers.map(t => t.departement))];
    
    return departments.map(dept => {
      const deptTeachers = teachers.filter(t => t.departement === dept);
      const deptPresences = presences.filter(p => 
        deptTeachers.some(t => t.id === p.enseignantId)
      );
      
      const present = deptPresences.filter(p => p.statut === 'present').length;
      const total = deptPresences.length;
      const tauxPresence = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        nom: dept,
        enseignants: deptTeachers.length,
        presences: total,
        present,
        tauxPresence
      };
    }).sort((a, b) => b.tauxPresence - a.tauxPresence);
  };

  const getTopPerformers = (teachers, presences, count = 5) => {
    const teacherStats = teachers.map(teacher => {
      const teacherPresences = presences.filter(p => p.enseignantId === teacher.id);
      const present = teacherPresences.filter(p => p.statut === 'present').length;
      const total = teacherPresences.length;
      const taux = total > 0 ? Math.round((present / total) * 100) : 0;
      
      return {
        ...teacher,
        presences: total,
        present,
        tauxPresence: taux
      };
    }).filter(t => t.presences > 0)
      .sort((a, b) => b.tauxPresence - a.tauxPresence)
      .slice(0, count);
    
    return teacherStats;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des statistiques...</div>
      </div>
    );
  }

  const topPerformers = getTopPerformers(teachers, 
    stats.presences || [] // Utiliser les présences du mois
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>📊 Statistiques des Présences</h2>
          <p style={styles.subTitle}>
            Analyse des présences pour {new Date(selectedMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={styles.headerRight}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={styles.monthInput}
          />
          <button 
            style={styles.refreshButton}
            onClick={loadStats}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div style={styles.mainStats}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{stats.tauxPresence || 0}%</h3>
            <p style={styles.statLabel}>Taux de présence</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{stats.presents || 0}</h3>
            <p style={styles.statLabel}>Présences</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{stats.absents || 0}</h3>
            <p style={styles.statLabel}>Absences</p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🏖️</div>
          <div style={styles.statContent}>
            <h3 style={styles.statNumber}>{stats.conges || 0}</h3>
            <p style={styles.statLabel}>Congés</p>
          </div>
        </div>
      </div>

      {/* Grille des statistiques détaillées */}
      <div style={styles.statsGrid}>
        {/* Meilleurs taux par département */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏆 Classement par Département</h3>
          <div style={styles.departmentList}>
            {departmentStats.map((dept, index) => (
              <div key={dept.nom} style={styles.departmentItem}>
                <div style={styles.rank}>
                  #{index + 1}
                </div>
                <div style={styles.departmentInfo}>
                  <span style={styles.departmentName}>{dept.nom}</span>
                  <span style={styles.departmentDetails}>
                    {dept.enseignants} enseignant(s) - {dept.presences} présence(s)
                  </span>
                </div>
                <div style={styles.departmentStats}>
                  <span style={{
                    ...styles.tauxPresence,
                    color: dept.tauxPresence >= 80 ? '#28a745' : 
                           dept.tauxPresence >= 60 ? '#ffc107' : '#dc3545'
                  }}>
                    {dept.tauxPresence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top enseignants */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>⭐ Meilleurs Présences</h3>
          <div style={styles.topTeachersList}>
            {topPerformers.map((teacher, index) => (
              <div key={teacher.id} style={styles.teacherItem}>
                <div style={styles.teacherRank}>
                  <span style={styles.rankBadge}>#{index + 1}</span>
                </div>
                <div style={styles.teacherInfo}>
                  <span style={styles.teacherName}>
                    {teacher.nom} {teacher.prenom}
                  </span>
                  <span style={styles.teacherDepartment}>
                    {teacher.departement}
                  </span>
                </div>
                <div style={styles.teacherStats}>
                  <span style={styles.teacherPresence}>
                    {teacher.present}/{teacher.presences}
                  </span>
                  <span style={{
                    ...styles.teacherRate,
                    color: teacher.tauxPresence >= 90 ? '#28a745' : 
                           teacher.tauxPresence >= 80 ? '#ffc107' : '#dc3545'
                  }}>
                    {teacher.tauxPresence}%
                  </span>
                </div>
              </div>
            ))}
            
            {topPerformers.length === 0 && (
              <p style={styles.noData}>Aucune donnée de présence ce mois-ci</p>
            )}
          </div>
        </div>
      </div>

      {/* Graphique circulaire simple */}
      <div style={styles.chartSection}>
        <h3 style={styles.sectionTitle}>📋 Répartition des Statuts</h3>
        <div style={styles.chartContainer}>
          <div style={styles.chart}>
            <div style={styles.chartLegend}>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, background: '#28a745'}}></div>
                <span>Présents: {stats.presents || 0}</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, background: '#dc3545'}}></div>
                <span>Absents: {stats.absents || 0}</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendColor, background: '#ffc107'}}></div>
                <span>Congés: {stats.conges || 0}</span>
              </div>
            </div>
          </div>
        </div>
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
    alignItems: 'flex-start',
    marginBottom: '30px'
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
  mainStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: '#f8f9fa',
    padding: '25px 20px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #e9ecef'
  },
  statIcon: {
    fontSize: '30px'
  },
  statContent: {
    flex: 1
  },
  statNumber: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  statLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  section: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  departmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  departmentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  rank: {
    background: '#5784BA',
    color: 'white',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  departmentInfo: {
    flex: 1
  },
  departmentName: {
    display: 'block',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px'
  },
  departmentDetails: {
    fontSize: '11px',
    color: '#666'
  },
  departmentStats: {
    textAlign: 'right'
  },
  tauxPresence: {
    fontSize: '16px',
    fontWeight: 'bold'
  },
  topTeachersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  teacherItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    background: 'white',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  teacherRank: {
    minWidth: '40px'
  },
  rankBadge: {
    background: '#ffc107',
    color: '#212529',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold'
  },
  teacherInfo: {
    flex: 1
  },
  teacherName: {
    display: 'block',
    fontWeight: '500',
    color: '#333',
    marginBottom: '2px'
  },
  teacherDepartment: {
    fontSize: '11px',
    color: '#666'
  },
  teacherStats: {
    textAlign: 'right'
  },
  teacherPresence: {
    display: 'block',
    fontSize: '12px',
    color: '#666',
    marginBottom: '2px'
  },
  teacherRate: {
    fontSize: '14px',
    fontWeight: 'bold'
  },
  chartSection: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  chart: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px'
  },
  chartLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px'
  },
  legendColor: {
    width: '15px',
    height: '15px',
    borderRadius: '3px'
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

export default PresenceStats;