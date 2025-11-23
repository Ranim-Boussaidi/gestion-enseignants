// src/components/Departments/DepartmentList.jsx
import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { teacherService } from '../../services/teacherService';
import DepartmentForm from './DepartmentForm';
import DepartmentCard from './DepartmentCard';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [teachersCount, setTeachersCount] = useState({});

  useEffect(() => {
    loadData();
    
    // 🔄 NOUVEAU : Écouter les mises à jour des enseignants
    const handleTeachersUpdate = () => {
      console.log('🔄 Mise à jour des enseignants détectée - rechargement des données');
      loadData();
    };

    window.addEventListener('teachersUpdated', handleTeachersUpdate);
    
    return () => {
      window.removeEventListener('teachersUpdated', handleTeachersUpdate);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptsData, teachersData] = await Promise.all([
        departmentService.getDepartments(),
        teacherService.getTeachers()
      ]);
      
      setDepartments(deptsData);
      setTeachers(teachersData);
      
      // Compter les enseignants par département
      const count = {};
      teachersData.forEach(teacher => {
        count[teacher.departement] = (count[teacher.departement] || 0) + 1;
      });
      setTeachersCount(count);
      
      console.log('📊 Données chargées:', {
        départements: deptsData.length,
        enseignants: teachersData.length,
        compteurs: count
      });
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setSelectedDepartment(null);
    setShowForm(true);
  };

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedDepartment(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
      try {
        await departmentService.deleteDepartment(id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression du département');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des départements...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Gestion des Départements</h2>
          <p style={styles.subTitle}>
            {departments.length} département(s) - {teachers.length} enseignant(s)
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.refreshButton}
            onClick={loadData}
            title="Actualiser les données"
          >
            🔄 Actualiser
          </button>
          <button 
            style={styles.addButton}
            onClick={handleAddClick}
          >
            ➕ Ajouter un département
          </button>
        </div>
      </div>

      {/* Statistiques CORRIGÉES */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{departments.length}</span>
          <span style={styles.statLabel}>Départements</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{teachers.length}</span>
          <span style={styles.statLabel}>Enseignants total</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {departments.length > 0 ? Math.round(teachers.length / departments.length) : 0}
          </span>
          <span style={styles.statLabel}>Moyenne par dépt</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {Object.keys(teachersCount).length}
          </span>
          <span style={styles.statLabel}>Dépts occupés</span>
        </div>
      </div>

      {/* Liste des départements */}
      <div style={styles.departmentsGrid}>
        {departments.map(department => (
          <DepartmentCard
            key={department.id}
            department={department}
            teachersCount={teachersCount[department.nom] || 0}
            onEdit={() => handleEdit(department)}
            onDelete={() => handleDelete(department.id)}
          />
        ))}
      </div>

      {departments.length === 0 && (
        <div style={styles.empty}>
          <h3>🏢 Aucun département créé</h3>
          <p>Commencez par créer votre premier département pour organiser vos enseignants.</p>
          <button style={styles.emptyButton} onClick={handleAddClick}>
            Créer le premier département
          </button>
        </div>
      )}

      {/* Formulaire */}
      {showForm && (
        <DepartmentForm 
          department={selectedDepartment}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
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
    alignItems: 'flex-start',
    marginBottom: '30px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '20px'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    margin: 0,
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  subTitle: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  addButton: {
    background: '#5784BA',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  stat: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e9ecef'
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '5px'
  },
  statLabel: {
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  },
  departmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#666',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  emptyButton: {
    background: '#5784BA',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '15px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default DepartmentList;