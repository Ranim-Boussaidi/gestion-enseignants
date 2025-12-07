// src/components/Conges/CongeForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { congeService } from '../../services/congeService';
import { AuthContext } from '../../context/AuthContext';

const CongeForm = ({ onClose, onSave }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    typeConge: 'annuel',
    dateDebut: '',
    dateFin: '',
    motif: '',
    enseignantId: user?.uid || '',
    enseignantNom: user?.nom || '',
    enseignantPrenom: user?.prenom || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [joursDemandes, setJoursDemandes] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        enseignantId: user.uid,
        enseignantNom: user.nom || '',
        enseignantPrenom: user.prenom || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    calculerJours();
  }, [formData.dateDebut, formData.dateFin]);

  const calculerJours = () => {
    if (formData.dateDebut && formData.dateFin) {
      const dateDebut = new Date(formData.dateDebut);
      const dateFin = new Date(formData.dateFin);
      const jours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
      setJoursDemandes(jours);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.typeConge) newErrors.typeConge = 'Type de congé requis';
    if (!formData.dateDebut) newErrors.dateDebut = 'Date de début requise';
    if (!formData.dateFin) newErrors.dateFin = 'Date de fin requise';
    if (!formData.motif.trim()) newErrors.motif = 'Motif requis';
    
    if (formData.dateDebut && formData.dateFin) {
      const dateDebut = new Date(formData.dateDebut);
      const dateFin = new Date(formData.dateFin);
      
      if (dateFin < dateDebut) {
        newErrors.dateFin = 'La date de fin doit être après la date de début';
      }
      
      if (joursDemandes > 30) {
        newErrors.dateFin = 'La durée maximale est de 30 jours';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await congeService.soumettreConge({
        ...formData,
        joursDemandes: joursDemandes,
        dateDebut: new Date(formData.dateDebut),
        dateFin: new Date(formData.dateFin)
      });
      
      // Notifier tous les composants (notamment l'admin)
      window.dispatchEvent(new Event('congesUpdated'));
      
      alert('✅ Demande de congé soumise avec succès!');
      onSave();
    } catch (error) {
      console.error('Erreur soumission congé:', error);
      alert('Erreur lors de la soumission du congé');
    }
    setLoading(false);
  };

  const typesConges = [
    { value: 'annuel', label: 'Congé Annuel' },
    { value: 'maladie', label: 'Congé Maladie' },
    { value: 'maternite', label: 'Congé Maternité' },
    { value: 'paternite', label: 'Congé Paternité' },
    { value: 'exceptionnel', label: 'Congé Exceptionnel' },
    { value: 'sans_solde', label: 'Congé Sans Solde' }
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>📝 Nouvelle Demande de Congé</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Type de congé */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Type de Congé *</label>
            <select
              name="typeConge"
              value={formData.typeConge}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.typeConge && styles.inputError)
              }}
            >
              {typesConges.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.typeConge && <span style={styles.errorText}>{errors.typeConge}</span>}
          </div>

          {/* Dates */}
          <div style={styles.datesGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date de Début *</label>
              <input
                type="date"
                name="dateDebut"
                value={formData.dateDebut}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.dateDebut && styles.inputError)
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dateDebut && <span style={styles.errorText}>{errors.dateDebut}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date de Fin *</label>
              <input
                type="date"
                name="dateFin"
                value={formData.dateFin}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.dateFin && styles.inputError)
                }}
                min={formData.dateDebut || new Date().toISOString().split('T')[0]}
              />
              {errors.dateFin && <span style={styles.errorText}>{errors.dateFin}</span>}
            </div>
          </div>

          {/* Informations durée */}
          {joursDemandes > 0 && (
            <div style={styles.durationInfo}>
              <span style={styles.durationText}>
                📅 Durée: {joursDemandes} jour(s) demandé(s)
              </span>
            </div>
          )}

          {/* Motif */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Motif *</label>
            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              style={{
                ...styles.textarea,
                ...(errors.motif && styles.inputError)
              }}
              placeholder="Décrivez le motif de votre demande de congé..."
              rows="4"
            />
            {errors.motif && <span style={styles.errorText}>{errors.motif}</span>}
          </div>

          {/* Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Soumission...' : 'Soumettre la demande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
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
  formContainer: {
    background: 'white',
    borderRadius: '12px',
    padding: '0',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '25px 30px 20px',
    borderBottom: '1px solid #e0e0e0',
    background: '#f8f9fa',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px'
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '20px',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#666',
    padding: '5px',
    borderRadius: '4px'
  },
  form: {
    padding: '30px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  inputError: {
    borderColor: '#dc3545',
    background: '#fff5f5'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px',
    display: 'block'
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  durationInfo: {
    background: '#e7f3ff',
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #bee5eb'
  },
  durationText: {
    color: '#0c5460',
    fontSize: '14px',
    fontWeight: '500'
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0'
  },
  cancelButton: {
    padding: '12px 25px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  submitButton: {
    padding: '12px 25px',
    background: '#5784BA',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  }
};

export default CongeForm;