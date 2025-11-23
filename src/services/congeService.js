// src/services/congeService.js
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

const congesCollection = collection(db, 'conges');

export const congeService = {
  // SOUMETTRE UNE DEMANDE DE CONGÉ
  soumettreConge: async (congeData) => {
    try {
      const docRef = await addDoc(congesCollection, {
        ...congeData,
        dateSoumission: new Date(),
        statut: 'en_attente', // en_attente, approuve, refuse
        timestamp: new Date()
      });
      return { id: docRef.id, ...congeData };
    } catch (error) {
      console.error('Erreur soumission congé:', error);
      throw error;
    }
  },

  // RÉCUPÉRER TOUTES LES DEMANDES
  getConges: async (filters = {}) => {
    try {
      let q = query(congesCollection, orderBy('dateSoumission', 'desc'));
      
      if (filters.enseignantId) {
        q = query(q, where('enseignantId', '==', filters.enseignantId));
      }
      if (filters.statut) {
        q = query(q, where('statut', '==', filters.statut));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur chargement congés:', error);
      return [];
    }
  },

  // RÉCUPÉRER LES CONGÉS EN ATTENTE
  getCongesEnAttente: async () => {
    try {
      const q = query(
        congesCollection,
        where('statut', '==', 'en_attente'),
        orderBy('dateSoumission')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur congés en attente:', error);
      return [];
    }
  },

  // VALIDER/REFUSER UN CONGÉ
  traiterConge: async (congeId, decision, motif = '') => {
    try {
      const docRef = doc(db, 'conges', congeId);
      await updateDoc(docRef, {
        statut: decision,
        dateTraitement: new Date(),
        motifRefus: decision === 'refuse' ? motif : '',
        traitePar: 'admin' // À remplacer par l'utilisateur connecté
      });
      return true;
    } catch (error) {
      console.error('Erreur traitement congé:', error);
      throw error;
    }
  },

  // CALCULER LE SOLDE DE CONGÉ
  calculerSoldeConge: async (enseignantId, annee = new Date().getFullYear()) => {
    try {
      const congesAnnee = await congeService.getConges({
        enseignantId: enseignantId
      });
      
      const congesApprouves = congesAnnee.filter(c => 
        c.statut === 'approuve' && 
        new Date(c.dateDebut).getFullYear() === annee
      );
      
      const joursPris = congesApprouves.reduce((total, conge) => {
        const dateDebut = new Date(conge.dateDebut);
        const dateFin = new Date(conge.dateFin);
        const jours = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
        return total + jours;
      }, 0);
      
      // Solde de base : 30 jours par an (à adapter selon ta politique)
      const soldeBase = 30;
      const soldeRestant = soldeBase - joursPris;
      
      return {
        soldeBase,
        joursPris,
        soldeRestant,
        congesApprouves: congesApprouves.length
      };
    } catch (error) {
      console.error('Erreur calcul solde:', error);
      return { soldeBase: 30, joursPris: 0, soldeRestant: 30, congesApprouves: 0 };
    }
  },

  // SUPPRIMER UN CONGÉ
  deleteConge: async (id) => {
    try {
      const docRef = doc(db, 'conges', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur suppression congé:', error);
      throw error;
    }
  },

  // STATISTIQUES CONGÉS
  getStatsConges: async (mois = null) => {
    try {
      const conges = await congeService.getConges();
      
      const stats = {
        total: conges.length,
        enAttente: conges.filter(c => c.statut === 'en_attente').length,
        approuves: conges.filter(c => c.statut === 'approuve').length,
        refuses: conges.filter(c => c.statut === 'refuse').length,
        tauxValidation: 0
      };
      
      if (stats.total > 0) {
        stats.tauxValidation = Math.round((stats.approuves / stats.total) * 100);
      }
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques congés:', error);
      return { total: 0, enAttente: 0, approuves: 0, refuses: 0, tauxValidation: 0 };
    }
  }
};