// src/services/departmentService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const departmentsCollection = collection(db, 'departments');

export const departmentService = {
  // GET ALL DEPARTMENTS
  getDepartments: async () => {
    try {
      const snapshot = await getDocs(query(departmentsCollection, orderBy('nom')));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur Firestore:', error);
      return [];
    }
  },

  // GET DEPARTMENT BY ID
  getDepartment: async (id) => {
    try {
      const docRef = doc(db, 'departments', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Erreur Firestore:', error);
      return null;
    }
  },

  // ADD DEPARTMENT
  addDepartment: async (department) => {
    try {
      const docRef = await addDoc(departmentsCollection, {
        ...department,
        dateCreation: new Date(),
        statut: 'Actif'
      });
      return { id: docRef.id, ...department };
    } catch (error) {
      console.error('Erreur ajout département:', error);
      throw error;
    }
  },

  // UPDATE DEPARTMENT
  updateDepartment: async (id, department) => {
    try {
      const docRef = doc(db, 'departments', id);
      await updateDoc(docRef, department);
      return { id, ...department };
    } catch (error) {
      console.error('Erreur modification département:', error);
      throw error;
    }
  },

  // DELETE DEPARTMENT
  deleteDepartment: async (id) => {
    try {
      const docRef = doc(db, 'departments', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur suppression département:', error);
      throw error;
    }
  },

  // GET TEACHERS COUNT BY DEPARTMENT
  getTeachersCountByDepartment: async (teachers) => {
    const count = {};
    teachers.forEach(teacher => {
      count[teacher.departement] = (count[teacher.departement] || 0) + 1;
    });
    return count;
  }
};