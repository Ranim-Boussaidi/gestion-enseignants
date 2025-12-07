// src/components/Courses/CourseForm.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';

const CourseForm = ({ course, onClose, onSave }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    matiere: '',
    departement: user?.departement || '',
    groupe: '',
    salle: '',
    jour: '',
    heureDebut: '',
    heureFin: '',
    type: 'cours',   // cours / td / tp
    statut: 'actif',
    enseignantId: user?.uid || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Remplir lorsque modification
  useEffect(() => {
    if (course) {
      setFormData({
        matiere: course.matiere || '',
        departement: course.departement || user?.departement || '',
        groupe: course.groupe || '',
        salle: course.salle || '',
        jour: course.jour || '',
        heureDebut: course.heureDebut || '',
        heureFin: course.heureFin || '',
        type: course.type || 'cours',
        statut: course.statut || 'actif',
        enseignantId: course.enseignantId || user?.uid || ''
      });
    }
  }, [course, user]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.matiere.trim()) newErrors.matiere = 'Matière requise';
    if (!formData.departement.trim()) newErrors.departement = 'Département requis';
    if (!formData.groupe.trim()) newErrors.groupe = 'Groupe requis';
    if (!formData.jour.trim()) newErrors.jour = 'Jour requis';
    if (!formData.heureDebut.trim()) newErrors.heureDebut = 'Heure début requise';
    if (!formData.heureFin.trim()) newErrors.heureFin = 'Heure fin requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la saisie "08:00-10:00"
  const handleHeureInput = (value) => {
    if (value.includes('-')) {
      const [deb, fin] = value.split('-');
      setFormData(prev => ({
        ...prev,
        heureDebut: deb.trim(),
        heureFin: fin.trim()
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'heureRange') {
      handleHeureInput(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (course) {
        await courseService.updateCourse(course.id, formData);
      } else {
        await courseService.addCourse(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erreur sauvegarde cours:', error);
      alert('Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  return (
    <div style={styles.overlay}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>{course ? '✏️ Modifier le Cours' : '➕ Nouveau Cours'}</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Matière */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Matière *</label>
            <input
              type="text"
              name="matiere"
              value={formData.matiere}
              onChange={handleChange}
              placeholder="Ex: Algorithmique"
              style={{
                ...styles.input,
                ...(errors.matiere && styles.inputError)
              }}
            />
            {errors.matiere && <span style={styles.errorText}>{errors.matiere}</span>}
          </div>

          {/* Département + Groupe */}
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Département *</label>
              <input
                type="text"
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.departement && styles.inputError)
                }}
              />
              {errors.departement && <span style={styles.errorText}>{errors.departement}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Groupe *</label>
              <input
                type="text"
                name="groupe"
                value={formData.groupe}
                onChange={handleChange}
                placeholder="Ex: GI-1"
                style={{
                  ...styles.input,
                  ...(errors.groupe && styles.inputError)
                }}
              />
              {errors.groupe && <span style={styles.errorText}>{errors.groupe}</span>}
            </div>
          </div>

          {/* Jour + Heure */}
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Jour *</label>
              <select
                name="jour"
                value={formData.jour}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.jour && styles.inputError)
                }}
              >
                <option value="">Sélectionnez un jour</option>
                {jours.map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>
              {errors.jour && <span style={styles.errorText}>{errors.jour}</span>}
            </div>

            {/* Champ unique 08:00-10:00 */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Heure (ex: 08:00-10:00) *</label>
              <input
                type="text"
                name="heureRange"
                onChange={handleChange}
                placeholder="08:00-10:00"
                style={{
                  ...styles.input,
                  ...(errors.heureDebut || errors.heureFin ? styles.inputError : {})
                }}
              />
              {(errors.heureDebut || errors.heureFin) &&
                <span style={styles.errorText}>Heure début/fin requise</span>}
            </div>
          </div>

          {/* Salle */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Salle</label>
            <input
              type="text"
              name="salle"
              value={formData.salle}
              onChange={handleChange}
              placeholder="Ex: B-201"
              style={styles.input}
            />
          </div>

          {/* Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="cours">Cours</option>
              <option value="td">TD</option>
              <option value="tp">TP</option>
            </select>
          </div>

          {/* Boutons */}
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
              {loading ? 'Enregistrement...' : course ? 'Modifier' : 'Enregistrer'}
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
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
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default CourseForm;

