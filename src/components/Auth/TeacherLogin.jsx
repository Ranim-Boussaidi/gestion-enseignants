// src/components/Auth/TeacherLogin.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // MAINTENANT AuthContext est exporté
import { Link, useNavigate } from 'react-router-dom';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (login(email, password, 'teacher')) {
      // Redirection vers le dashboard enseignant
      navigate('/enseignant');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>👨‍🏫</div>
          <h1 style={styles.title}>Espace Enseignant</h1>
          <p style={styles.subtitle}>Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <input
              type="email"
              placeholder="Adresse email professionnelle"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button type="submit" style={styles.button}>
            Se connecter
          </button>
        </form>

        {/* Liens */}
        <div style={styles.links}>
          <Link to="/enseignant/register" style={styles.link}>
            Créer un compte enseignant
          </Link>
          <Link to="/admin/login" style={styles.link}>
            Accéder à l'espace admin
          </Link>
          <Link to="/" style={styles.link}>
            ← Retour au choix d'espace
          </Link>
        </div>

       
      </div>
    </div>
  );
};

// Les styles restent identiques au code précédent
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FCF9EA 0%, #FCF9EA 100%)',
    padding: '20px'
  },
  loginBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '450px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '30px'
  },
  logo: {
    fontSize: '60px',
    marginBottom: '15px'
  },
  title: {
    margin: '0 0 8px 0',
    color: '#FFA4A4',
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
  inputGroup: {
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #e1e5e9',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
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
  error: {
    background: '#ffe6e6',
    color: '#d63031',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '14px'
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '25px'
  },
  link: {
    color: '#1a7c4d',
    textDecoration: 'none',
    fontSize: '14px'
  },
  demo: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  demoTitle: {
    margin: '0 0 8px 0',
    color: '#495057',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  demoAccount: {
    margin: 0,
    color: '#6c757d',
    fontSize: '12px'
  }
};

export default TeacherLogin;