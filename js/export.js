// Fonctions de sauvegarde et chargement pour GitHub Pages (utilisation de localStorage)
function saveToDatabase() {
    const dataToSave = {
        troncons: troncons,
        dailyHistory: dailyHistory,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser,
        version: '3.1'
    };
    
    localStorage.setItem('sgtm_data', JSON.stringify(dataToSave));
    showNotification('Données sauvegardées avec succès!');
}

function loadFromDatabase() {
    const savedData = localStorage.getItem('sgtm_data');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        dailyHistory = parsedData.dailyHistory || [];
        
        // Fusionner avec la structure de données par défaut
        troncons = JSON.parse(JSON.stringify(defaultTroncons));
        
        // Mettre à jour avec les données chargées
        Object.keys(parsedData.troncons || {}).forEach(tronconName => {
            if (troncons[tronconName]) {
                Object.keys(parsedData.troncons[tronconName].activities || {}).forEach(activityName => {
                    if (troncons[tronconName].activities[activityName]) {
                        troncons[tronconName].activities[activityName] = parsedData.troncons[tronconName].activities[activityName];
                    }
                });
            }
        });
        
        recalculateAllCumuls();
        renderTroncons();
        updateStats();
        updateAllCharts();
        populateTronconSelect();
        showNotification('Données chargées avec succès!');
    } else {
        showNotification('Aucune donnée sauvegardée trouvée', 'error');
        // Utiliser les données par défaut
        troncons = JSON.parse(JSON.stringify(defaultTroncons));
        dailyHistory = [];
    }
}

// Fonctions d'export
function exportToExcel() {
    // ... (code d'export Excel inchangé) ...
}

function exportToPDF() {
    // ... (code d'export PDF inchangé) ...
}

// Notifications
function showNotification(message, type = 'success') {
    // ... (code de notification inchangé) ...
}

function formatNumber(num) {
    return num.toLocaleString('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
    });
}

// Auto-sauvegarde
function autoSave() {
    saveToDatabase();
    
    // Afficher l'indicateur d'auto-sauvegarde
    const indicator = document.getElementById('autoSaveIndicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

// Auto-sauvegarde toutes les 30 secondes
setInterval(autoSave, 30000);

// Sauvegarde automatique avant de quitter
window.addEventListener('beforeunload', function() {
    autoSave();
});
