// src/components/Teachers/TeacherProfile.jsx
import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

const TeacherProfile = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: '',
    departement: user?.departement || '',
    specialite: 'Informatique',
    dateEmbauche: '2020-09-01'
  });

  const handleSave = () => {
    // Sauvegarder les modifications
    setIsEditing(false);
    alert('Profil mis à jour avec succès!');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Mon Profil</h2>
        <button 
          style={isEditing ? styles.cancelButton : styles.editButton}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </button>
      </div>

      <div style={styles.profileGrid}>
        {/* Informations personnelles */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>👤 Informations Personnelles</h3>
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                style={styles.input}
                disabled={!isEditing}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                style={styles.input}
                disabled={!isEditing}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={formData.email}
                style={styles.input}
                disabled
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Téléphone</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                style={styles.input}
                disabled={!isEditing}
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏫 Informations Professionnelles</h3>
          <div style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Département</label>
              <input
                type="text"
                value={formData.departement}
                style={styles.input}
                disabled
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Spécialité</label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                style={styles.input}
                disabled={!isEditing}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Date d'embauche</label>
              <input
                type="date"
                value={formData.dateEmbauche}
                style={styles.input}
                disabled
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Statut</label>
              <input
                type="text"
                value="Actif"
                style={styles.input}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div style={styles.actions}>
          <button style={styles.saveButton} onClick={handleSave}>
            💾 Sauvegarder les modifications
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
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px'
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  editButton: {
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  cancelButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  section: {
    background: '#f8f9fa',
    padding: '25px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
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
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.3s ease',
    backgroundColor: 'white'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef'
  },
  saveButton: {
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
};

export default TeacherProfile;