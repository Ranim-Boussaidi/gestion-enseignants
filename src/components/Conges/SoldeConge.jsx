// src/components/Conges/SoldeConge.jsx
import React, { useState, useEffect } from 'react';
import { congeService } from '../../services/congeService';
import { teacherService } from '../../services/teacherService';

const SoldeConge = () => {
  const [teachers, setTeachers] = useState([]);
  const [soldes, setSoldes] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadSoldes();
  }, [selectedYear]);

  const loadSoldes = async () => {
    setLoading(true);
    try {
      const teachersData = await teacherService.getTeachers();
      setTeachers(teachersData);

      // Calculer les soldes pour chaque enseignant
      const soldesPromises = teachersData.map(async (teacher) => {
        const solde = await congeService.calculerSoldeConge(teacher.id, selectedYear);
        return { teacherId: teacher.id, solde };
      });

      const soldesData = await Promise.all(soldesPromises);
      
      const soldesMap = {};
      soldesData.forEach(({ teacherId, solde }) => {
        soldesMap[teacherId] = solde;
      });

      setSoldes(soldesMap);
    } catch (error) {
      console.error('Erreur chargement soldes:', error);
    }
    setLoading(false);
  };

  const getSoldeColor = (soldeRestant) => {
    if (soldeRestant >= 15) return '#28a745';
    if (soldeRestant >= 5) return '#ffc107';
    return '#dc3545';
  };

  const getSoldeIcon = (soldeRestant) => {
    if (soldeRestant >= 15) return '💰';
    if (soldeRestant >= 5) return '💸';
    return '🏃‍♂️';
  };

  const years = [2023, 2024, 2025, 2026];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Calcul des soldes de congé...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>💰 Soldes de Congé {selectedYear}</h3>
          <p style={styles.subTitle}>
            Vue d'ensemble des congés restants par enseignant
          </p>
        </div>
        <div style={styles.headerActions}>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={styles.yearSelect}
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            style={styles.refreshButton}
            onClick={loadSoldes}
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div style={styles.globalStats}>
        <div style={styles.globalStat}>
          <div style={styles.globalStatIcon}>📊</div>
          <div style={styles.globalStatContent}>
            <h4 style={styles.globalStatNumber}>{teachers.length}</h4>
            <p style={styles.globalStatLabel}>Enseignants</p>
          </div>
        </div>
        <div style={styles.globalStat}>
          <div style={styles.globalStatIcon}>🏖️</div>
          <div style={styles.globalStatContent}>
            <h4 style={styles.globalStatNumber}>
              {Object.values(soldes).reduce((sum, solde) => sum + solde.joursPris, 0)}
            </h4>
            <p style={styles.globalStatLabel}>Jours pris</p>
          </div>
        </div>
        <div style={styles.globalStat}>
          <div style={styles.globalStatIcon}>⏱️</div>
          <div style={styles.globalStatContent}>
            <h4 style={styles.globalStatNumber}>
              {Object.values(soldes).reduce((sum, solde) => sum + solde.soldeRestant, 0)}
            </h4>
            <p style={styles.globalStatLabel}>Jours restants</p>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#28a745'}}></div>
          <span>Solde confortable (≥ 15 jours)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#ffc107'}}></div>
          <span>Solde moyen (5-14 jours)</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.legendColor, background: '#dc3545'}}></div>
          <span>Solde faible (&lt; 5 jours)</span>
        </div>
      </div>

      {/* Tableau des soldes */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Enseignant</th>
              <th style={styles.th}>Département</th>
              <th style={styles.th}>Solde base</th>
              <th style={styles.th}>Jours pris</th>
              <th style={styles.th}>Solde restant</th>
              <th style={styles.th}>Congés approuvés</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => {
              const solde = soldes[teacher.id] || { 
                soldeBase: 30, 
                joursPris: 0, 
                soldeRestant: 30, 
                congesApprouves: 0 
              };
              
              return (
                <tr key={teacher.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{teacher.nom} {teacher.prenom}</strong>
                  </td>
                  <td style={styles.td}>{teacher.departement}</td>
                  <td style={styles.td}>{solde.soldeBase} jours</td>
                  <td style={styles.td}>{solde.joursPris} jours</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.soldeRestant,
                      color: getSoldeColor(solde.soldeRestant)
                    }}>
                      {solde.soldeRestant} jours
                    </span>
                  </td>
                  <td style={styles.td}>{solde.congesApprouves}</td>
                  <td style={styles.td}>
                    <span style={styles.status}>
                      {getSoldeIcon(solde.soldeRestant)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {teachers.length === 0 && (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>👨‍🏫</div>
          <h3>Aucun enseignant trouvé</h3>
          <p>Ajoutez des enseignants pour voir leurs soldes de congé.</p>
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
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginTop: '30px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  subTitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  yearSelect: {
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
    fontSize: '13px',
    fontWeight: '500'
  },
  globalStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  globalStat: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #e9ecef'
  },
  globalStatIcon: {
    fontSize: '30px'
  },
  globalStatContent: {
    flex: 1
  },
  globalStatNumber: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333'
  },
  globalStatLabel: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    flexWrap: 'wrap'
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
  tableContainer: {
    overflowX: 'auto',
    border: '1px solid #e9ecef',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  tableHeader: {
    background: '#f8f9fa'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
    background: '#5784BA',
    color: 'white'
  },
  tableRow: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '15px',
    color: '#555',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  soldeRestant: {
    fontWeight: 'bold',
    fontSize: '14px'
  },
  status: {
    fontSize: '18px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#666',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  emptyIcon: {
    fontSize: '50px',
    marginBottom: '15px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default SoldeConge;