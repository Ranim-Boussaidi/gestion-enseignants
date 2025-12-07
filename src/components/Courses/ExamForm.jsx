// src/components/Courses/ExamForm.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';

const ExamForm = ({ exam, onClose, onSave }) => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    matiere: '',
    typeExamen: 'controle',
    groupe: '',
    dateExamen: '',
    heure: '',
    duree: '',
    salle: '',
    description: '',
    enseignantId: user?.uid || '',
    enseignantNom: user?.nom || '',
    enseignantPrenom: user?.prenom || ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ---------------------------
  // Initialiser le formulaire si édition
  // ---------------------------
  useEffect(() => {
    if (exam) {
      const dateExamen = exam.dateExamen
        ? (exam.dateExamen.toDate
            ? exam.dateExamen.toDate().toISOString().split('T')[0]
            : new Date(exam.dateExamen).toISOString().split('T')[0])
        : '';

      setFormData({
        matiere: exam.matiere || '',
        typeExamen: exam.typeExamen || 'controle',
        groupe: exam.groupe || '',
        dateExamen: dateExamen,
        heure: exam.heure || '',
        duree: exam.duree || '',
        salle: exam.salle || '',
        description: exam.description || '',
        enseignantId: exam.enseignantId || user?.uid || '',
        enseignantNom: exam.enseignantNom || user?.nom || '',
        enseignantPrenom: exam.enseignantPrenom || user?.prenom || ''
      });
    }
  }, [exam, user]);

  // ---------------------------
  // Gestion des changements
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ---------------------------
  // Validation
  // ---------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.matiere.trim()) newErrors.matiere = 'Matière requise';
    if (!formData.typeExamen) newErrors.typeExamen = 'Type d\'examen requis';
    if (!formData.groupe.trim()) newErrors.groupe = 'Groupe requis';
    if (!formData.dateExamen) newErrors.dateExamen = 'Date requise';
    if (!formData.heure.trim()) newErrors.heure = 'Heure requise';
    if (!formData.duree || parseFloat(formData.duree) <= 0) newErrors.duree = 'Durée invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------
  // Soumission du formulaire
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const examData = {
        ...formData,
        dateExamen: new Date(formData.dateExamen),
        duree: parseFloat(formData.duree),
        typeExamen: formData.typeExamen
      };

      if (exam) {
        await courseService.updateExam(exam.id, examData);
      } else {
        await courseService.addExam(examData);
      }

      onSave(); // rafraîchir la liste
    } catch (error) {
      console.error('Erreur sauvegarde examen:', error);
      alert('Erreur lors de la sauvegarde');
    }
    setLoading(false);
  };

  // ---------------------------
  // Styles (inchangés)
  // ---------------------------
  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    },
    formContainer: {
      background: 'white', borderRadius: '12px',
      padding: '0', width: '100%', maxWidth: '600px',
      maxHeight: '90vh', overflow: 'auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '25px 30px 20px', borderBottom: '1px solid #e0e0e0',
      background: '#f8f9fa'
    },
    title: { margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' },
    closeButton: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' },
    form: { padding: '30px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333', fontSize: '14px' },
    input: { width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '12px 15px', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
    inputError: { borderColor: '#dc3545', background: '#fff5f5' },
    errorText: { color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' },
    formActions: { display: 'flex', justifyContent: 'flex-end', gap: '15px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' },
    cancelButton: { padding: '12px 25px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    submitButton: { padding: '12px 25px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h3 style={styles.title}>{exam ? '✏️ Modifier l\'Examen' : '➕ Nouvel Examen'}</h3>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Matière *</label>
            <input type="text" name="matiere" value={formData.matiere} onChange={handleChange} placeholder="Ex: Algorithmique" style={{ ...styles.input, ...(errors.matiere && styles.inputError) }} />
            {errors.matiere && <span style={styles.errorText}>{errors.matiere}</span>}
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Type d'examen *</label>
              <select name="typeExamen" value={formData.typeExamen} onChange={handleChange} style={{ ...styles.input, ...(errors.typeExamen && styles.inputError) }}>
                <option value="controle">Contrôle</option>
                <option value="examen">Examen</option>
                <option value="rattrapage">Rattrapage</option>
                <option value="tp">TP</option>
              </select>
              {errors.typeExamen && <span style={styles.errorText}>{errors.typeExamen}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Groupe *</label>
              <input type="text" name="groupe" value={formData.groupe} onChange={handleChange} placeholder="Ex: GI-1" style={{ ...styles.input, ...(errors.groupe && styles.inputError) }} />
              {errors.groupe && <span style={styles.errorText}>{errors.groupe}</span>}
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Date *</label>
              <input type="date" name="dateExamen" value={formData.dateExamen} onChange={handleChange} min={new Date().toISOString().split('T')[0]} style={{ ...styles.input, ...(errors.dateExamen && styles.inputError) }} />
              {errors.dateExamen && <span style={styles.errorText}>{errors.dateExamen}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Heure *</label>
              <input type="time" name="heure" value={formData.heure} onChange={handleChange} style={{ ...styles.input, ...(errors.heure && styles.inputError) }} />
              {errors.heure && <span style={styles.errorText}>{errors.heure}</span>}
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Durée (minutes) *</label>
              <input type="number" name="duree" value={formData.duree} onChange={handleChange} placeholder="90" min="1" style={{ ...styles.input, ...(errors.duree && styles.inputError) }} />
              {errors.duree && <span style={styles.errorText}>{errors.duree}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Salle</label>
              <input type="text" name="salle" value={formData.salle} onChange={handleChange} placeholder="Ex: B-201" style={styles.input} />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description de l'examen..." rows="4" style={styles.textarea} />
          </div>

          <div style={styles.formActions}>
            <button type="button" style={styles.cancelButton} onClick={onClose} disabled={loading}>Annuler</button>
            <button type="submit" style={styles.submitButton} disabled={loading}>{loading ? 'Enregistrement...' : exam ? 'Modifier' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
