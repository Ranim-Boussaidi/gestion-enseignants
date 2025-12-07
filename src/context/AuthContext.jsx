// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Si l'utilisateur est connecté via Firebase, récupérer ses données
        try {
          const teacherDoc = await getDoc(doc(db, 'teachers', firebaseUser.uid));
          if (teacherDoc.exists()) {
            const teacherData = teacherDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'teacher',
              ...teacherData
            });
          } else {
            // Si pas de document teacher, c'est peut-être un admin
            // Vérifier si c'est l'admin par défaut
            if (firebaseUser.email === 'admin@ecole.com') {
              setUser({ email: firebaseUser.email, role: 'admin' });
            } else {
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Erreur récupération utilisateur:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // REGISTER - Création de compte
  const registerTeacher = async (teacherData) => {
    setLoading(true);
    try {
      console.log('🔄 Création du compte...', teacherData.email);
      
      // 1. Créer le compte Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        teacherData.email, 
        teacherData.password
      );
      
      const firebaseUser = userCredential.user;
      console.log('✅ Compte Firebase créé:', firebaseUser.uid);

      // 2. Sauvegarder les infos dans Firestore
      const teacherProfile = {
        nom: teacherData.nom,
        prenom: teacherData.prenom,
        email: teacherData.email,
        telephone: teacherData.telephone,
        departement: teacherData.departement,
        dateInscription: new Date().toISOString(),
        statut: 'Actif'
      };

      await setDoc(doc(db, 'teachers', firebaseUser.uid), teacherProfile);
      console.log('✅ Profil sauvegardé dans Firestore');

      // 3. Connecter automatiquement
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'teacher',
        ...teacherProfile
      });

      setLoading(false);
      return true;
      
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      setLoading(false);
      throw error;
    }
  };

  // LOGIN - Connexion
  const login = async (email, password, role = 'admin') => {
    setLoading(true);
    try {
      console.log('🔄 Tentative de connexion...', email);

      if (role === 'admin' && email === 'admin@ecole.com' && password === 'isetjendouba2025') {
        // Admin fixe (pas de Firebase Auth pour admin)
        setUser({ email, role: 'admin' });
        setLoading(false);
        return true;
      }

      if (role === 'teacher') {
        // Enseignant avec Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        console.log('✅ Connexion Firebase réussie');

        // Récupérer les données du profil
        const teacherDoc = await getDoc(doc(db, 'teachers', firebaseUser.uid));
        if (teacherDoc.exists()) {
          const teacherData = teacherDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'teacher',
            ...teacherData
          });
          setLoading(false);
          return true;
        } else {
          setLoading(false);
          return false;
        }
      }

      setLoading(false);
      return false;
      
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      registerTeacher,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };