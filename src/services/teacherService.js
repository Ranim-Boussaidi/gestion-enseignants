import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const teachersCollection = collection(db, 'teachers');

export const teacherService = {
  // GET ALL TEACHERS
  getTeachers: async () => {
    const snapshot = await getDocs(query(teachersCollection, orderBy('nom')));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // GET TEACHER BY ID
  getTeacher: async (id) => {
    const docRef = doc(db, 'teachers', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  // ADD TEACHER (pour admin)
  addTeacher: async (teacher) => {
    const docRef = await addDoc(teachersCollection, {
      ...teacher,
      dateCreation: serverTimestamp(),
      statut: 'Actif'
    });
    return { id: docRef.id, ...teacher };
  },

  // UPDATE TEACHER
  updateTeacher: async (id, teacher) => {
    const docRef = doc(db, 'teachers', id);
    await updateDoc(docRef, teacher);
    return { id, ...teacher };
  },

  // DELETE TEACHER
  deleteTeacher: async (id) => {
    const docRef = doc(db, 'teachers', id);
    await deleteDoc(docRef);
    return true;
  },

  // SEARCH TEACHERS
  searchTeachers: async (searchTerm) => {
    const teachers = await teacherService.getTeachers();
    return teachers.filter(teacher => 
      teacher.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.departement.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // GET TEACHER BY EMAIL (pour vérification)
  getTeacherByEmail: async (email) => {
    const q = query(teachersCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  }
};