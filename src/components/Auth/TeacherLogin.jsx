// src/components/Auth/TeacherLogin.jsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-isetj.png';

const TeacherLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const success = await login(email, password, 'teacher');
    if (success) {
      navigate('/enseignant');
    } else {
      setError('Email ou mot de passe incorrect');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <img src={logo} alt="Logo ISET Jendouba" style={styles.logo} />
          <h1 style={styles.title}>Espace Enseignant</h1>
          <p style={styles.subtitle}>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.inputGroup}>
            <input type="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} disabled={loading} />
          </div>

          <div style={styles.inputGroup}>
            <input type="password" placeholder="Mot de passe *" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} disabled={loading} />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/enseignant/register">Créer un compte</Link>
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
  loginBox: {
    background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    width: '100%', maxWidth: '450px', textAlign: 'center'
  },
  header: { marginBottom: '30px' },
  logo: { width: '100px', height: '100px', marginBottom: '15px', objectFit: 'contain' },
  title: { margin: '0 0 8px 0', color: '#FFA4A4', fontSize: '24px', fontWeight: 'bold' },
  subtitle: { margin: 0, color: '#666', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '25px' },
  inputGroup: { textAlign: 'left' },
  input: {
    width: '100%', padding: '15px', border: '2px solid #e1e5e9', borderRadius: '8px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '15px', background: '#FFA4A4', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
  },
  error: {
    background: '#ffe6e6', color: '#d63031', padding: '12px', borderRadius: '6px', fontSize: '14px'
  },
  links: { display: 'flex', flexDirection: 'column', gap: '10px' }
};

export default TeacherLogin;