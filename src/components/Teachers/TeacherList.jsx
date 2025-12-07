// src/components/Teachers/TeacherList.jsx
import React, { useState, useEffect } from 'react';
import TeacherForm from './TeacherForm';
import { teacherService } from '../../services/teacherService';
import { exportService } from '../../services/exportService';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  // CHARGER LES ENSEIGNANTS DEPUIS FIREBASE
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setSelectedTeacher(null);
    setShowForm(true);
  };

  // FILTRES ET RECHERCHE
  const filteredTeachers = teachers.filter(teacher => {
    if (!teacher) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         (teacher.nom && teacher.nom.toLowerCase().includes(searchLower)) ||
                         (teacher.prenom && teacher.prenom.toLowerCase().includes(searchLower)) ||
                         (teacher.email && teacher.email.toLowerCase().includes(searchLower));
    
    const matchesDepartment = !filterDepartment || teacher.departement === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTeacher(null);
  };

  // 🔄 MODIFIÉ : Notifier tous les composants après sauvegarde
  const handleFormSave = () => {
    setShowForm(false);
    setSelectedTeacher(null);
    loadTeachers();
    
    // NOTIFIER TOUS LES COMPOSANTS QUE LES DONNÉES ONT CHANGÉ
    window.dispatchEvent(new Event('teachersUpdated'));
    console.log('🔄 Teachers updated - notification envoyée');
  };

  // 🔄 MODIFIÉ : Notifier après suppression aussi
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
      try {
        await teacherService.deleteTeacher(id);
        loadTeachers();
        // NOTIFIER APRÈS SUPPRESSION AUSSI
        window.dispatchEvent(new Event('teachersUpdated'));
        console.log('🗑️ Teacher deleted - notification envoyée');
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setShowForm(true);
  };

  // RÉINITIALISER LES FILTRES
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
  };

  // EXPORT EXCEL
  const handleExportExcel = () => {
    exportService.exportToExcel(filteredTeachers);
  };

  // EXPORT PDF
  const handleExportPDF = () => {
    exportService.exportToPDF(filteredTeachers);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Chargement des enseignants...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header avec boutons d'export et d'ajout */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>Gestion des Enseignants</h2>
          <p style={styles.subTitle}>
            {filteredTeachers.length} enseignant(s) - {new Set(teachers.filter(t => t && t.departement).map(t => t.departement)).size} département(s)
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            style={styles.addButton}
            onClick={handleAddClick}
          >
            ➕ Ajouter un enseignant
          </button>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div style={styles.searchSection}>
        <div style={styles.searchRow}>
          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>🔍 Recherche</label>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.searchGroup}>
            <label style={styles.searchLabel}>🏢 Département</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Tous les départements</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
              <option value="Électronique">Électronique</option>
              <option value="Génie Civil">Génie Civil</option>
              <option value="Gestion">Gestion</option>
            </select>
          </div>

          {(searchTerm || filterDepartment) && (
            <button 
              style={styles.resetButton}
              onClick={handleResetFilters}
            >
              🔄 Réinitialiser
            </button>
          )}
        </div>

        {/* Résultats de recherche */}
        <div style={styles.resultsInfo}>
          {filteredTeachers.length} enseignant(s) trouvé(s)
          {(searchTerm || filterDepartment) && ` sur ${teachers.length} au total`}
        </div>
      </div>

      {/* SECTION EXPORT BIEN VISIBLE */}
      <div style={styles.exportSection}>
        <div style={styles.exportTitle}>
          📤 Exporter les données ({filteredTeachers.length} enseignant(s))
        </div>
        <div style={styles.exportButtons}>
          <button 
            style={{
              ...styles.exportButton,
              ...(filteredTeachers.length === 0 && styles.exportButtonDisabled)
            }}
            onClick={handleExportExcel}
            disabled={filteredTeachers.length === 0}
            title="Exporter en format Excel"
          >
            📊 Télécharger Excel
          </button>
          <button 
            style={{
              ...styles.exportButton,
              ...(filteredTeachers.length === 0 && styles.exportButtonDisabled)
            }}
            onClick={handleExportPDF}
            disabled={filteredTeachers.length === 0}
            title="Exporter en format PDF"
          >
            📄 Télécharger PDF
          </button>
        </div>
      </div>

      {/* STATISTIQUES */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statNumber}>{teachers.length}</span>
          <span style={styles.statLabel}>Total enseignants</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {teachers.filter(t => t && t.statut === 'Actif').length}
          </span>
          <span style={styles.statLabel}>Enseignants actifs</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statNumber}>
            {new Set(teachers.map(t => t.departement)).size}
          </span>
          <span style={styles.statLabel}>Départements</span>
        </div>
      </div>

      {/* TABLEAU DES ENSEIGNANTS */}
      <div style={styles.tableContainer}>
        {filteredTeachers.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Nom & Prénom</th>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Téléphone</th>
                <th style={styles.th}>Statut</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id || teacher.uid} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{teacher.nom || ''} {teacher.prenom || ''}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.departmentBadge}>{teacher.departement || 'N/A'}</span>
                  </td>
                  <td style={styles.td}>{teacher.email || 'N/A'}</td>
                  <td style={styles.td}>{teacher.telephone || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.status,
                      ...(teacher.statut === 'Actif' ? styles.statusActive : styles.statusInactive)
                    }}>
                      {teacher.statut || 'Inconnu'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button 
                        style={styles.editButton}
                        onClick={() => handleEdit(teacher)}
                        title="Modifier cet enseignant"
                      >
                        ✏️ Modifier
                      </button>
                      <button 
                        style={styles.deleteButton}
                        onClick={() => handleDelete(teacher.id)}
                        title="Supprimer cet enseignant"
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.empty}>
            {teachers.length === 0 
              ? "Aucun enseignant pour le moment. Cliquez sur 'Ajouter un enseignant' pour commencer."
              : "Aucun enseignant ne correspond à votre recherche."
            }
          </div>
        )}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <TeacherForm 
          teacher={selectedTeacher} 
          onClose={handleFormClose}
          onSave={handleFormSave}
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
    gap: '15px'
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
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  // STYLES RECHERCHE
  searchSection: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  searchRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  searchGroup: {
    flex: 1,
    minWidth: '200px'
  },
  searchLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border 0.3s ease'
  },
  filterSelect: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white',
    transition: 'border 0.3s ease'
  },
  resetButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    whiteSpace: 'nowrap'
  },
  resultsInfo: {
    marginTop: '15px',
    color: '#5784BA',
    fontSize: '14px',
    fontWeight: '500'
  },
  // SECTION EXPORT BIEN VISIBLE
  exportSection: {
    background: 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%)',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '25px',
    border: '2px solid #c3e6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  exportTitle: {
    fontWeight: '600',
    color: '#155724',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  exportButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  exportButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  exportButtonDisabled: {
    background: '#6c757d',
    cursor: 'not-allowed',
    opacity: 0.6
  },
  // STATISTIQUES
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  stat: {
    background: 'white',
    padding: '25px 20px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '2px solid #e9ecef',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#5784BA',
    marginBottom: '8px'
  },
  statLabel: {
    color: '#666',
    fontSize: '14px',
    fontWeight: '500'
  },
  // TABLEAU
  tableContainer: {
    overflowX: 'auto',
    border: '1px solid #e9ecef',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  tableHeader: {
    background: '#f8f9fa'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #dee2e6',
    fontSize: '14px',
    background: '#5784BA',
    color: 'white'
  },
  tableRow: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '16px',
    color: '#555',
    fontSize: '14px',
    verticalAlign: 'middle'
  },
  departmentBadge: {
    background: '#e7f3ff',
    color: '#5784BA',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    border: '1px solid #bee5eb'
  },
  status: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block'
  },
  statusActive: {
    background: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb'
  },
  statusInactive: {
    background: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    background: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  deleteButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap'
  },
  empty: {
    textAlign: 'center',
    padding: '60px 40px',
    color: '#666',
    fontSize: '16px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontStyle: 'italic'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '16px'
  }
};

export default TeacherList;