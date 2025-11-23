// src/components/Teachers/TeacherForm.jsx
import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';

const TeacherForm = ({ teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    departement: '',
    telephone: '',
    dateEmbauche: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (teacher) {
      setFormData({
        nom: teacher.nom || '',
        prenom: teacher.prenom || '',
        email: teacher.email || '',
        departement: teacher.departement || '',
        telephone: teacher.telephone || '',
        dateEmbauche: teacher.dateEmbauche || ''
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    
    if (!formData.departement.trim()) newErrors.departement = 'Le département est requis';
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (teacher) {
        // Update existing teacher
        await teacherService.updateTeacher(teacher.id, formData);
      } else {
        // Add new teacher
        await teacherService.addTeacher(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>
            {teacher ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}
          </h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.nom ? styles.inputError : {})
                }}
                placeholder="Entrez le nom"
              />
              {errors.nom && <span style={styles.errorText}>{errors.nom}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.prenom ? styles.inputError : {})
                }}
                placeholder="Entrez le prénom"
              />
              {errors.prenom && <span style={styles.errorText}>{errors.prenom}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {})
                }}
                placeholder="email@isetj.tn"
              />
              {errors.email && <span style={styles.errorText}>{errors.email}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Téléphone *</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.telephone ? styles.inputError : {})
                }}
                placeholder="+216 XX XXX XXX"
              />
              {errors.telephone && <span style={styles.errorText}>{errors.telephone}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Département *</label>
              <select
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.departement ? styles.inputError : {})
                }}
              >
                <option value="">Sélectionnez un département</option>
                <option value="Informatique">Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique">Physique</option>
                <option value="Chimie">Chimie</option>
                <option value="Électronique">Électronique</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Gestion">Gestion</option>
              </select>
              {errors.departement && <span style={styles.errorText}>{errors.departement}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Date d'embauche</label>
              <input
                type="date"
                name="dateEmbauche"
                value={formData.dateEmbauche}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
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
              {loading ? 'Sauvegarde...' : (teacher ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles détaillés pour le formulaire
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
    maxWidth: '700px',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  input: {
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  inputError: {
    borderColor: '#dc3545',
    background: '#fff5f5'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
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

export default TeacherForm;