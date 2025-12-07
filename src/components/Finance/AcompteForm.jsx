// src/components/Finance/AcompteForm.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { teacherService } from '../../services/teacherService';

const AcompteForm = ({ onClose, onSave }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    montant: '',
    motif: '',
    enseignantId: user?.role === 'admin' ? '' : user?.uid || '',
    enseignantNom: user?.role === 'admin' ? '' : user?.nom || '',
    enseignantPrenom: user?.role === 'admin' ? '' : user?.prenom || ''
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (user?.role === 'admin') {
      loadTeachers();
    }
  }, [user]);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data || []);
    } catch (error) {
      console.error('Erreur chargement enseignants:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'enseignantId' && user?.role === 'admin') {
      const selectedTeacher = teachers.find(t => t && t.id === value);
      if (selectedTeacher) {
        setFormData(prev => ({
          ...prev,
          enseignantNom: selectedTeacher.nom || '',
          enseignantPrenom: selectedTeacher.prenom || ''
        }));
      }
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) newErrors.montant = 'Montant invalide';
    if (!formData.motif.trim()) newErrors.motif = 'Motif requis';
    if (user?.role === 'admin' && !formData.enseignantId) newErrors.enseignantId = 'Enseignant requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await financeService.addAcompte({
        ...formData,
        montant: parseFloat(formData.montant)
      });
      onSave();
    } catch (error) {
      console.error('Erreur ajout acompte:', error);
      alert('Erreur lors de l\'ajout de l\'acompte');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>💸 Nouvel Acompte</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {user?.role === 'admin' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Enseignant *</label>
              <select
                name="enseignantId"
                value={formData.enseignantId}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.enseignantId && styles.inputError)
                }}
              >
                <option value="">Sélectionnez un enseignant</option>
                {teachers.filter(t => t && t.id).map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.nom || ''} {teacher.prenom || ''}
                  </option>
                ))}
              </select>
              {errors.enseignantId && <span style={styles.errorText}>{errors.enseignantId}</span>}
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Montant (TND) *</label>
            <input
              type="number"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              style={{
                ...styles.input,
                ...(errors.montant && styles.inputError)
              }}
            />
            {errors.montant && <span style={styles.errorText}>{errors.montant}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Motif *</label>
            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              placeholder="Motif de la demande d'acompte..."
              rows="4"
              style={{
                ...styles.textarea,
                ...(errors.motif && styles.inputError)
              }}
            />
            {errors.motif && <span style={styles.errorText}>{errors.motif}</span>}
          </div>

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
              {loading ? 'Enregistrement...' : 'Enregistrer'}
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
    maxWidth: '500px',
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
    background: '#f8f9fa'
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
    color: '#666'
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
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
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
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default AcompteForm;

