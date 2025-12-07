// src/services/presenceService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const presencesCollection = collection(db, 'presences');

export const presenceService = {
  // MARK PRESENCE
  markPresence: async (presenceData) => {
    try {
      // Vérifier si une présence existe déjà pour cette date/enseignant
      const existingPresence = await presenceService.getPresenceByDateAndTeacher(
        presenceData.enseignantId, 
        presenceData.date
      );
      
      if (existingPresence) {
        // Mettre à jour la présence existante
        const docRef = doc(db, 'presences', existingPresence.id);
        await updateDoc(docRef, presenceData);
        return { id: existingPresence.id, ...presenceData };
      } else {
        // Créer une nouvelle présence
        const docRef = await addDoc(presencesCollection, {
          ...presenceData,
          timestamp: new Date()
        });
        return { id: docRef.id, ...presenceData };
      }
    } catch (error) {
      console.error('Erreur marquage présence:', error);
      throw error;
    }
  },

  // GET PRESENCE BY DATE AND TEACHER
  getPresenceByDateAndTeacher: async (enseignantId, date) => {
    try {
      const q = query(
        presencesCollection, 
        where('enseignantId', '==', enseignantId),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erreur recherche présence:', error);
      return null;
    }
  },

  // GET PRESENCES BY DATE RANGE
  getPresencesByDateRange: async (startDate, endDate) => {
    try {
      const q = query(
        presencesCollection,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur chargement présences:', error);
      // Si erreur d'index Firestore, essayer sans orderBy
      try {
        const q = query(
          presencesCollection,
          where('date', '>=', startDate),
          where('date', '<=', endDate)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Trier manuellement
        return results.sort((a, b) => a.date.localeCompare(b.date));
      } catch (fallbackError) {
        console.error('Erreur fallback présences:', fallbackError);
        return [];
      }
    }
  },

  // GET PRESENCES BY TEACHER
  getPresencesByTeacher: async (enseignantId, month = null) => {
    try {
      let q;
      if (month) {
        // Calculer correctement la date de fin du mois
        const [year, monthNum] = month.split('-');
        const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
        const startDate = `${month}-01`;
        const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
        
        q = query(
          presencesCollection,
          where('enseignantId', '==', enseignantId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date')
        );
      } else {
        q = query(
          presencesCollection,
          where('enseignantId', '==', enseignantId),
          orderBy('date', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur présences enseignant:', error);
      // Si erreur d'index Firestore, essayer sans orderBy
      try {
        const q = query(
          presencesCollection,
          where('enseignantId', '==', enseignantId)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Trier manuellement
        return results.sort((a, b) => {
          if (month) {
            return a.date.localeCompare(b.date);
          }
          return b.date.localeCompare(a.date);
        });
      } catch (fallbackError) {
        console.error('Erreur fallback présences:', fallbackError);
        return [];
      }
    }
  },

  // GET TODAY'S PRESENCES
  getTodayPresences: async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const q = query(
        presencesCollection,
        where('date', '==', today)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur présences aujourd\'hui:', error);
      return [];
    }
  },

  // DELETE PRESENCE
  deletePresence: async (id) => {
    try {
      const docRef = doc(db, 'presences', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur suppression présence:', error);
      throw error;
    }
  },

  // GET MONTHLY STATS
  getMonthlyStats: async (month) => {
    try {
      // Calculer correctement la date de fin du mois
      const [year, monthNum] = month.split('-');
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const startDate = `${month}-01`;
      const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;
      const presences = await presenceService.getPresencesByDateRange(startDate, endDate);
      
      const stats = {
        total: presences.length,
        presents: presences.filter(p => p.statut === 'present').length,
        absents: presences.filter(p => p.statut === 'absent').length,
        conges: presences.filter(p => p.statut === 'conge').length,
        tauxPresence: 0
      };
      
      if (stats.total > 0) {
        stats.tauxPresence = Math.round((stats.presents / stats.total) * 100);
      }
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return { total: 0, presents: 0, absents: 0, conges: 0, tauxPresence: 0 };
    }
  }
};