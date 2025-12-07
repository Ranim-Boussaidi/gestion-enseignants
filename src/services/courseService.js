// src/services/courseService.js

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

const coursesCollection = collection(db, "courses");
const examsCollection = collection(db, "exams");

export const courseService = {
  // --- Ajouter Cours ---
  async addCourse(courseData) {
    return await addDoc(coursesCollection, {
      ...courseData,
      dateCreation: serverTimestamp()
    });
  },

  // --- Ajouter Examen ---
  async addExam(examData) {
    return await addDoc(examsCollection, {
      ...examData,
      dateCreation: serverTimestamp()
    });
  },

  // --- Modifier Cours ---
  async updateCourse(id, newData) {
    const ref = doc(db, "courses", id);
    return await updateDoc(ref, newData);
  },

  // --- Modifier Examen ---
  async updateExam(id, newData) {
    const ref = doc(db, "exams", id);
    return await updateDoc(ref, newData);
  },

  // --- Supprimer Cours ---
  async deleteCourse(id) {
    const ref = doc(db, "courses", id);
    return await deleteDoc(ref);
  },

  // --- Supprimer Examen ---
  async deleteExam(id) {
    const ref = doc(db, "exams", id);
    return await deleteDoc(ref);
  },

  // --- Charger Cours (ADMIN) ---
  async getAllCourses() {
    const snapshot = await getDocs(coursesCollection);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // --- Charger Examens (ADMIN) ---
  async getAllExams() {
    const snapshot = await getDocs(examsCollection);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // --- Charger Cours d’un enseignant ---
  async getCoursesByTeacher(teacherId) {
    console.log("📌 Chargement cours pour :", teacherId);

    const q = query(
      coursesCollection,
      where("enseignantId", "==", teacherId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },

  // --- Charger Examens d’un enseignant ---
  async getExamsByTeacher(teacherId) {
    console.log("📌 Chargement examens pour :", teacherId);

    const q = query(
      examsCollection,
      where("enseignantId", "==", teacherId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
};
