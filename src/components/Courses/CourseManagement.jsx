import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';
import CourseForm from './CourseForm';
import ExamForm from './ExamForm';

const CourseManagement = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('courses'); 
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  // ======== Chargement des cours et examens ========
  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        // Admin: voir tous les cours et examens
        const [coursesData, examsData] = await Promise.all([
          courseService.getAllCourses(),
          courseService.getAllExams()
        ]);
        setCourses(coursesData);
        setExams(examsData);
      } else if (user?.role === 'teacher') {
        // Enseignant: voir seulement ses cours/examens
        const teacherId = user?.id || user?.uid;
        console.log('📌 ID Enseignant pour chargement:', teacherId);
        
        const [coursesData, examsData] = await Promise.all([
          courseService.getCoursesByTeacher(teacherId),
          courseService.getExamsByTeacher(teacherId)
        ]);
        
        console.log('📌 Cours récupérés:', coursesData);
        console.log('📌 Examens récupérés:', examsData);
        
        setCourses(coursesData);
        setExams(examsData);
      } else {
        console.log('⚠️ Utilisateur sans rôle ou rôle non reconnu');
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    }
    setLoading(false);
  };

  // ======== Suppression ========
  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ?')) return;

    try {
      if (type === 'course') {
        await courseService.deleteCourse(id);
        console.log('✅ Cours supprimé:', id);
      } else {
        await courseService.deleteExam(id);
        console.log('✅ Examen supprimé:', id);
      }

      // Recharger les données
      loadData();
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // ===== Statut examen =====
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'planifie': return '#ffc107';
      case 'en_cours': return '#17a2b8';
      case 'termine': return '#6c757d';
      case 'corrige': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (statut) => {
    switch (statut) {
      case 'planifie': return '📅 Planifié';
      case 'en_cours': return '⏳ En cours';
      case 'termine': return '✅ Terminé';
      case 'corrige': return '📝 Corrigé';
      default: return 'Non défini';
    }
  };

  // ===== Format date =====
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date non définie';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('fr-FR');
      }
      return new Date(timestamp).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Chargement des cours et examens...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ===== Header ===== */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📚 Gestion des Cours / Examens</h2>
          <p style={styles.subtitle}>
            {user?.role === 'admin' ? 'Administration complète' : 'Vos cours et examens'}
          </p>
        </div>

        {/* === Boutons visibles uniquement pour ADMIN === */}
        {user?.role === 'admin' && (
          <div style={styles.headerActions}>
            <button
              style={styles.addButton}
              onClick={() => { setSelectedCourse(null); setShowCourseForm(true); }}
            >
              ➕ Nouveau Cours
            </button>

            <button
              style={{ ...styles.addButton, background: '#17a2b8' }}
              onClick={() => { setSelectedCourse(null); setShowExamForm(true); }}
            >
              ➕ Nouvel Examen
            </button>
          </div>
        )}
      </div>

      {/* ===== Tabs ===== */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'courses' && styles.tabActive) }}
          onClick={() => setActiveTab('courses')}
        >
          📚 Cours ({courses.length})
        </button>

        <button
          style={{ ...styles.tab, ...(activeTab === 'exams' && styles.tabActive) }}
          onClick={() => setActiveTab('exams')}
        >
          📝 Examens ({exams.length})
        </button>
      </div>

      {/* ======== Liste des cours ======== */}
      {activeTab === 'courses' ? (
        <div style={styles.list}>
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>{course.matiere || 'Sans titre'}</h4>
                    <p style={styles.cardSubtitle}>
                      {course.departement || 'Département non spécifié'} • 
                      Groupe: {course.groupe || 'Non spécifié'}
                    </p>
                  </div>

                  {/* === Boutons admin seulement === */}
                  {user?.role === 'admin' && (
                    <div style={styles.cardActions}>
                      <button
                        style={styles.editButton}
                        onClick={() => { setSelectedCourse(course); setShowCourseForm(true); }}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDelete('course', course.id)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardInfo}>
                    <span>
                      <strong>Enseignant:</strong> {course.enseignantNom || ''} {course.enseignantPrenom || ''}
                    </span>
                    <span><strong>Salle:</strong> {course.salle || 'Non spécifiée'}</span>
                    <span><strong>Heure:</strong> {course.heure || 'Non spécifiée'}</span>
                    <span><strong>Jour:</strong> {course.jour || 'Non spécifié'}</span>
                  </div>
                  {course.description && (
                    <p style={styles.cardDescription}>{course.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              <p>Aucun cours trouvé</p>
              {user?.role === 'teacher' && (
                <p style={styles.emptySubtext}>
                  Contactez l'administrateur si vous devriez avoir des cours attribués.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ======== Liste des examens ======== */}
      {activeTab === 'exams' ? (
        <div style={styles.list}>
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div key={exam.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h4 style={styles.cardTitle}>{exam.matiere || 'Sans titre'}</h4>
                    <p style={styles.cardSubtitle}>
                      {exam.typeExamen || 'Type non spécifié'} • 
                      Groupe: {exam.groupe || 'Non spécifié'}
                    </p>
                  </div>

                  <div style={styles.cardRight}>
                    <div style={{ 
                      ...styles.statusBadge, 
                      background: getStatusColor(exam.statut) 
                    }}>
                      {getStatusLabel(exam.statut)}
                    </div>

                    {/* === ADMIN SEULEMENT === */}
                    {user?.role === 'admin' && (
                      <div style={styles.cardActions}>
                        <button
                          style={styles.editButton}
                          onClick={() => { setSelectedCourse(exam); setShowExamForm(true); }}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDelete('exam', exam.id)}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.cardInfo}>
                    <span><strong>Date:</strong> {formatDate(exam.dateExamen)}</span>
                    <span><strong>Heure:</strong> {exam.heure || 'Non spécifiée'}</span>
                    <span><strong>Salle:</strong> {exam.salle || 'Non spécifiée'}</span>
                    <span><strong>Durée:</strong> {exam.duree || '0'} min</span>
                  </div>

                  {exam.description && (
                    <p style={styles.cardDescription}>{exam.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={styles.empty}>
              <p>Aucun examen trouvé</p>
              {user?.role === 'teacher' && (
                <p style={styles.emptySubtext}>
                  Contactez l'administrateur si vous devriez avoir des examens attribués.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* ===== Popups ===== */}
      {showCourseForm && (
        <CourseForm
          course={selectedCourse}
          onClose={() => { 
            setShowCourseForm(false); 
            setSelectedCourse(null); 
          }}
          onSave={() => { 
            setShowCourseForm(false); 
            setSelectedCourse(null); 
            loadData(); 
          }}
        />
      )}

      {showExamForm && (
        <ExamForm
          exam={selectedCourse}
          onClose={() => { 
            setShowExamForm(false); 
            setSelectedCourse(null); 
          }}
          onSave={() => { 
            setShowExamForm(false); 
            setSelectedCourse(null); 
            loadData(); 
          }}
        />
      )}
    </div>
  );
};

/* ================= Styles ================= */
const styles = {
  container: {
    background: 'white',
    borderRadius: '10px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: { 
    margin: 0, 
    fontSize: '24px', 
    fontWeight: 'bold', 
    color: '#333' 
  },
  subtitle: { 
    margin: '5px 0 0 0', 
    fontSize: '14px', 
    color: '#666' 
  },
  addButton: {
    background: '#1a7c4d',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'background 0.3s',
  },
  headerActions: { 
    display: 'flex', 
    gap: '10px' 
  },
  tabs: { 
    display: 'flex', 
    gap: '10px', 
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  tab: {
    padding: '10px 20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.3s',
  },
  tabActive: { 
    borderBottom: '2px solid #1a7c4d', 
    color: '#1a7c4d',
    fontWeight: 'bold',
  },
  list: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  card: { 
    background: '#f8f9fa', 
    padding: '20px', 
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '15px',
    marginBottom: '15px',
  },
  cardRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '10px',
  },
  cardActions: { 
    display: 'flex', 
    gap: '10px' 
  },
  editButton: { 
    background: '#ffc107', 
    padding: '6px 12px', 
    borderRadius: '6px', 
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  deleteButton: { 
    background: '#dc3545', 
    color: 'white', 
    padding: '6px 12px', 
    borderRadius: '6px', 
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  cardBody: { 
    marginTop: '10px' 
  },
  cardInfo: { 
    display: 'flex', 
    gap: '20px', 
    flexWrap: 'wrap', 
    fontSize: '14px',
    color: '#555',
    marginBottom: '10px',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px dashed #ddd',
  },
  statusBadge: { 
    color: 'white', 
    padding: '5px 10px', 
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  empty: { 
    textAlign: 'center', 
    padding: '50px', 
    color: '#777',
    fontSize: '16px',
    background: '#f9f9f9',
    borderRadius: '10px',
    border: '1px dashed #ddd',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
    marginTop: '10px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    textAlign: 'center',
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a7c4d',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
};

// Ajouter l'animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default CourseManagement;