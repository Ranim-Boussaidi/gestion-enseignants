// src/components/Conges/CongeList.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { congeService } from '../../services/congeService';
import CongeForm from './CongeForm';
import SoldeConge from './SoldeConge';

const CongeList = () => {
  const { user } = useContext(AuthContext);
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, en_attente, approuve, refuse

  // Mémoriser la fonction loadConges avec useCallback
  const loadConges = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const filters = { enseignantId: user.uid };
      if (filter !== 'all') {
        filters.statut = filter;
      }
      const data = await congeService.getConges(filters);
      console.log('Congés chargés pour l\'enseignant:', data?.length || 0, data);
      setConges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur chargement congés:', error);
      setConges([]);
    }
    setLoading(false);
  }, [user?.uid, filter]);

  useEffect(() => {
    if (user?.uid) {
      loadConges();
    }
  }, [user?.uid, filter, loadConges]);

  // Écouter les événements de mise à jour des congés (quand l'admin valide/refuse)
  useEffect(() => {
    if (!user?.uid) return;
    
    const handleCongesUpdate = () => {
      console.log('Événement congesUpdated reçu, rafraîchissement de la liste des congés...');
      // Recharger les congés pour voir les mises à jour
      // Utiliser une temporisation pour s'assurer que Firestore a mis à jour
      setTimeout(() => {
        loadConges();
      }, 1000); // Augmenter à 1 seconde pour laisser le temps à Firestore
    };
    
    window.addEventListener('congesUpdated', handleCongesUpdate);
    
    // Rafraîchissement automatique toutes les 30 secondes pour détecter les changements
    const intervalId = setInterval(() => {
      console.log('Rafraîchissement automatique de la liste des congés...');
      loadConges();
    }, 30000);
    
    return () => {
      window.removeEventListener('congesUpdated', handleCongesUpdate);
      clearInterval(intervalId);
    };
  }, [user?.uid, loadConges]); // Utiliser loadConges mémorisé

  const handleFormClose = () => {
    setShowForm(false);
    loadConges();
  };

  const getStatusColor = (statut) => {
    switch(statut) {
      case 'approuve': return '#28a745';
      case 'refuse': return '#dc3545';
      case 'en_attente': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (statut) => {
    switch(statut) {
      case 'approuve': return '✅ Approuvé';
      case 'refuse': return '❌ Refusé';
      case 'en_attente': return '⏳ En attente';
      default: return 'Non défini';
    }
  };

  const getTypeLabel = (type) => {
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

  const calculateDays = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return 0;
    const debut = dateDebut instanceof Date ? dateDebut : new Date(dateDebut);
    const fin = dateFin instanceof Date ? dateFin : new Date(dateFin);
    const diffTime = fin.getTime() - debut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
          <h2 style={styles.title}>🏖️ Mes Congés</h2>
          <p style={styles.subtitle}>Gérez vos demandes de congé</p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.refreshButton}
            onClick={loadConges}
            title="Actualiser la liste"
          >
            🔄 Actualiser
          </button>
          <button 
            style={styles.addButton}
            onClick={() => setShowForm(true)}
          >
            ➕ Nouvelle demande
          </button>
        </div>
      </div>

      {/* Solde de congé */}
      <SoldeConge enseignantId={user?.uid} />

      {/* Filtres */}
      <div style={styles.filters}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'all' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('all')}
        >
          Tous ({conges.length})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'en_attente' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('en_attente')}
        >
          En attente ({conges.filter(c => c.statut === 'en_attente').length})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'approuve' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('approuve')}
        >
          Approuvés ({conges.filter(c => c.statut === 'approuve').length})
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'refuse' && styles.filterButtonActive)
          }}
          onClick={() => setFilter('refuse')}
        >
          Refusés ({conges.filter(c => c.statut === 'refuse').length})
        </button>
      </div>

      {/* Liste des congés */}
      <div style={styles.congesList}>
        {conges.length > 0 ? (
          conges.map((conge, index) => {
            const jours = calculateDays(conge.dateDebut, conge.dateFin);
            const dateDebut = conge.dateDebut instanceof Date 
              ? conge.dateDebut 
              : new Date(conge.dateDebut);
            const dateFin = conge.dateFin instanceof Date 
              ? conge.dateFin 
              : new Date(conge.dateFin);

            return (
              <div key={conge.id || index} style={styles.congeCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.cardLeft}>
                    <h4 style={styles.congeType}>{getTypeLabel(conge.typeConge)}</h4>
                    <p style={styles.congeDates}>
                      {dateDebut.toLocaleDateString('fr-FR')} → {dateFin.toLocaleDateString('fr-FR')}
                    </p>
                    <p style={styles.congeDuration}>{jours} jour{jours > 1 ? 's' : ''}</p>
                  </div>
                  <div style={{
                    ...styles.statusBadge,
                    background: getStatusColor(conge.statut || 'en_attente')
                  }}>
                    {getStatusLabel(conge.statut || 'en_attente')}
                  </div>
                </div>
                
                <div style={styles.cardBody}>
                  <div style={styles.motifSection}>
                    <strong>Motif:</strong>
                    <p style={styles.motif}>{conge.motif || 'Non spécifié'}</p>
                  </div>
                  
                  {conge.motifRefus && (
                    <div style={styles.refusSection}>
                      <strong>Motif de refus:</strong>
                      <p style={styles.refusMotif}>{conge.motifRefus}</p>
                    </div>
                  )}
                  
                  <div style={styles.metaInfo}>
                    <span>Soumis le: {conge.dateSoumission 
                      ? new Date(conge.dateSoumission?.toDate?.() || conge.dateSoumission).toLocaleDateString('fr-FR')
                      : 'N/A'}
                    </span>
                    {conge.dateTraitement && (
                      <span>Traité le: {new Date(conge.dateTraitement?.toDate?.() || conge.dateTraitement).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📋</div>
            <h3>Aucune demande de congé</h3>
            <p>Vous n'avez pas encore fait de demande de congé.</p>
            <button 
              style={styles.emptyButton}
              onClick={() => setShowForm(true)}
            >
              Créer ma première demande
            </button>
          </div>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <CongeForm 
          onClose={() => setShowForm(false)}
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
  headerActions: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  addButton: {
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    background: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  filterButtonActive: {
    background: '#1a7c4d',
    color: 'white',
    borderColor: '#1a7c4d'
  },
  congesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  congeCard: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e9ecef'
  },
  cardLeft: {
    flex: 1
  },
  congeType: {
    margin: '0 0 8px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  congeDates: {
    margin: '5px 0',
    color: '#666',
    fontSize: '14px'
  },
  congeDuration: {
    margin: '5px 0 0 0',
    color: '#1a7c4d',
    fontSize: '13px',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  motifSection: {
    color: '#333',
    fontSize: '14px'
  },
  motif: {
    margin: '8px 0 0 0',
    color: '#666',
    fontSize: '13px',
    lineHeight: '1.5',
    background: 'white',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  refusSection: {
    background: '#fff5f5',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #f5c6cb',
    color: '#721c24',
    fontSize: '13px'
  },
  refusMotif: {
    margin: '8px 0 0 0',
    color: '#721c24',
    fontSize: '13px'
  },
  metaInfo: {
    display: 'flex',
    gap: '20px',
    fontSize: '12px',
    color: '#888',
    flexWrap: 'wrap'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 40px',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  emptyIcon: {
    fontSize: '50px',
    marginBottom: '15px'
  },
  emptyButton: {
    marginTop: '20px',
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default CongeList;
