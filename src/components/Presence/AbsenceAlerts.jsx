// src/components/Presence/AbsenceAlerts.jsx
import React, { useState, useEffect } from 'react';
import { presenceService } from '../../services/presenceService';
import { teacherService } from '../../services/teacherService';

const AbsenceAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today'); // today, week, month

  useEffect(() => {
    loadAlerts();
  }, [selectedPeriod]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const [teachersData, todayPresences] = await Promise.all([
        teacherService.getTeachers(),
        presenceService.getTodayPresences()
      ]);

      setTeachers(teachersData);
      
      // Générer les alertes
      const generatedAlerts = generateAlerts(teachersData, todayPresences, selectedPeriod);
      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
    setLoading(false);
  };

  const generateAlerts = (teachers, presences, period) => {
    const alerts = [];
    const today = new Date().toISOString().split('T')[0];
    
    // Vérifier que les paramètres sont des arrays
    if (!Array.isArray(teachers)) teachers = [];
    if (!Array.isArray(presences)) presences = [];
    
    // Alertes pour aujourd'hui
    if (period === 'today') {
      // Enseignants non marqués
      const nonMarkedTeachers = teachers.filter(teacher => 
        teacher && teacher.id && !presences.some(p => p && p.enseignantId === teacher.id)
      );
      
      nonMarkedTeachers.forEach(teacher => {
        if (teacher && teacher.nom && teacher.prenom) {
          alerts.push({
            id: `non-marked-${teacher.id}`,
            type: 'warning',
            title: 'Présence non marquée',
            message: `${teacher.nom || ''} ${teacher.prenom || ''} n'a pas encore marqué sa présence aujourd'hui`,
            teacher: teacher,
            date: today,
            priority: 'medium'
          });
        }
      });

      // Enseignants absents
      const absentTeachers = presences
        .filter(p => p && p.statut === 'absent')
        .map(p => teachers.find(t => t && t.id === p.enseignantId))
        .filter(Boolean);

      absentTeachers.forEach(teacher => {
        if (teacher && teacher.nom && teacher.prenom) {
          alerts.push({
            id: `absent-${teacher.id}`,
            type: 'danger',
            title: 'Absence non justifiée',
            message: `${teacher.nom || ''} ${teacher.prenom || ''} est absent aujourd'hui`,
            teacher: teacher,
            date: today,
            priority: 'high'
          });
        }
      });
    }
    
    // Ici on pourrait ajouter plus de logique pour les alertes hebdomadaires/mensuelles
    // comme les absences répétées, les retards fréquents, etc.

    return alerts.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger': return '🔴';
      case 'warning': return '🟡';
      case 'info': return '🔵';
      default: return '⚪';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const markAsResolved = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des alertes...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>🚨 Alertes Absences</h2>
          <p style={styles.subTitle}>
            {alerts.length} alerte(s) - Surveillance en temps réel
          </p>
        </div>
        <div style={styles.headerRight}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={styles.periodSelect}
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
          <button 
            style={styles.refreshButton}
            onClick={loadAlerts}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Résumé des alertes */}
      <div style={styles.alertSummary}>
        <div style={styles.summaryCard}>
          <div style={{...styles.summaryIcon, background: '#dc3545'}}>🔴</div>
          <div style={styles.summaryContent}>
            <h3 style={styles.summaryNumber}>
              {alerts.filter(a => a.priority === 'high').length}
            </h3>
            <p style={styles.summaryLabel}>Alertes critiques</p>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={{...styles.summaryIcon, background: '#ffc107'}}>🟡</div>
          <div style={styles.summaryContent}>
            <h3 style={styles.summaryNumber}>
              {alerts.filter(a => a.priority === 'medium').length}
            </h3>
            <p style={styles.summaryLabel}>Alertes warning</p>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={{...styles.summaryIcon, background: '#17a2b8'}}>🔵</div>
          <div style={styles.summaryContent}>
            <h3 style={styles.summaryNumber}>
              {alerts.filter(a => a.priority === 'low').length}
            </h3>
            <p style={styles.summaryLabel}>Alertes info</p>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div style={styles.alertsList}>
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              style={{
                ...styles.alertItem,
                borderLeft: `4px solid ${getAlertColor(alert.type)}`
              }}
            >
              <div style={styles.alertHeader}>
                <div style={styles.alertTitle}>
                  <span style={styles.alertIcon}>{getAlertIcon(alert.type)}</span>
                  <h4 style={styles.alertTitleText}>{alert.title}</h4>
                  <span style={{
                    ...styles.priorityBadge,
                    ...(alert.priority === 'high' && styles.priorityHigh),
                    ...(alert.priority === 'medium' && styles.priorityMedium),
                    ...(alert.priority === 'low' && styles.priorityLow)
                  }}>
                    {alert.priority === 'high' ? 'CRITIQUE' : 
                     alert.priority === 'medium' ? 'MOYEN' : 'FAIBLE'}
                  </span>
                </div>
                <button 
                  style={styles.resolveButton}
                  onClick={() => markAsResolved(alert.id)}
                  title="Marquer comme résolu"
                >
                  ✓ Résoudre
                </button>
              </div>
              
              <p style={styles.alertMessage}>{alert.message}</p>
              
              <div style={styles.alertDetails}>
                <span style={styles.teacherInfo}>
                  👨‍🏫 {alert.teacher?.nom || 'N/A'} {alert.teacher?.prenom || ''} - {alert.teacher?.departement || 'N/A'}
                </span>
                <span style={styles.alertDate}>
                  📅 {alert.date ? new Date(alert.date).toLocaleDateString('fr-FR') : 'N/A'}
                </span>
              </div>
              
              <div style={styles.alertActions}>
                <button style={styles.actionButton}>
                  📞 Contacter
                </button>
                <button style={styles.actionButton}>
                  ✉️ Envoyer rappel
                </button>
                <button style={styles.actionButton}>
                  📋 Voir historique
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.noAlerts}>
            <div style={styles.noAlertsIcon}>🎉</div>
            <h3>Aucune alerte pour le moment</h3>
            <p>Toutes les présences sont à jour et aucun problème détecté.</p>
          </div>
        )}
      </div>

      {/* Actions globales */}
      {alerts.length > 0 && (
        <div style={styles.globalActions}>
          <button style={styles.primaryButton}>
            📧 Envoyer un rappel groupé
          </button>
          <button style={styles.secondaryButton}>
            📊 Générer un rapport d'alertes
          </button>
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
  periodSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
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
  alertSummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  summaryCard: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #e9ecef'
  },
  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  summaryContent: {
    flex: 1
  },
  summaryNumber: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  summaryLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  alertItem: {
    background: '#fafafa',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  alertTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1
  },
  alertIcon: {
    fontSize: '18px'
  },
  alertTitleText: {
    margin: 0,
    color: '#333',
    fontSize: '16px',
    fontWeight: '600',
    flex: 1
  },
  priorityBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  priorityHigh: {
    background: '#f8d7da',
    color: '#721c24'
  },
  priorityMedium: {
    background: '#fff3cd',
    color: '#856404'
  },
  priorityLow: {
    background: '#d1ecf1',
    color: '#0c5460'
  },
  resolveButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  },
  alertMessage: {
    margin: '0 0 15px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  alertDetails: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    fontSize: '12px',
    color: '#888'
  },
  alertActions: {
    display: 'flex',
    gap: '10px'
  },
  actionButton: {
    background: 'white',
    border: '1px solid #ddd',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    color: '#5784BA'
  },
  noAlerts: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#666',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  noAlertsIcon: {
    fontSize: '50px',
    marginBottom: '15px'
  },
  globalActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef'
  },
  primaryButton: {
    background: '#5784BA',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  secondaryButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  }
};

export default AbsenceAlerts;