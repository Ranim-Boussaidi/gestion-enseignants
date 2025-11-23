// src/components/Conges/CongeValidation.jsx
import React, { useState, useEffect } from 'react';
import { congeService } from '../../services/congeService';
import { teacherService } from '../../services/teacherService';

const CongeValidation = () => {
  const [congesEnAttente, setCongesEnAttente] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConge, setSelectedConge] = useState(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve' or 'refuse'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [congesData, teachersData] = await Promise.all([
        congeService.getCongesEnAttente(),
        teacherService.getTeachers()
      ]);
      
      setCongesEnAttente(congesData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const handleValidation = (conge, type) => {
    setSelectedConge(conge);
    setActionType(type);
    setMotifRefus('');
    setShowValidationModal(true);
  };

  const confirmValidation = async () => {
    if (!selectedConge) return;

    try {
      if (actionType === 'refuse' && !motifRefus.trim()) {
        alert('Veuillez saisir un motif de refus');
        return;
      }

      await congeService.traiterConge(
        selectedConge.id, 
        actionType, 
        actionType === 'refuse' ? motifRefus : ''
      );

      // Notifier tous les composants
      window.dispatchEvent(new Event('congesUpdated'));
      
      setShowValidationModal(false);
      setSelectedConge(null);
      setMotifRefus('');
      
      // Recharger les données
      loadData();
      
      alert(`Demande ${actionType === 'approve' ? 'approuvée' : 'refusée'} avec succès!`);
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors du traitement de la demande');
    }
  };

  const calculateJours = (dateDebut, dateFin) => {
    const debut = new Date(dateDebut?.toDate?.() || dateDebut);
    const fin = new Date(dateFin?.toDate?.() || dateFin);
    return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
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

  const getEnseignantInfo = (enseignantId) => {
    return teachers.find(t => t.id === enseignantId) || {};
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des demandes en attente...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>⚡ Validation des Congés</h2>
          <p style={styles.subTitle}>
            {congesEnAttente.length} demande(s) en attente de validation
          </p>
        </div>
        <div style={styles.headerActions}>
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
          <span style={styles.statNumber}>{congesEnAttente.length}</span>
          <span style={styles.statLabel}>En attente</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {teachers.length}
          </span>
          <span style={styles.statLabel}>Enseignants total</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {new Set(congesEnAttente.map(c => c.typeConge)).size}
          </span>
          <span style={styles.statLabel}>Types de congé</span>
        </div>
      </div>

      {/* Liste des demandes en attente */}
      <div style={styles.congesGrid}>
        {congesEnAttente.length > 0 ? (
          congesEnAttente.map(conge => {
            const enseignant = getEnseignantInfo(conge.enseignantId);
            const jours = calculateJours(conge.dateDebut, conge.dateFin);
            
            return (
              <div key={conge.id} style={styles.congeCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.enseignantInfo}>
                    <h4 style={styles.enseignantName}>
                      {conge.enseignantNom} {conge.enseignantPrenom}
                    </h4>
                    <p style={styles.enseignantDepartment}>
                      {enseignant.departement || 'Département non spécifié'}
                    </p>
                  </div>
                  <div style={styles.congeType}>
                    {getTypeCongeText(conge.typeConge)}
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.dates}>
                    <div style={styles.dateItem}>
                      <strong>📅 Début:</strong> {new Date(conge.dateDebut?.toDate?.() || conge.dateDebut).toLocaleDateString('fr-FR')}
                    </div>
                    <div style={styles.dateItem}>
                      <strong>📅 Fin:</strong> {new Date(conge.dateFin?.toDate?.() || conge.dateFin).toLocaleDateString('fr-FR')}
                    </div>
                    <div style={styles.duration}>
                      <strong>⏱️ Durée:</strong> {jours} jour{jours > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div style={styles.motifSection}>
                    <strong>📋 Motif:</strong>
                    <p style={styles.motif}>{conge.motif}</p>
                  </div>

                  <div style={styles.metaInfo}>
                    <span style={styles.submissionDate}>
                      📨 Soumis le: {new Date(conge.dateSoumission?.toDate?.() || conge.dateSoumission).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div style={styles.validationActions}>
                  <button
                    style={styles.approveButton}
                    onClick={() => handleValidation(conge, 'approve')}
                  >
                    ✅ Approuver
                  </button>
                  <button
                    style={styles.refuseButton}
                    onClick={() => handleValidation(conge, 'refuse')}
                  >
                    ❌ Refuser
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🎉</div>
            <h3>Aucune demande en attente</h3>
            <p>Toutes les demandes de congé ont été traitées.</p>
          </div>
        )}
      </div>

      {/* Modal de validation */}
      {showValidationModal && selectedConge && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>
                {actionType === 'approve' ? '✅ Approuver la demande' : '❌ Refuser la demande'}
              </h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowValidationModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.demandInfo}>
                <p><strong>Enseignant:</strong> {selectedConge.enseignantNom} {selectedConge.enseignantPrenom}</p>
                <p><strong>Type:</strong> {getTypeCongeText(selectedConge.typeConge)}</p>
                <p><strong>Période:</strong> {new Date(selectedConge.dateDebut?.toDate?.() || selectedConge.dateDebut).toLocaleDateString('fr-FR')} → {new Date(selectedConge.dateFin?.toDate?.() || selectedConge.dateFin).toLocaleDateString('fr-FR')}</p>
                <p><strong>Durée:</strong> {calculateJours(selectedConge.dateDebut, selectedConge.dateFin)} jours</p>
                <p><strong>Motif:</strong> {selectedConge.motif}</p>
              </div>

              {actionType === 'refuse' && (
                <div style={styles.refusSection}>
                  <label style={styles.modalLabel}>
                    Motif du refus *
                  </label>
                  <textarea
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                    style={styles.motifTextarea}
                    placeholder="Veuillez saisir le motif du refus..."
                    rows="4"
                    required
                  />
                </div>
              )}

              {actionType === 'approve' && (
                <div style={styles.approveWarning}>
                  <p>⚠️ Vous êtes sur le point d'approuver cette demande de congé.</p>
                  <p>Cette action est irréversible.</p>
                </div>
              )}
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.modalCancel}
                onClick={() => setShowValidationModal(false)}
              >
                Annuler
              </button>
              <button
                style={actionType === 'approve' ? styles.modalApprove : styles.modalRefuse}
                onClick={confirmValidation}
                disabled={actionType === 'refuse' && !motifRefus.trim()}
              >
                {actionType === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le refus'}
              </button>
            </div>
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
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500'
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
  congesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '20px'
  },
  congeCard: {
    background: '#fafafa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
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
  enseignantInfo: {
    flex: 1
  },
  enseignantName: {
    margin: '0 0 5px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  enseignantDepartment: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  congeType: {
    background: '#e7f3ff',
    color: '#5784BA',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  cardContent: {
    marginBottom: '20px'
  },
  dates: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '15px'
  },
  dateItem: {
    color: '#333',
    fontSize: '14px'
  },
  duration: {
    color: '#5784BA',
    fontSize: '14px',
    fontWeight: '500'
  },
  motifSection: {
    marginBottom: '15px'
  },
  motif: {
    margin: '8px 0 0 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.4',
    background: 'white',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #e9ecef'
  },
  metaInfo: {
    fontSize: '12px',
    color: '#888'
  },
  validationActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center'
  },
  approveButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
  },
  refuseButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    flex: 1
  },
  empty: {
    gridColumn: '1 / -1',
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
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '0',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px 20px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px',
    borderRadius: '4px'
  },
  modalContent: {
    padding: '30px'
  },
  demandInfo: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #e9ecef'
  },
  refusSection: {
    marginBottom: '20px'
  },
  modalLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  motifTextarea: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  approveWarning: {
    background: '#fff3cd',
    color: '#856404',
    padding: '15px',
    borderRadius: '6px',
    border: '1px solid #ffeaa7',
    marginBottom: '20px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    padding: '20px 30px',
    borderTop: '1px solid #e0e0e0'
  },
  modalCancel: {
    padding: '12px 25px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  modalApprove: {
    padding: '12px 25px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  modalRefuse: {
    padding: '12px 25px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
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

export default CongeValidation;