// src/components/Schedule/TeacherSchedule.jsx
import React, { useState, useContext, useEffect, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { courseService } from '../../services/courseService';

const TeacherSchedule = () => {
  const { user } = useContext(AuthContext);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState('weekly'); // weekly, daily
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les cours de l'enseignant
  useEffect(() => {
    loadCourses();

    const handleCourseUpdate = () => {
      console.log('Événement courseUpdated reçu, rafraîchissement de l\'emploi du temps...');
      loadCourses();
    };

    window.addEventListener('courseUpdated', handleCourseUpdate);

    return () => {
      window.removeEventListener('courseUpdated', handleCourseUpdate);
    };
  }, [user?.uid]);

  const loadCourses = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // CORRECTION: Utiliser la bonne méthode qui existe
      let data = [];
      
      if (user?.role === 'admin') {
        // Admin: voir tous les cours
        data = await courseService.getAllCourses();
      } else if (user?.role === 'teacher') {
        // Enseignant: voir seulement ses cours
        const teacherId = user?.id || user?.uid;
        console.log('📅 Chargement emploi du temps pour enseignant:', teacherId);
        data = await courseService.getCoursesByTeacher(teacherId);
      }
      
      console.log('📅 Cours chargés pour l\'emploi du temps:', data);
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Erreur chargement cours:', error);
      setCourses([]);
    }
    setLoading(false);
  };

  // Organiser les cours par jour de la semaine
  const scheduleData = useMemo(() => {
    console.log('📊 Organisation des cours pour l\'emploi du temps:', courses);
    
    if (!courses.length) {
      console.log('⚠️ Aucun cours à organiser');
      return { weekly: [], daily: [] };
    }

    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const joursMapping = {
      'lundi': 'Lundi',
      'mardi': 'Mardi',
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };

    const weeklyData = joursSemaine.map((jour, index) => {
      const coursDuJour = courses.filter(c => {
        if (!c.jour) return false;
        
        const jourCours = c.jour.toString().toLowerCase().trim();
        const jourNormalized = jour.toLowerCase();
        
        // Vérifier les correspondances
        const matches = jourCours === jourNormalized || 
                        joursMapping[jourCours] === jour ||
                        (jourCours.includes('lundi') && jour === 'Lundi') ||
                        (jourCours.includes('mardi') && jour === 'Mardi') ||
                        (jourCours.includes('mercredi') && jour === 'Mercredi') ||
                        (jourCours.includes('jeudi') && jour === 'Jeudi') ||
                        (jourCours.includes('vendredi') && jour === 'Vendredi') ||
                        (jourCours.includes('samedi') && jour === 'Samedi') ||
                        (jourCours.includes('dimanche') && jour === 'Dimanche');
        
        if (matches) {
          console.log(`✅ Cours trouvé pour ${jour}:`, c.matiere, c.heure);
        }
        
        return matches;
      })
      .map(c => {
        let heureDebut = c.heureDebut;
        let heureFin = c.heureFin;

        // Si heureDebut/heureFin manquent, utiliser c.heure
        if (!heureDebut && !heureFin && c.heure) {
          const parts = c.heure.split('-');
          if (parts.length >= 2) {
            heureDebut = parts[0].trim();
            heureFin = parts[1].trim();
          } else {
            heureDebut = '08:00';
            heureFin = '10:00';
          }
        } else if (!heureDebut) {
          heureDebut = '08:00';
        } else if (!heureFin) {
          heureFin = '10:00';
        }

        return {
          heure: `${heureDebut} - ${heureFin}`,
          heureDebut: heureDebut,
          heureFin: heureFin,
          matiere: c.matiere || 'Matière non spécifiée',
          salle: c.salle || 'Salle non spécifiée',
          type: 'Cours',
          groupe: c.groupe || 'Groupe non spécifié',
          enseignant: `${c.enseignantNom || ''} ${c.enseignantPrenom || ''}`,
          courseId: c.id,
          rawData: c // Garder les données brutes pour debug
        };
      })
      .sort((a, b) => {
        const heureA = a.heureDebut;
        const heureB = b.heureDebut;
        return heureA.localeCompare(heureB);
      });

      // Calculer la date du jour dans la semaine actuelle
      const today = new Date(currentWeek);
      const dayOfWeek = today.getDay();
      const diff = index - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Ajuster pour commencer lundi
      const dayDate = new Date(today);
      dayDate.setDate(today.getDate() + diff);

      return {
        jour: jour,
        date: dayDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        dateObj: dayDate,
        cours: coursDuJour
      };
    });

    console.log('📅 Données hebdomadaires organisées:', weeklyData);

    // Vue quotidienne
    const today = new Date();
    const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const todayDayName = joursSemaine[todayDayIndex];
    
    const todayCourses = weeklyData.find(day => day.jour === todayDayName)?.cours || [];

    const dailyData = todayCourses.map(c => ({
      heure: c.heure,
      activite: `${c.matiere} - ${c.groupe}`,
      type: 'Cours',
      salle: c.salle,
      matiere: c.matiere,
      groupe: c.groupe,
      courseId: c.courseId
    }));

    return { 
      weekly: weeklyData.filter(day => day.cours.length > 0), 
      daily: dailyData 
    };
  }, [courses, currentWeek]);

  // Navigation semaines
  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };
  
  const prevWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const getWeekRange = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return {
      start: start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };
  };

  const weekRange = getWeekRange(currentWeek);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Chargement de l'emploi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* En-tête et navigation */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.title}>📅 Mon Emploi du Temps</h2>
          <p style={styles.subtitle}>
            Semaine du {weekRange.start} au {weekRange.end} • {user?.departement || 'Département non spécifié'}
          </p>
          <p style={styles.courseCount}>
            {courses.length} cours programmés • {scheduleData.weekly.reduce((sum, day) => sum + day.cours.length, 0)} séances cette semaine
          </p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.viewButtons}>
            <button
              style={{ ...styles.viewButton, ...(viewMode === 'weekly' && styles.viewButtonActive) }}
              onClick={() => setViewMode('weekly')}
            >
              Vue Semaine
            </button>
            <button
              style={{ ...styles.viewButton, ...(viewMode === 'daily' && styles.viewButtonActive) }}
              onClick={() => setViewMode('daily')}
            >
              Vue Jour
            </button>
          </div>
          <div style={styles.navigation}>
            <button style={styles.navButton} onClick={prevWeek}>◀</button>
            <span style={styles.weekDisplay}>
              {currentWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button style={styles.navButton} onClick={nextWeek}>▶</button>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      {courses.length > 0 && (
        <div style={styles.stats}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{courses.length}</div>
            <div style={styles.statLabel}>Cours au total</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {[...new Set(courses.map(c => c.matiere))].length}
            </div>
            <div style={styles.statLabel}>Matières</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {[...new Set(courses.map(c => c.salle))].length}
            </div>
            <div style={styles.statLabel}>Salles différentes</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {[...new Set(courses.map(c => c.groupe))].length}
            </div>
            <div style={styles.statLabel}>Groupes</div>
          </div>
        </div>
      )}

      {/* Contenu emploi du temps */}
      {courses.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📅</div>
          <h3>Aucun cours programmé</h3>
          <p>Les cours que vous créez dans la section "Mes Cours & Examens" apparaîtront ici.</p>
          <button 
            style={styles.redirectButton}
            onClick={() => window.location.hash = '#examens'}
          >
            📚 Aller à Mes Cours
          </button>
        </div>
      ) : viewMode === 'weekly' ? (
        <WeeklyView schedule={scheduleData.weekly} />
      ) : (
        <DailyView schedule={scheduleData.daily} />
      )}

      {/* Bouton de rafraîchissement */}
      <div style={styles.footer}>
        <button 
          style={styles.refreshButton}
          onClick={loadCourses}
        >
          🔄 Rafraîchir l'emploi du temps
        </button>
        <button 
          style={styles.debugButton}
          onClick={() => console.log('DEBUG Cours:', courses, 'Schedule:', scheduleData)}
        >
          🔍 Debug
        </button>
      </div>
    </div>
  );
};

