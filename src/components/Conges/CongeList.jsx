// src/components/Conges/CongeList.jsx
import React, { useState, useEffect } from 'react';
import { congeService } from '../../services/congeService';
import { teacherService } from '../../services/teacherService';
import CongeForm from './CongeForm';
import SoldeConge from './SoldeConge';

const CongeList = () => {
  const [conges, setConges] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedConge, setSelectedConge] = useState(null);
  const [filters, setFilters] = useState({
    statut: '',
    enseignantId: '',
    typeConge: '',
    dateDebut: '',
    dateFin: ''
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [congesData, teachersData, statsData] = await Promise.all([
        congeService.getConges(filters),
        teacherService.getTeachers(),
        congeService.getStatsConges()
      ]);
      
      setConges(congesData);
      setTeachers(teachersData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setSelectedConge(null);
    setShowForm(true);
  };

  const handleEdit = (conge) => {
    setSelectedConge(conge);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedConge(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de congé ?')) {
      try {
        await congeService.deleteConge(id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression de la demande');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      statut: '',
      enseignantId: '',
      typeConge: '',
      dateDebut: '',
      dateFin: ''
    });
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'approuve': return '#28a745';
      case 'en_attente': return '#ffc107';
      case 'refuse': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'approuve': return '✅ Approuvé';
      case 'en_attente': return '⏳ En attente';
      case 'refuse': return '❌ Refusé';
      default: return '⚪ Inconnu';
    }
  };

  const getTypeCongeText = (type) => {
    const types = {
      'annuel': '🏖️ Congé Annuel',
      'maladie': '🏥 Congé Maladie',
      'maternite': '👶 Congé Maternité',
      'paternite': '👨‍🍼 Congé Paternité',
      'exceptionnel': '🎯 Congé Exceptionnel',
      'sans_solde': '💸 Congé Sans Solde'
    };
    return types[type] || type;
  };

  const calculateJours = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredConges = conges.filter(conge => {
    if (filters.dateDebut && new Date(conge.dateDebut) < new Date(filters.dateDebut)) return false;
    if (filters.dateFin && new Date(conge.dateFin) > new Date(filters.dateFin)) return false;
    return true;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des demandes de congé...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>🏖️ Gestion des Congés</h2>
          <p style={styles.subTitle}>
            {filteredConges.length} demande(s) de congé
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.addButton}
            onClick={handleAddClick}
          >
            ➕ Nouvelle demande
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{stats.total || 0}</span>
          <span style={styles.statLabel}>Total demandes</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{stats.enAttente || 0}</span>
          <span style={styles.statLabel}>En attente</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{stats.approuves || 0}</span>
          <span style={styles.statLabel}>Approuvés</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{stats.tauxValidation || 0}%</span>
          <span style={styles.statLabel}>Taux validation</span>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filtersSection}>
        <h4 style={styles.filtersTitle}>🔍 Filtres</h4>
        <div style={styles.filtersGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Statut</label>
            <select
              value={filters.statut}
              onChange={(e) => handleFilterChange('statut', e.target.value)}
              style={styles.filterInput}
            >
              <option value="">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Enseignant</label>
            <select
              value={filters.enseignantId}
              onChange={(e) => handleFilterChange('enseignantId', e.target.value)}
              style={styles.filterInput}
            >
              <option value="">Tous les enseignants</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nom} {teacher.prenom}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Type de congé</label>
            <select
              value={filters.typeConge}
              onChange={(e) => handleFilterChange('typeConge', e.target.value)}
              style={styles.filterInput}
            >
              <option value="">Tous les types</option>
              <option value="annuel">Congé Annuel</option>
              <option value="maladie">Congé Maladie</option>
              <option value="maternite">Congé Maternité</option>
              <option value="paternite">Congé Paternité</option>
              <option value="exceptionnel">Congé Exceptionnel</option>
              <option value="sans_solde">Congé Sans Solde</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date début</label>
            <input
              type="date"
              value={filters.dateDebut}
              onChange={(e) => handleFilterChange('dateDebut', e.target.value)}
              style={styles.filterInput}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Date fin</label>
            <input
              type="date"
              value={filters.dateFin}
              onChange={(e) => handleFilterChange('dateFin', e.target.value)}
              style={styles.filterInput}
            />
          </div>

          {(filters.statut || filters.enseignantId || filters.typeConge || filters.dateDebut || filters.dateFin) && (
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>&nbsp;</label>
              <button 
                style={styles.resetButton}
                onClick={resetFilters}
              >
                🔄 Réinitialiser
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des congés */}
      <div style={styles.congesList}>
        {filteredConges.length > 0 ? (
          filteredConges.map(conge => {
            const jours = calculateJours(conge.dateDebut?.toDate?.() || conge.dateDebut, conge.dateFin?.toDate?.() || conge.dateFin);
            
            return (
              <div key={conge.id} style={styles.congeCard}>
                <div style={styles.congeHeader}>
                  <div style={styles.congeInfo}>
                    <h4 style={styles.enseignantName}>
                      {conge.enseignantNom} {conge.enseignantPrenom}
                    </h4>
                    <p style={styles.congeType}>
                      {getTypeCongeText(conge.typeConge)}
                    </p>
                  </div>
                  <div style={styles.congeStatus}>
                    <span style={{
                      ...styles.statusBadge,
                      background: getStatusColor(conge.statut)
                    }}>
                      {getStatusText(conge.statut)}
                    </span>
                  </div>
                </div>

                <div style={styles.congeDetails}>
                  <div style={styles.dates}>
                    <span style={styles.dateRange}>
                      📅 {new Date(conge.dateDebut?.toDate?.() || conge.dateDebut).toLocaleDateString('fr-FR')} 
                      → {new Date(conge.dateFin?.toDate?.() || conge.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                    <span style={styles.duration}>
                      ({jours} jour{jours > 1 ? 's' : ''})
                    </span>
                  </div>

                  {conge.motif && (
                    <p style={styles.motif}>
                      <strong>Motif:</strong> {conge.motif}
                    </p>
                  )}

                  {conge.motifRefus && conge.statut === 'refuse' && (
                    <p style={styles.motifRefus}>
                      <strong>Motif du refus:</strong> {conge.motifRefus}
                    </p>
                  )}

                  <div style={styles.metaInfo}>
                    <span style={styles.submissionDate}>
                      📋 Soumis le: {new Date(conge.dateSoumission?.toDate?.() || conge.dateSoumission).toLocaleDateString('fr-FR')}
                    </span>
                    {conge.dateTraitement && (
                      <span style={styles.treatmentDate}>
                        ⚡ Traité le: {new Date(conge.dateTraitement?.toDate?.() || conge.dateTraitement).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>

                <div style={styles.congeActions}>
                  {conge.statut === 'en_attente' && (
                    <>
                      <button 
                        style={styles.editButton}
                        onClick={() => handleEdit(conge)}
                        title="Modifier"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDelete(conge.id)}
                        title="Supprimer"
                      >
                        🗑️ Supprimer
                      </button>
                    </>
                  )}
                  
                  {conge.statut !== 'en_attente' && (
                    <span style={styles.finalStatus}>
                      Décision finale
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🏖️</div>
            <h3>Aucune demande de congé trouvée</h3>
            <p>
              {Object.values(filters).some(f => f) 
                ? "Aucune demande ne correspond à vos critères de recherche."
                : "Commencez par créer votre première demande de congé."
              }
            </p>
            {!Object.values(filters).some(f => f) && (
              <button style={styles.emptyButton} onClick={handleAddClick}>
                Créer la première demande
              </button>
            )}
          </div>
        )}
      </div>

      {/* Composant Soldes */}
      <SoldeConge />

      {/* Formulaire */}
      {showForm && (
        <CongeForm 
          conge={selectedConge}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
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
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  addButton: {
    background: '#5784BA',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  stat: {
    background: '#f8f9fa',
    padding: '20px',
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
  filtersSection: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '1px solid #e9ecef'
  },
  filtersTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '16px',
    fontWeight: '600'
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#333'
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white'
  },
  resetButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '18px'
  },
  congesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  congeCard: {
    background: '#fafafa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  congeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  congeInfo: {
    flex: 1
  },
  enseignantName: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  congeType: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  },
  congeStatus: {
    textAlign: 'right'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    display: 'inline-block'
  },
  congeDetails: {
    marginBottom: '15px'
  },
  dates: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap'
  },
  dateRange: {
    color: '#333',
    fontSize: '14px',
    fontWeight: '500'
  },
  duration: {
    color: '#5784BA',
    fontSize: '13px',
    fontWeight: '500',
    background: '#e7f3ff',
    padding: '2px 8px',
    borderRadius: '12px'
  },
  motif: {
    margin: '10px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  motifRefus: {
    margin: '10px 0',
    color: '#dc3545',
    fontSize: '14px',
    lineHeight: '1.4',
    background: '#f8d7da',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #f5c6cb'
  },
  metaInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#888',
    marginTop: '10px'
  },
  congeActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    paddingTop: '15px',
    borderTop: '1px solid #e9ecef'
  },
  editButton: {
    background: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500'
  },
  finalStatus: {
    color: '#666',
    fontSize: '12px',
    fontStyle: 'italic'
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
  emptyButton: {
    background: '#5784BA',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '15px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default CongeList;