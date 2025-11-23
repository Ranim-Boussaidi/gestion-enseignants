// src/components/Auth/AuthChoice.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo-isetj.png';

const AuthChoice = () => {
  return (
    <div style={styles.container}>
      <div style={styles.choiceBox}>
        <div style={styles.header}>
          {/* REMPLACE l'emoji par ton logo */}
          <img 
            src={logo} 
            alt="Logo ISET Jendouba" 
            style={styles.logo}
          />
          <h1 style={styles.title}>ISET Jendouba</h1>
          <p style={styles.subtitle}>Choisissez votre espace</p>
        </div>

        <div style={styles.choices}>
          {/* Carte Enseignant */}
          <Link to="/enseignant/login" style={styles.choiceCard}>
            <div style={styles.cardContent}>
              <div style={styles.cardIcon}>👨‍🏫</div>
              <h3 style={styles.cardTitle}>Espace Enseignant</h3>
              <p style={styles.cardText}>
                Accédez à votre espace personnel pour gérer vos présences, congés et informations.
              </p>
              <div style={styles.cardButton}>
                Se connecter <span style={styles.arrow}>→</span>
              </div>
            </div>
          </Link>

          {/* Carte Admin */}
          <Link to="/admin/login" style={styles.choiceCard}>
            <div style={styles.cardContent}>
              <div style={styles.cardIcon}>⚙️</div>
              <h3 style={styles.cardTitle}>Espace Administration</h3>
              <p style={styles.cardText}>
                Accédez au panel d'administration pour gérer les enseignants et les données.
              </p>
              <div style={styles.cardButton}>
                Se connecter <span style={styles.arrow}>→</span>
              </div>
            </div>
          </Link>
        </div>

        <div style={styles.footer}>
          <p>Plateforme de gestion - ISET Jendouba</p>
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
  choiceBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center'
  },
  header: {
    marginBottom: '40px'
  },
  logo: {
    width: '300px',
    height: '250px',
    marginBottom: '15px'
  },
  title: {
    margin: '0 0 10px 0',
    color: '#333',
    fontSize: '28px',
    fontWeight: 'bold'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    fontSize: '16px'
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px'
  },
  choiceCard: {
    textDecoration: 'none',
    color: 'inherit'
  },
  cardContent: {
    background: '#f8f9fa',
    padding: '30px',
    borderRadius: '10px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardIcon: {
    fontSize: '50px',
    marginBottom: '15px'
  },
  cardTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  cardText: {
    flex: 1,
    margin: '0 0 20px 0',
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  cardButton: {
    background: '#FFA4A4',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  arrow: {
    fontSize: '18px'
  },
  footer: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e9ecef'
  }
};

export default AuthChoice;