const WeeklyView = ({ schedule }) => (
  <div style={styles.weeklyView}>
    {schedule.length > 0 ? (
      schedule.map((day, index) => (
        <div key={index} style={styles.dayCard}>
          <div style={styles.dayHeader}>
            <div>
              <h4 style={styles.dayName}>{day.jour}</h4>
              <span style={styles.dayDate}>{day.date}</span>
            </div>
            <div style={styles.dayCount}>{day.cours.length} cours</div>
          </div>
          <div style={styles.coursesList}>
            {day.cours.map((cours, idx) => (
              <div key={idx} style={styles.courseItem}>
                <div style={styles.courseTime}>{cours.heure}</div>
                <div style={styles.courseDetails}>
                  <strong style={styles.courseName}>{cours.matiere}</strong>
                  <div style={styles.courseMeta}>
                    <span style={styles.courseType}>{cours.type}</span>
                    {cours.groupe && <span style={styles.courseGroup}>• {cours.groupe}</span>}
                    <span style={styles.courseRoom}>• {cours.salle}</span>
                  </div>
                  {cours.enseignant && cours.enseignant.trim() && (
                    <div style={styles.teacherInfo}>👨‍🏫 {cours.enseignant}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div style={styles.noCoursesWeek}>
        <p>Aucun cours programmé cette semaine</p>
      </div>
    )}
  </div>
);

const DailyView = ({ schedule }) => (
  <div style={styles.dailyView}>
    <h3 style={styles.dailyTitle}>
      Aujourd'hui • {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
    </h3>
    {schedule.length > 0 ? (
      schedule.map((item, index) => (
        <div key={index} style={styles.timelineItem}>
          <div style={styles.timelineTime}>{item.heure}</div>
          <div style={styles.timelineContent}>
            <div style={styles.timelineTitle}>{item.activite}</div>
            <div style={styles.timelineMeta}>
              <span style={styles.timelineType}>Cours</span>
              <span style={styles.timelineRoom}>📍 {item.salle}</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div style={styles.noCoursesToday}>
        <p>Aucun cours programmé aujourd'hui</p>
      </div>
    )}
  </div>
);

// ---- Styles ----
const styles = {
  container: { 
    background:'white', 
    borderRadius:'10px', 
    padding:'30px', 
    boxShadow:'0 4px 6px rgba(0,0,0,0.1)',
    minHeight: '500px'
  },
  loading: {
    textAlign: 'center',
    padding: '100px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #1a7c4d',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  header: { 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'flex-start', 
    marginBottom:'30px', 
    flexWrap:'wrap', 
    gap:'20px' 
  },
  headerLeft: { flex:1 },
  title: { 
    margin:'0 0 8px 0', 
    color:'#333', 
    fontSize:'24px', 
    fontWeight:'bold' 
  },
  subtitle: { 
    margin:'0 0 5px 0', 
    color:'#666', 
    fontSize:'14px' 
  },
  courseCount: {
    margin: 0,
    color: '#1a7c4d',
    fontSize: '13px',
    fontWeight: '500'
  },
  headerRight: { 
    display:'flex', 
    flexDirection:'column', 
    gap:'15px', 
    alignItems:'flex-end' 
  },
  viewButtons: { 
    display:'flex', 
    background:'#f8f9fa', 
    borderRadius:'8px', 
    padding:'4px' 
  },
  viewButton: { 
    padding:'8px 16px', 
    border:'none', 
    background:'transparent', 
    borderRadius:'6px', 
    cursor:'pointer', 
    fontSize:'14px', 
    transition:'all 0.3s ease' 
  },
  viewButtonActive: { 
    background:'#1a7c4d', 
    color:'white' 
  },
  navigation: { 
    display:'flex', 
    alignItems:'center', 
    gap:'15px' 
  },
  navButton: { 
    background:'#f8f9fa', 
    border:'none', 
    padding:'8px 12px', 
    borderRadius:'6px', 
    cursor:'pointer', 
    fontSize:'16px',
    '&:hover': {
      background: '#e9ecef'
    }
  },
  weekDisplay: { 
    fontSize:'14px', 
    fontWeight:'500', 
    color:'#333', 
    minWidth:'150px', 
    textAlign:'center' 
  },
  stats: { 
    display:'grid', 
    gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', 
    gap:'15px', 
    marginBottom:'30px' 
  },
  statCard: { 
    background:'#f8f9fa', 
    padding:'20px', 
    borderRadius:'8px', 
    textAlign:'center', 
    border:'1px solid #e9ecef',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'translateY(-3px)'
    }
  },
  statNumber: { 
    fontSize:'24px', 
    fontWeight:'bold', 
    color:'#1a7c4d', 
    marginBottom:'5px' 
  },
  statLabel: { 
    fontSize:'12px', 
    color:'#666', 
    fontWeight:'500' 
  },
  weeklyView: { 
    display:'grid', 
    gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', 
    gap:'20px', 
    marginBottom:'30px' 
  },
  dayCard: { 
    background:'#f8f9fa', 
    borderRadius:'10px', 
    padding:'20px', 
    border:'1px solid #e9ecef',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
    }
  },
  dayHeader: { 
    display:'flex', 
    justifyContent:'space-between', 
    alignItems:'center', 
    marginBottom:'15px', 
    paddingBottom:'10px', 
    borderBottom:'2px solid #e9ecef' 
  },
  dayName: { 
    margin:0, 
    color:'#333', 
    fontSize:'16px', 
    fontWeight:'600' 
  },
  dayDate: { 
    color:'#666', 
    fontSize:'14px', 
    fontWeight:'500' 
  },
  dayCount: {
    background: '#1a7c4d',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500'
  },
  coursesList: { 
    display:'flex', 
    flexDirection:'column', 
    gap:'12px' 
  },
  courseItem: { 
    background:'white', 
    padding:'15px', 
    borderRadius:'8px', 
    border:'1px solid #e9ecef',
    transition: 'border-color 0.3s ease',
    '&:hover': {
      borderColor: '#1a7c4d'
    }
  },
  courseTime: { 
    fontSize:'12px', 
    color:'#1a7c4d', 
    fontWeight:'600', 
    marginBottom:'5px' 
  },
  courseDetails: { 
    flex:1 
  },
  courseName: { 
    display:'block', 
    fontSize:'14px', 
    color:'#333', 
    marginBottom:'5px' 
  },
  courseMeta: { 
    fontSize:'12px', 
    color:'#666',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap'
  },
  courseType: { 
    background:'#e7f3ff', 
    color:'#1a7c4d', 
    padding:'2px 6px', 
    borderRadius:'4px', 
    fontSize:'10px', 
    fontWeight:'500' 
  },
  courseGroup: { 
    fontWeight:'500' 
  },
  courseRoom: { 
    fontWeight:'500' 
  },
  teacherInfo: {
    fontSize: '11px',
    color: '#888',
    marginTop: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  dailyView: { 
    marginBottom:'30px' 
  },
  dailyTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
    paddingBottom: '10px',
    borderBottom: '2px solid #f0f0f0'
  },
  timelineItem: { 
    display:'flex', 
    alignItems:'flex-start', 
    gap:'20px', 
    padding:'15px 0', 
    borderBottom:'1px solid #f0f0f0',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  timelineTime: { 
    minWidth:'100px', 
    fontSize:'14px', 
    fontWeight:'600', 
    color:'#333',
    background: '#f8f9fa',
    padding: '8px 12px',
    borderRadius: '6px',
    textAlign: 'center'
  },
  timelineContent: { 
    flex:1, 
    padding:'15px', 
    borderRadius:'8px', 
    borderLeft:'4px solid #1a7c4d',
    background: '#f8f9fa'
  },
  timelineTitle: { 
    fontSize:'14px', 
    fontWeight:'600', 
    color:'#333', 
    marginBottom:'5px' 
  },
  timelineMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '12px',
    color: '#666'
  },
  timelineRoom: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  noCoursesWeek: {
    textAlign: 'center',
    padding: '40px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px dashed #ddd',
    gridColumn: '1 / -1'
  },
  noCoursesToday: {
    textAlign: 'center',
    padding: '40px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px dashed #ddd'
  },
  empty: { 
    textAlign:'center', 
    padding:'60px 40px', 
    background:'#f8f9fa', 
    borderRadius:'10px', 
    border:'1px solid #e9ecef' 
  },
  emptyIcon: { 
    fontSize:'48px', 
    marginBottom:'15px' 
  },
  redirectButton: {
    background: '#1a7c4d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '15px',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#166a3e'
    }
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  refreshButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#5a6268'
    }
  },
  debugButton: {
    background: '#ffc107',
    color: '#333',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background 0.3s ease',
    '&:hover': {
      background: '#e0a800'
    }
  }
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

export default TeacherSchedule;