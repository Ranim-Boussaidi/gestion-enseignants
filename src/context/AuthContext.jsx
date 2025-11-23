// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]); // Stockage des enseignants inscrits

  const login = (email, password, role = 'admin') => {
    // Authentification Admin (gardé pour l'admin principal)
    if (role === 'admin' && email === 'admin@ecole.com' && password === 'isetjendouba2025') {
      setUser({ email, role: 'admin' });
      return true;
    }
    
    // Authentification Enseignant - vérifie dans la liste des enseignants
    if (role === 'teacher') {
      const teacher = teachers.find(t => t.email === email && t.password === password);
      if (teacher) {
        setUser({ 
          email: teacher.email, 
          role: 'teacher',
          nom: teacher.nom,
          prenom: teacher.prenom,
          departement: teacher.departement
        });
        return true;
      }
    }
    
    return false;
  };

  const registerTeacher = (teacherData) => {
    // Vérifie si l'email existe déjà
    const existingTeacher = teachers.find(t => t.email === teacherData.email);
    if (existingTeacher) {
      throw new Error('Un enseignant avec cet email existe déjà');
    }

    // Ajoute le nouvel enseignant
    const newTeacher = {
      id: Date.now(), // ID temporaire
      ...teacherData,
      dateInscription: new Date().toISOString(),
      statut: 'Actif'
    };

    setTeachers(prev => [...prev, newTeacher]);
    
    // Retourne les données sans le mot de passe
    const { password, ...teacherWithoutPassword } = newTeacher;
    return teacherWithoutPassword;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout,
      registerTeacher,
      teachers // Pour debug/admin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };