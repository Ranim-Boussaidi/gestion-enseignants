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
  const [error, setError] = useState('');
  const { registerTeacher, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.nom.trim()) return 'Le nom est requis';
    if (!formData.prenom.trim()) return 'Le prénom est requis';
    if (!formData.email.trim()) return 'L\'email est requis';
    if (!formData.telephone.trim()) return 'Le téléphone est requis';
    if (!formData.departement) return 'Le département est requis';
    if (!formData.password) return 'Le mot de passe est requis';
    if (formData.password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await registerTeacher(formData);
      alert('✅ Compte créé avec succès!');
      navigate('/enseignant');
    } catch (error) {
      console.error('Erreur:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('❌ Un compte avec cet email existe déjà');
      } else if (error.code === 'auth/weak-password') {
        setError('❌ Le mot de passe est trop faible');
      } else {
        setError('❌ Erreur lors de la création du compte');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerBox}>
        <div style={styles.header}>
          <img src={logo} alt="Logo ISET Jendouba" style={styles.logo} />
          <h1 style={styles.title}>Inscription Enseignant</h1>
          <p style={styles.subtitle}>Créez votre compte enseignant</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <input type="text" name="nom" placeholder="Nom *" value={formData.nom} onChange={handleChange} style={styles.input} disabled={loading} />
            </div>
            <div style={styles.inputGroup}>
              <input type="text" name="prenom" placeholder="Prénom *" value={formData.prenom} onChange={handleChange} style={styles.input} disabled={loading} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <input type="email" name="email" placeholder="Email *" value={formData.email} onChange={handleChange} style={styles.input} disabled={loading} />
          </div>

          <div style={styles.inputGroup}>
            <input type="tel" name="telephone" placeholder="Téléphone *" value={formData.telephone} onChange={handleChange} style={styles.input} disabled={loading} />
          </div>

          <div style={styles.inputGroup}>
            <select name="departement" value={formData.departement} onChange={handleChange} style={styles.input} disabled={loading}>
              <option value="">Département *</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
            </select>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <input type="password" name="password" placeholder="Mot de passe *" value={formData.password} onChange={handleChange} style={styles.input} disabled={loading} />
            </div>
            <div style={styles.inputGroup}>
              <input type="password" name="confirmPassword" placeholder="Confirmer mot de passe *" value={formData.confirmPassword} onChange={handleChange} style={styles.input} disabled={loading} />
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div style={styles.links}>
          <p>Déjà un compte ? <Link to="/enseignant/login">Se connecter</Link></p>
          <Link to="/admin/login">Espace admin</Link>
          <Link to="/">← Retour</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
    background: 'linear-gradient(135deg, #FCF9EA 0%, #FCF9EA 100%)', padding: '20px'
  },
  registerBox: {
    background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    width: '100%', maxWidth: '500px'
  },
  header: { marginBottom: '30px', textAlign: 'center' },
  logo: { width: '100px', height: '100px', marginBottom: '15px', objectFit: 'contain' },
  title: { margin: '0 0 8px 0', color: '#FFA4A4', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { margin: 0, color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  inputGroup: { textAlign: 'left' },
  input: {
    width: '100%', padding: '12px 15px', border: '2px solid #e1e5e9', borderRadius: '8px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '15px', background: '#FFA4A4', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
  },
  error: {
    background: '#ffe6e6', color: '#d63031', padding: '12px', borderRadius: '6px',
    fontSize: '14px', textAlign: 'center'
  },
  links: { textAlign: 'center', borderTop: '1px solid #e9ecef', paddingTop: '20px' }
};

export default TeacherRegister;