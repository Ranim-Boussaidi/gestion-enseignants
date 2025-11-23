// src/components/Departments/DepartmentCard.jsx
import React from 'react';

const DepartmentCard = ({ department, teachersCount, onEdit, onDelete }) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.departmentName}>{department.nom}</h3>
        <div style={styles.actions}>
          <button 
            style={styles.editButton}
            onClick={onEdit}
            title="Modifier"
          >
            ✏️
          </button>
          <button 
            style={styles.deleteButton}
            onClick={onDelete}
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={styles.cardContent}>
        <div style={styles.teachersCount}>
          <span style={styles.countNumber}>{teachersCount}</span>
          <span style={styles.countLabel}>
            enseignant{teachersCount !== 1 ? 's' : ''}
          </span>
        </div>

        {department.chefDepartement && (
          <div style={styles.chefInfo}>
            <span style={styles.chefLabel}>Chef de département:</span>
            <span style={styles.chefName}>{department.chefDepartement}</span>
          </div>
        )}

        {department.description && (
          <p style={styles.description}>{department.description}</p>
        )}

        <div style={styles.status}>
          <span style={{
            ...styles.statusBadge,
            ...(department.statut === 'Actif' ? styles.statusActive : styles.statusInactive)
          }}>
            {department.statut}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    border: '1px solid #e9ecef',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '15px'
  },
  departmentName: {
    margin: 0,
    color: '#333',
    fontSize: '18px',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  editButton: {
    background: '#ffc107',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteButton: {
    background: '#dc3545',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white'
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  teachersCount: {
    textAlign: 'center',
    background: '#e7f3ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #bee5eb'
  },
  countNumber: {
    display: 'block',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '5px'
  },
  countLabel: {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500'
  },
  chefInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  chefLabel: {
    fontSize: '12px',
    color: '#888',
    fontWeight: '500'
  },
  chefName: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500'
  },
  description: {
    margin: 0,
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic',
    lineHeight: '1.4'
  },
  status: {
    textAlign: 'center'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    display: 'inline-block'
  },
  statusActive: {
    background: '#d4edda',
    color: '#155724'
  },
  statusInactive: {
    background: '#f8d7da',
    color: '#721c24'
  }
};

export default DepartmentCard;