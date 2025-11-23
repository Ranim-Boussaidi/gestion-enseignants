// src/components/Auth/TeacherRegister.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-isetj.png';

const TeacherRegister = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    departement: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { registerTeacher } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    
    if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.departement) newErrors.departement = 'Le département est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    else if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit faire au moins 6 caractères';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await registerTeacher(formData);
      alert('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
      navigate('/enseignant/login');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        {/* Header */}
        <div style={styles.header}>
          <img 
            src={logo} 
            alt="Logo ISET Jendouba" 
            style={styles.logo}
          />
          <h1 style={styles.title}>Inscription Enseignant</h1>
          <p style={styles.subtitle}>Créez votre compte enseignant</p>
        </div>

        {/* Formulaire */}
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
                  ...(errors.nom && styles.inputError)
                }}
                placeholder="Votre nom"
                disabled={loading}
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
                  ...(errors.prenom && styles.inputError)
                }}
                placeholder="Votre prénom"
                disabled={loading}
              />
              {errors.prenom && <span style={styles.errorText}>{errors.prenom}</span>}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email professionnel *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                ...styles.input,
                ...(errors.email && styles.inputError)
              }}
              placeholder="votre.nom@isetj.tn"
              disabled={loading}
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
                ...(errors.telephone && styles.inputError)
              }}
              placeholder="+216 XX XXX XXX"
              disabled={loading}
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
                ...(errors.departement && styles.inputError)
              }}
              disabled={loading}
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

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.password && styles.inputError)
                }}
                placeholder="Créez un mot de passe (min. 6 caractères)"
                disabled={loading}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmer le mot de passe *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(errors.confirmPassword && styles.inputError)
                }}
                placeholder="Confirmez le mot de passe"
                disabled={loading}
              />
              {errors.confirmPassword && <span style={styles.errorText}>{errors.confirmPassword}</span>}
            </div>
          </div>

          {errors.submit && (
            <div style={styles.submitError}>
              {errors.submit}
            </div>
          )}

          <button 
            type="submit" 
            style={{
              ...styles.button,
              ...(loading && styles.buttonLoading)
            }}
            disabled={loading}
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Liens */}
        <div style={styles.links}>
          <p style={styles.loginLink}>
            Déjà un compte ? <Link to="/enseignant/login">Se connecter</Link>
          </p>
          <Link to="/admin/login" style={styles.adminLink}>
            Accéder à l'espace administration
          </Link>
          <Link to="/" style={styles.backLink}>
            ← Retour au choix d'espace
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FCF9EA 0%, #FCF9EA 100%)',
    padding: '20px'
  },
  registerBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    marginBottom: '30px',
    textAlign: 'center'
  },
  logo: {
    fontSize: '10px',
    marginBottom: '5px'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#1a7c4d',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '25px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  inputGroup: {
    textAlign: 'left'
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
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
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
    submitError: {
    background: '#ffe6e6',
    color: '#d63031',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px',
    textAlign: 'center'
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  button: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #FFA4A4 0%, #FFA4A4 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  links: {
    textAlign: 'center',
    borderTop: '1px solid #e9ecef',
    paddingTop: '20px'
  },
  loginLink: {
    margin: '0 0 15px 0',
    color: '#666',
    fontSize: '14px'
  },
  adminLink: {
    display: 'block',
    color: '#1a7c4d',
    textDecoration: 'none',
    fontSize: '14px',
    marginBottom: '10px'
  },
  backLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '13px'
  }
};

export default TeacherRegister;