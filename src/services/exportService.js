// src/services/exportService.js
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportService = {
  exportToExcel: (teachers, filename = 'enseignants_isetj') => {
    const data = teachers.map(teacher => ({
      'Nom': teacher.nom,
      'Prénom': teacher.prenom,
      'Email': teacher.email,
      'Département': teacher.departement,
      'Téléphone': teacher.telephone,
      'Date d\'embauche': teacher.dateEmbauche,
      'Statut': teacher.statut
    }));

    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Enseignants');
    writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  exportToPDF: (teachers, filename = 'enseignants_isetj') => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('LISTE DES ENSEIGNANTS - ISET JENDOUBA', 105, 15, { align: 'center' });
    
    // Sous-titre
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 22, { align: 'center' });
    
    // Tableau
    const tableColumn = ["Nom", "Prénom", "Email", "Département", "Statut"];
    const tableRows = [];
    
    teachers.forEach(teacher => {
      const teacherData = [
        teacher.nom,
        teacher.prenom,
        teacher.email,
        teacher.departement,
        teacher.statut
      ];
      tableRows.push(teacherData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: {
        fillColor: [87, 132, 186],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      margin: { top: 30 }
    });
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} sur ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};