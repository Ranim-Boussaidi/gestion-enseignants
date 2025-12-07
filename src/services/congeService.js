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
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const congesCollection = collection(db, 'conges');

export const congeService = {
  // SOUMETTRE UNE DEMANDE DE CONGÉ
  soumettreConge: async (congeData) => {
    try {
      const congeToSave = {
        ...congeData,
        dateSoumission: serverTimestamp(),
        statut: 'en_attente', // en_attente, approuve, refuse
        timestamp: serverTimestamp()
      };
      
      console.log('Soumission congé:', congeToSave);
      
      const docRef = await addDoc(congesCollection, congeToSave);
      const savedConge = { id: docRef.id, ...congeData, statut: 'en_attente' };
      
      console.log('Congé créé avec succès:', savedConge);
      
      return savedConge;
    } catch (error) {
      console.error('Erreur soumission congé:', error);
      throw error;
    }
  },

  // RÉCUPÉRER TOUTES LES DEMANDES
  getConges: async (filters = {}) => {
    try {
      let q;
      
      // Si on a des filtres, essayer avec orderBy
      if (filters.enseignantId || filters.statut) {
        try {
          q = query(congesCollection, orderBy('dateSoumission', 'desc'));
          
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
        } catch (indexError) {
          // Si l'index n'existe pas, récupérer sans orderBy et filtrer/trier côté client
          console.warn('Index composite manquant, filtrage/tri côté client:', indexError);
          const snapshot = await getDocs(congesCollection);
          let conges = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Filtrer côté client
          if (filters.enseignantId) {
            conges = conges.filter(c => c.enseignantId === filters.enseignantId);
          }
          if (filters.statut) {
            conges = conges.filter(c => c.statut === filters.statut);
          }
          
          // Trier par dateSoumission (plus récent en premier)
          conges.sort((a, b) => {
            const dateA = a.dateSoumission?.toDate ? a.dateSoumission.toDate() : new Date(a.dateSoumission || 0);
            const dateB = b.dateSoumission?.toDate ? b.dateSoumission.toDate() : new Date(b.dateSoumission || 0);
            return dateB - dateA;
          });
          
          return conges;
        }
      } else {
        // Pas de filtres, récupérer avec orderBy simple
        q = query(congesCollection, orderBy('dateSoumission', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
    } catch (error) {
      console.error('Erreur chargement congés:', error);
      // Fallback final : récupérer tout et filtrer/trier côté client
      try {
        const snapshot = await getDocs(congesCollection);
        let conges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (filters.enseignantId) {
          conges = conges.filter(c => c.enseignantId === filters.enseignantId);
        }
        if (filters.statut) {
          conges = conges.filter(c => c.statut === filters.statut);
        }
        
        conges.sort((a, b) => {
          const dateA = a.dateSoumission?.toDate ? a.dateSoumission.toDate() : new Date(a.dateSoumission || 0);
          const dateB = b.dateSoumission?.toDate ? b.dateSoumission.toDate() : new Date(b.dateSoumission || 0);
          return dateB - dateA;
        });
        
        return conges;
      } catch (fallbackError) {
        console.error('Erreur fallback chargement congés:', fallbackError);
        return [];
      }
    }
  },

  // RÉCUPÉRER LES CONGÉS EN ATTENTE
  getCongesEnAttente: async () => {
    try {
      // Essayer d'abord avec orderBy (nécessite un index composite)
      try {
        const q = query(
          congesCollection,
          where('statut', '==', 'en_attente'),
          orderBy('dateSoumission', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (indexError) {
        // Si l'index n'existe pas, récupérer sans orderBy et trier côté client
        console.warn('Index composite manquant, tri côté client:', indexError);
        const q = query(
          congesCollection,
          where('statut', '==', 'en_attente')
        );
        const snapshot = await getDocs(q);
        const conges = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Trier par dateSoumission (plus récent en premier)
        return conges.sort((a, b) => {
          const dateA = a.dateSoumission?.toDate ? a.dateSoumission.toDate() : new Date(a.dateSoumission || 0);
          const dateB = b.dateSoumission?.toDate ? b.dateSoumission.toDate() : new Date(b.dateSoumission || 0);
          return dateB - dateA; // Descendant
        });
      }
    } catch (error) {
      console.error('Erreur congés en attente:', error);
      // Fallback: récupérer tous les congés et filtrer côté client
      try {
        const allConges = await congeService.getConges();
        return allConges
          .filter(c => c.statut === 'en_attente')
          .sort((a, b) => {
            const dateA = a.dateSoumission?.toDate ? a.dateSoumission.toDate() : new Date(a.dateSoumission || 0);
            const dateB = b.dateSoumission?.toDate ? b.dateSoumission.toDate() : new Date(b.dateSoumission || 0);
            return dateB - dateA;
          });
      } catch (fallbackError) {
        console.error('Erreur fallback congés en attente:', fallbackError);
        return [];
      }
    }
  },

  // VALIDER/REFUSER UN CONGÉ
  traiterConge: async (congeId, decision, motif = '', traitePar = 'admin') => {
    try {
      const docRef = doc(db, 'conges', congeId);
      await updateDoc(docRef, {
        statut: decision,
        dateTraitement: serverTimestamp(),
        motifRefus: decision === 'refuse' ? motif : '',
        traitePar: traitePar
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
      
      const congesApprouves = congesAnnee.filter(c => {
        if (c.statut !== 'approuve') return false;
        // Gérer les dates string (YYYY-MM-DD) et Date objects
        const dateDebut = c.dateDebut instanceof Date 
          ? c.dateDebut 
          : new Date(c.dateDebut);
        return dateDebut.getFullYear() === annee;
      });
      
      const joursPris = congesApprouves.reduce((total, conge) => {
        // Gérer les dates string (YYYY-MM-DD) et Date objects
        const dateDebut = conge.dateDebut instanceof Date 
          ? conge.dateDebut 
          : new Date(conge.dateDebut);
        const dateFin = conge.dateFin instanceof Date 
          ? conge.dateFin 
          : new Date(conge.dateFin);
        
        // Calculer la différence en jours (inclusif)
        const diffTime = dateFin.getTime() - dateDebut.getTime();
        const jours = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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