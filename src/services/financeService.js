// src/services/financeService.js
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
import { db } from '../firebase/config';

const primesCollection = collection(db, 'primes');
const acomptesCollection = collection(db, 'acomptes');

export const financeService = {
  // ========== PRIMES ==========
  
  // AJOUTER UNE PRIME
  addPrime: async (primeData) => {
    try {
      const docRef = await addDoc(primesCollection, {
        ...primeData,
        dateCreation: serverTimestamp(),
        statut: 'en_attente' // en_attente, approuve, paye
      });
      return { id: docRef.id, ...primeData };
    } catch (error) {
      console.error('Erreur ajout prime:', error);
      throw error;
    }
  },

  // RÉCUPÉRER TOUTES LES PRIMES
  getPrimes: async (filters = {}) => {
    try {
      let q = query(primesCollection, orderBy('dateCreation', 'desc'));
      
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
      console.error('Erreur chargement primes:', error);
      return [];
    }
  },

  // VALIDER/APPROUVER UNE PRIME
  traiterPrime: async (primeId, decision, traitePar = 'admin') => {
    try {
      const docRef = doc(db, 'primes', primeId);
      await updateDoc(docRef, {
        statut: decision,
        dateTraitement: serverTimestamp(),
        traitePar: traitePar
      });
      return true;
    } catch (error) {
      console.error('Erreur traitement prime:', error);
      throw error;
    }
  },

  // MARQUER PRIME COMME PAYÉE
  marquerPrimePayee: async (primeId) => {
    try {
      const docRef = doc(db, 'primes', primeId);
      await updateDoc(docRef, {
        statut: 'paye',
        datePaiement: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur marquage prime payée:', error);
      throw error;
    }
  },

  // SUPPRIMER UNE PRIME
  deletePrime: async (id) => {
    try {
      const docRef = doc(db, 'primes', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur suppression prime:', error);
      throw error;
    }
  },

  // ========== ACOMPTES ==========
  
  // AJOUTER UN ACOMPTE
  addAcompte: async (acompteData) => {
    try {
      const docRef = await addDoc(acomptesCollection, {
        ...acompteData,
        dateCreation: serverTimestamp(),
        statut: 'en_attente' // en_attente, approuve, paye
      });
      return { id: docRef.id, ...acompteData };
    } catch (error) {
      console.error('Erreur ajout acompte:', error);
      throw error;
    }
  },

  // RÉCUPÉRER TOUS LES ACOMPTES
  getAcomptes: async (filters = {}) => {
    try {
      let q = query(acomptesCollection, orderBy('dateCreation', 'desc'));
      
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
      console.error('Erreur chargement acomptes:', error);
      return [];
    }
  },

  // VALIDER/APPROUVER UN ACOMPTE
  traiterAcompte: async (acompteId, decision, traitePar = 'admin') => {
    try {
      const docRef = doc(db, 'acomptes', acompteId);
      await updateDoc(docRef, {
        statut: decision,
        dateTraitement: serverTimestamp(),
        traitePar: traitePar
      });
      return true;
    } catch (error) {
      console.error('Erreur traitement acompte:', error);
      throw error;
    }
  },

  // MARQUER ACOMPTE COMME PAYÉ
  marquerAcomptePaye: async (acompteId) => {
    try {
      const docRef = doc(db, 'acomptes', acompteId);
      await updateDoc(docRef, {
        statut: 'paye',
        datePaiement: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Erreur marquage acompte payé:', error);
      throw error;
    }
  },

  // SUPPRIMER UN ACOMPTE
  deleteAcompte: async (id) => {
    try {
      const docRef = doc(db, 'acomptes', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Erreur suppression acompte:', error);
      throw error;
    }
  },

  // STATISTIQUES FINANCIÈRES
  getStatsFinancieres: async (enseignantId = null, mois = null) => {
    try {
      const filters = enseignantId ? { enseignantId } : {};
      const [primes, acomptes] = await Promise.all([
        financeService.getPrimes(filters),
        financeService.getAcomptes(filters)
      ]);

      const stats = {
        totalPrimes: primes.length,
        primesApprouvees: primes.filter(p => p.statut === 'approuve' || p.statut === 'paye').length,
        primesPayees: primes.filter(p => p.statut === 'paye').length,
        montantTotalPrimes: primes
          .filter(p => p.statut === 'approuve' || p.statut === 'paye')
          .reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0),
        
        totalAcomptes: acomptes.length,
        acomptesApprouves: acomptes.filter(a => a.statut === 'approuve' || a.statut === 'paye').length,
        acomptesPayes: acomptes.filter(a => a.statut === 'paye').length,
        montantTotalAcomptes: acomptes
          .filter(a => a.statut === 'approuve' || a.statut === 'paye')
          .reduce((sum, a) => sum + (parseFloat(a.montant) || 0), 0)
      };

      stats.solde = stats.montantTotalPrimes - stats.montantTotalAcomptes;

      return stats;
    } catch (error) {
      console.error('Erreur statistiques financières:', error);
      return {
        totalPrimes: 0,
        primesApprouvees: 0,
        primesPayees: 0,
        montantTotalPrimes: 0,
        totalAcomptes: 0,
        acomptesApprouves: 0,
        acomptesPayes: 0,
        montantTotalAcomptes: 0,
        solde: 0
      };
    }
  }
};

