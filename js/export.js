// Fonctions d'export
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    // Feuille principale - Résumé
    const summaryData = [];
    summaryData.push(['SGTM - Tableau de Bord Travaux']);
    summaryData.push(['Date d\'export:', new Date().toLocaleDateString('fr-FR')]);
    summaryData.push(['Exporté par:', currentUser]);
    summaryData.push([]);
    summaryData.push(['Tronçon', 'Longueur', 'Activité', 'Cumul (ml)', 'Objectif (ml)', 'Rendement (%)']);
    
    Object.entries(troncons).forEach(([tronconName, tronconData]) => {
        Object.entries(tronconData.activities).forEach(([activityName, activityData]) => {
            const percentage = Math.round((activityData.cumul / activityData.target) * 100);
            summaryData.push([
                tronconName,
                tronconData.longueur,
                activityName,
                activityData.cumul,
                activityData.target,
                percentage
            ]);
        });
    });
    
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Résumé');
    
    // Feuille historique
    if (dailyHistory.length > 0) {
        const historyData = [['Date', 'Tronçon', 'Activité', 'Avancement (ml)', 'Utilisateur', 'Timestamp']];
        dailyHistory.forEach(entry => {
            historyData.push([
                entry.date, 
                entry.troncon, 
                entry.activity, 
                entry.dailyProgress,
                entry.user || 'N/A',
                entry.timestamp || 'N/A'
            ]);
        });
        
        const ws2 = XLSX.utils.aoa_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Historique');
    }
    
    XLSX.writeFile(wb, `SGTM_Travaux_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification('Export Excel réussi!');
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Fonction pour formater les nombres pour le PDF (éviter les séparateurs français)
    function formatNumberForPDF(num) {
        return num.toFixed(1).replace(/\.0$/, '');
    }
    
    // En-tête avec logo et titre
    doc.setFontSize(24);
    doc.setTextColor(255, 215, 0);
    doc.text('SGTM - Tableau de Bord Travaux', 20, 25);
    
    // Informations d'export
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    doc.text(`Date d'export: ${dateStr} à ${timeStr}`, 20, 35);
    doc.text(`Exporté par: ${currentUser}`, 20, 42);
    
    // Ligne de séparation
    doc.setDrawColor(255, 215, 0);
    doc.setLineWidth(1);
    doc.line(20, 47, 190, 47);
    
    let startY = 55;
    
    // Couleurs pour les tableaux
    const tableColors = [
        [255, 235, 59],   // Jaune
        [76, 175, 80],    // Vert
        [33, 150, 243],   // Bleu
        [255, 152, 0],    // Orange
        [156, 39, 176],   // Violet
        [244, 67, 54],    // Rouge
        [0, 150, 136]     // Teal
    ];
    
    let colorIndex = 0;
    
    // Créer un tableau pour chaque tronçon
    Object.entries(troncons).forEach(([tronconName, tronconData]) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (startY > 220) {
            doc.addPage();
            startY = 20;
        }
        
        // Titre du tronçon
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`${tronconName} - ${tronconData.longueur}`, 20, startY);
        
        // Données du tableau
        const tableData = [];
        Object.entries(tronconData.activities).forEach(([activityName, activityData]) => {
            const percentage = Math.round((activityData.cumul / activityData.target) * 100);
            tableData.push([
                activityName,
                formatNumberForPDF(activityData.cumul) + ' ml',
                formatNumberForPDF(activityData.target) + ' ml',
                percentage + '%'
            ]);
        });
        
        // Couleur pour ce tableau
        const currentColor = tableColors[colorIndex % tableColors.length];
        colorIndex++;
        
        // Créer le tableau
        doc.autoTable({
            head: [['Activité', 'Cumul (ml)', 'Objectif (ml)', 'Rendement (%)']],
            body: tableData,
            startY: startY + 5,
            theme: 'grid',
            headStyles: { 
                fillColor: currentColor,
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                fontSize: 11
            },
            bodyStyles: {
                fontSize: 10
            },
            alternateRowStyles: { 
                fillColor: [currentColor[0], currentColor[1], currentColor[2], 0.1]
            },
            margin: { left: 20, right: 20 },
            columnStyles: {
                0: { cellWidth: 45 },
                1: { cellWidth: 35, halign: 'right' },
                2: { cellWidth: 35, halign: 'right' },
                3: { cellWidth: 25, halign: 'center' }
            }
        });
        
        startY = doc.lastAutoTable.finalY + 15;
    });
    
    // Ajouter une nouvelle page pour les graphiques
    doc.addPage();
    
    // Titre pour les graphiques
    doc.setFontSize(18);
    doc.setTextColor(255, 215, 0);
    doc.text('Graphiques de Progression', 20, 25);
    
    // Capturer et ajouter le graphique principal
    try {
        const canvas = document.getElementById('globalChart');
        if (canvas) {
            const canvasImg = canvas.toDataURL('image/png', 1.0);
            doc.addImage(canvasImg, 'PNG', 20, 35, 170, 100);
        }
    } catch (error) {
        console.error('Erreur lors de la capture du graphique:', error);
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text('Erreur: Impossible de capturer le graphique', 20, 80);
    }
    
    // Ajouter le graphique linéaire s'il existe
    try {
        const linearCanvas = document.getElementById('linearChart');
        if (linearCanvas && charts.linearChart) {
            doc.addImage(linearCanvas.toDataURL('image/png', 1.0), 'PNG', 20, 150, 170, 100);
        }
    } catch (error) {
        console.error('Erreur lors de la capture du graphique linéaire:', error);
    }
    
    // Ajouter une page pour les statistiques globales
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(255, 215, 0);
    doc.text('Statistiques Globales', 20, 25);
    
    // Créer un tableau de statistiques
    const statsData = [
        ['Nombre total de tronçons', document.getElementById('totalTroncons').textContent],
        ['Terrassement global', document.getElementById('globalTerrassement').textContent],
        ['Pose globale', document.getElementById('globalPose').textContent],
        ['Livraison globale', document.getElementById('globalLivraison').textContent],
        ['Lit de pose global', document.getElementById('globalLitPose').textContent],
        ['RP global', document.getElementById('globalRP').textContent],
        ['RS global', document.getElementById('globalRS').textContent]
    ];
    
    doc.autoTable({
        head: [['Indicateur', 'Valeur']],
        body: statsData,
        startY: 35,
        theme: 'grid',
        headStyles: { 
            fillColor: [63, 81, 181],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        bodyStyles: {
            fontSize: 11
        },
        alternateRowStyles: { 
            fillColor: [245, 245, 245]
        },
        margin: { left: 20, right: 20 },
        columnStyles: {
            0: { cellWidth: 120 },
            1: { cellWidth: 50, halign: 'center', fontStyle: 'bold' }
        }
    });
    
    // Footer sur toutes les pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} sur ${pageCount}`, 20, 285);
        doc.text(`Généré par SGTM Dashboard v3.1`, 150, 285);
    }
    
    // Nom du fichier avec date
    const filename = `SGTM_Travaux_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.pdf`;
    doc.save(filename);
    
    showNotification('Export PDF réussi avec graphiques!');
}

// Fonctions de sauvegarde et chargement - UPDATED
function saveToDatabase() {
    const dataToSave = {
        troncons: troncons,
        dailyHistory: dailyHistory,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser,
        version: '3.1'
    };
    
    fetch('api/save_data.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Données sauvegardées avec succès!');
        } else {
            showNotification('Erreur lors de la sauvegarde: ' + data.error, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Erreur de connexion lors de la sauvegarde', 'error');
    });
}

function loadFromDatabase() {
    fetch('api/load_data.php')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            dailyHistory = data.dailyHistory || [];
            
            // Merge with default data structure
            troncons = JSON.parse(JSON.stringify(defaultTroncons));
            
            // Update with loaded data
            Object.keys(data.troncons || {}).
