// Données initiales par défaut
const defaultTroncons = {
    'Tronçon 1': {
        longueur: '4.2KM',
        distanceTotale: 4258,
        activities: {
            'terrassement': { cumul: 3918.55, target: 4258, unit: 'ml' },
            'Livraison conduite': { cumul: 0, target: 4258, unit: 'ml' },
            'pose conduite': { cumul: 0, target: 4258, unit: 'ml' },
            'lit de pose': { cumul: 0, target: 4258, unit: 'ml' },
            'RP': { cumul: 0, target: 4258, unit: 'ml' },
            'RS': { cumul: 0, target: 4258, unit: 'ml' }
        }
    },
    'Tronçon 2': {
        longueur: '24KM',
        distanceTotale: 23940,
        activities: {
            'terrassement': { cumul: 23940, target: 23940, unit: 'ml' },
            'Livraison conduite': { cumul: 16094, target: 23940, unit: 'ml' },
            'pose conduite': { cumul: 15391, target: 23940, unit: 'ml' },
            'lit de pose': { cumul: 17084, target: 23940, unit: 'ml' },
            'RP': { cumul: 11937, target: 23940, unit: 'ml' },
            'RS': { cumul: 11605, target: 23940, unit: 'ml' }
        }
    },
    'Tronçon 3': {
        longueur: '11.9KM',
        distanceTotale: 11873,
        activities: {
            'terrassement': { cumul: 8072, target: 11873, unit: 'ml' },
            'Livraison conduite': { cumul: 3392.4, target: 11873, unit: 'ml' },
            'pose conduite': { cumul: 1943, target: 11873, unit: 'ml' },
            'lit de pose': { cumul: 1975, target: 11873, unit: 'ml' },
            'RP': { cumul: 0, target: 11873, unit: 'ml' },
            'RS': { cumul: 0, target: 11873, unit: 'ml' }
        }
    },
    'Tronçon 4': {
        longueur: '7.5KM',
        distanceTotale: 7614,
        activities: {
            'terrassement': { cumul: 6373.6, target: 7614, unit: 'ml' },
            'Livraison conduite': { cumul: 7563.6, target: 7614, unit: 'ml' },
            'pose conduite': { cumul: 4514.4, target: 7614, unit: 'ml' },
            'lit de pose': { cumul: 4728, target: 7614, unit: 'ml' },
            'RP': { cumul: 0, target: 7614, unit: 'ml' },
            'RS': { cumul: 0, target: 7614, unit: 'ml' }
        }
    }
};

// Variables globales
let troncons = {};
let dailyHistory = [];
let editingTroncon = null;
let editingActivity = null;
let dateFilter = null;

// Fonction pour récupérer la valeur initiale d'une activité
function getInitialValue(troncon, activity) {
    if (defaultTroncons[troncon] && defaultTroncons[troncon].activities[activity]) {
        return defaultTroncons[troncon].activities[activity].cumul;
    }
    return 0;
}

// Fonction pour recalculer tous les cumuls basés sur les valeurs initiales + historique
function recalculateAllCumuls() {
    Object.keys(troncons).forEach(tronconName => {
        Object.keys(troncons[tronconName].activities).forEach(activityName => {
            const initialValue = getInitialValue(tronconName, activityName);
            const totalFromHistory = dailyHistory
                .filter(entry => entry.troncon === tronconName && entry.activity === activityName)
                .reduce((sum, entry) => sum + entry.dailyProgress, 0);
            
            troncons[tronconName].activities[activityName].cumul = initialValue + totalFromHistory;
        });
    });
}

// Fonction d'initialisation des données - UPDATED
function initializeData() {
    // Load from server instead of localStorage
    loadFromDatabase();
}

function initializeDateInput() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    document.getElementById('endDate').value = today;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    document.getElementById('startDate').value = oneWeekAgo.toISOString().split('T')[0];
}

function populateTronconSelect() {
    const select = document.getElementById('tronconSelect');
    const chartSelect = document.getElementById('tronconChartSelect');
    
    select.innerHTML = '<option value="">Sélectionner un tronçon</option>';
    chartSelect.innerHTML = '<option value="">Sélectionner un tronçon</option>';
    
    Object.keys(troncons).forEach(troncon => {
        const option = document.createElement('option');
        option.value = troncon;
        option.textContent = `${troncon} (${troncons[troncon].longueur})`;
        select.appendChild(option);
        
        const chartOption = option.cloneNode(true);
        chartSelect.appendChild(chartOption);
    });
}

// Function pour obtenir l'icône d'activité
function getActivityIcon(activity) {
    const icons = {
        'terrassement': 'fas fa-excavator',
        'pose conduite': 'fas fa-tools',
        'Livraison conduite': 'fas fa-truck',
        'livraison conduite': 'fas fa-truck',
        'lit de pose': 'fas fa-layer-group',
        'RP': 'fas fa-fill',
        'RS': 'fas fa-road'
    };
    return icons[activity] || 'fas fa-cog';
}

document.getElementById('tronconSelect').addEventListener('change', function() {
    const selectedTroncon = this.value;
    const activitySelect = document.getElementById('activitySelect');
    
    activitySelect.innerHTML = '<option value="">Sélectionner une activité</option>';
    
    if (selectedTroncon && troncons[selectedTroncon]) {
        Object.keys(troncons[selectedTroncon].activities).forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = activity.charAt(0).toUpperCase() + activity.slice(1);
            activitySelect.appendChild(option);
        });
    }
});

document.getElementById('tronconChartSelect').addEventListener('change', function() {
    const selectedTroncon = this.value;
    const activitySelect = document.getElementById('activityChartSelect');
    
    if (selectedTroncon) {
        // Populate activity select for this troncon
        activitySelect.innerHTML = '<option value="">Toutes les activités</option>';
        Object.keys(troncons[selectedTroncon].activities).forEach(activity => {
            const option = document.createElement('option');
            option.value = activity;
            option.textContent = activity.charAt(0).toUpperCase() + activity.slice(1);
            activitySelect.appendChild(option);
        });
        
        document.getElementById('linearChartContainer').style.display = 'block';
        createLinearChart(selectedTroncon);
    } else {
        document.getElementById('linearChartContainer').style.display = 'none';
        activitySelect.innerHTML = '<option value="">Toutes les activités</option>';
    }
});

document.getElementById('activityChartSelect').addEventListener('change', function() {
    const selectedTroncon = document.getElementById('tronconChartSelect').value;
    if (selectedTroncon) {
        createLinearChart(selectedTroncon, this.value);
    }
});

document.getElementById('progressForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const troncon = document.getElementById('tronconSelect').value;
    const activity = document.getElementById('activitySelect').value;
    const dailyProgress = parseFloat(document.getElementById('dailyProgress').value);
    const date = document.getElementById('date').value;
    
    if (!troncon || !activity || dailyProgress === '' || !date) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    if (dailyProgress < 0) {
        showNotification('La valeur ne peut pas être négative', 'error');
        return;
    }
    
    // Ajouter à l'historique
    dailyHistory.push({
        date,
        troncon,
        activity,
        dailyProgress,
        user: currentUser,
        timestamp: new Date().toISOString()
    });
    
    // Mettre à jour le cumul avec la valeur initiale + historique
    const initialValue = getInitialValue(troncon, activity);
    const totalFromHistory = dailyHistory
        .filter(entry => entry.troncon === troncon && entry.activity === activity)
        .reduce((sum, entry) => sum + entry.dailyProgress, 0);
    
    troncons[troncon].activities[activity].cumul = initialValue + totalFromHistory;
    
    // Réinitialiser le formulaire
    this.reset();
    initializeDateInput();
    document.getElementById('activitySelect').innerHTML = '<option value="">Sélectionner une activité</option>';
    
    // Mettre à jour l'affichage
    renderTroncons();
    updateStats();
    updateAllCharts();
    autoSave();
    
    showNotification(`Avancement ajouté: ${formatNumber(dailyProgress)} ml pour ${activity}`);
});

function renderTroncons() {
    const container = document.getElementById('tronconsList');
    container.innerHTML = '';
    
    Object.entries(troncons).forEach(([tronconName, tronconData]) => {
        const tronconCard = document.createElement('div');
        tronconCard.className = 'troncon-card';
        
        const header = document.createElement('div');
        header.className = 'troncon-header';
        header.innerHTML = `
            <i class="fas fa-road"></i> ${tronconName} - ${tronconData.longueur}
            <button style="float: right; background: #1a1a1a; color: #ffd700; border: 1px solid #ffd700; padding: 0.3rem 0.8rem; border-radius: 5px; cursor: pointer;" 
                    onclick="addNewActivity('${tronconName}')">
                <i class="fas fa-plus"></i> Activité
            </button>
        `;
        
        const table = document.createElement('table');
        table.className = 'activities-table';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th><i class="fas fa-tasks"></i> Activité</th>
                <th><i class="fas fa-chart-line"></i> Cumul (ml)</th>
                <th><i class="fas fa-bullseye"></i> Objectif (ml)</th>
                <th><i class="fas fa-percentage"></i> Rendement</th>
                <th><i class="fas fa-calendar-day"></i> Avancement Journalier</th>
                <th><i class="fas fa-cogs"></i> Actions</th>
            </tr>
        `;
        
        const tbody = document.createElement('tbody');
        
        Object.entries(tronconData.activities).forEach(([activityName, activityData]) => {
            const percentage = Math.round((activityData.cumul / activityData.target) * 100);
            const row = document.createElement('tr');
            
            // Calculer l'avancement journalier pour aujourd'hui
            const today = new Date().toISOString().split('T')[0];
            const todayProgress = dailyHistory
                .filter(entry => entry.date === today && entry.troncon === tronconName && entry.activity === activityName)
                .reduce((sum, entry) => sum + entry.dailyProgress, 0);
            
            row.innerHTML = `
                <td style="font-weight: 600; color: #2c3e50;">
                    <span class="activity-icon"><i class="${getActivityIcon(activityName)}"></i></span>
                    ${activityName}
                </td>
                <td>${formatNumber(activityData.cumul)} ml</td>
                <td>${formatNumber(activityData.target)} ml</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%">
                            <div class="progress-text">${percentage}%</div>
                        </div>
                    </div>
                </td>
                <td>
                    <input type="number" class="daily-input" style="width: 100px; padding: 0.3rem; border-radius: 5px; border: none; text-align: center;" 
                           min="0" step="0.1" placeholder="0" value="${todayProgress > 0 ? formatNumber(todayProgress) : ''}"
                           onchange="updateDailyProgress('${tronconName}', '${activityName}', this.value)">
                    <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;"><i class="fas fa-ruler"></i> ml/jour</div>
                </td>
                <td>
                    <button class="edit-btn" onclick="editActivity('${tronconName}', '${activityName}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="delete-btn" onclick="deleteActivity('${tronconName}', '${activityName}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        table.appendChild(thead);
        table.appendChild(tbody);
        tronconCard.appendChild(header);
        tronconCard.appendChild(table);
        container.appendChild(tronconCard);
    });
}

function updateDailyProgress(troncon, activity, value) {
    const today = new Date().toISOString().split('T')[0];
    const dailyProgress = parseFloat(value) || 0;
    
    if (dailyProgress < 0) {
        showNotification('La valeur ne peut pas être négative', 'error');
        renderTroncons();
        return;
    }
    
    // Supprimer les entrées existantes pour aujourd'hui
    dailyHistory = dailyHistory.filter(entry => 
        !(entry.date === today && entry.troncon === troncon && entry.activity === activity)
    );
    
    // Ajouter la nouvelle entrée si la valeur est positive
    if (dailyProgress > 0) {
        dailyHistory.push({
            date: today,
            troncon,
            activity,
            dailyProgress,
            user: currentUser,
            timestamp: new Date().toISOString()
        });
    }
    
    // Recalculer le cumul : valeur initiale + historique
    const initialValue = getInitialValue(troncon, activity);
    const totalFromHistory = dailyHistory
        .filter(entry => entry.troncon === troncon && entry.activity === activity)
        .reduce((sum, entry) => sum + entry.dailyProgress, 0);
    
    troncons[troncon].activities[activity].cumul = initialValue + totalFromHistory;
    
    updateStats();
    updateAllCharts();
    autoSave();
    
    if (dailyProgress > 0) {
        showNotification(`Avancement journalier mis à jour: ${formatNumber(dailyProgress)} ml`);
    }
}

function updateStats() {
    const totalTroncons = Object.keys(troncons).length;
    
    let totalDistance = 0;
    let totalTerrassement = 0;
    let totalPose = 0;
    let totalLivraison = 0;
    let totalLitPose = 0;
    let totalRP = 0;
    let totalRS = 0;
    
    Object.values(troncons).forEach(troncon => {
        totalDistance += troncon.distanceTotale;
        
        if (troncon.activities.terrassement) {
            totalTerrassement += troncon.activities.terrassement.cumul;
        }
        
        if (troncon.activities['pose conduite']) {
            totalPose += troncon.activities['pose conduite'].cumul;
        }
        
        if (troncon.activities['Livraison conduite']) {
            totalLivraison += troncon.activities['Livraison conduite'].cumul;
        }
        
        if (troncon.activities['lit de pose']) {
            totalLitPose += troncon.activities['lit de pose'].cumul;
        }
        
        if (troncon.activities['RP']) {
            totalRP += troncon.activities['RP'].cumul;
        }
        
        if (troncon.activities['RS']) {
            totalRS += troncon.activities['RS'].cumul;
        }
    });
    
    document.getElementById('totalTroncons').textContent = totalTroncons;
    document.getElementById('globalTerrassement').textContent = totalDistance > 0 ? Math.round((totalTerrassement / totalDistance) * 100) + '%' : '0%';
    document.getElementById('globalPose').textContent = totalDistance > 0 ? Math.round((totalPose / totalDistance) * 100) + '%' : '0%';
    document.getElementById('globalLivraison').textContent = totalDistance > 0 ? Math.round((totalLivraison / totalDistance) * 100) + '%' : '0%';
    document.getElementById('globalLitPose').textContent = totalDistance > 0 ? Math.round((totalLitPose / totalDistance) * 100) + '%' : '0%';
    document.getElementById('globalRP').textContent = totalDistance > 0 ? Math.round((totalRP / totalDistance) * 100) + '%' : '0%';
    document.getElementById('globalRS').textContent = totalDistance > 0 ? Math.round((totalRS / totalDistance) * 100) + '%' : '0%';
}

function editActivity(troncon, activity) {
    editingTroncon = troncon;
    editingActivity = activity;
    
    const activityData = troncons[troncon].activities[activity];
    document.getElementById('editActivity').value = activity;
    document.getElementById('editCumul').value = activityData.cumul;
    document.getElementById('editTarget').value = activityData.target;
    
    document.getElementById('editModal').style.display = 'block';
}

function deleteActivity(troncon, activity) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'activité "${activity}" du ${troncon}?`)) {
        delete troncons[troncon].activities[activity];
        
        // Supprimer aussi de l'historique
        dailyHistory = dailyHistory.filter(entry => 
            !(entry.troncon === troncon && entry.activity === activity)
        );
        
        renderTroncons();
        updateStats();
        updateAllCharts();
        autoSave();
    }
}

function addNewActivity(troncon) {
    const activityName = prompt('Nom de la nouvelle activité:');
    const target = parseFloat(prompt('Objectif (quantité totale en ml):'));
    
    if (activityName && target) {
        troncons[troncon].activities[activityName] = {
            cumul: 0,
            target: target,
            unit: 'ml'
        };
        
        renderTroncons();
        updateStats();
        updateAllCharts();
        autoSave();
        showNotification(`Activité "${activityName}" ajoutée avec succès`);
    }
}

function addNewTroncon() {
    const name = prompt('Nom du nouveau tronçon:');
    const longueur = prompt('Longueur du tronçon (ex: 5.2KM):');
    const distanceTotale = parseFloat(prompt('Distance totale (en ml):'));
    
    if (name && longueur && distanceTotale && !isNaN(distanceTotale)) {
        troncons[name] = {
            longueur: longueur,
            distanceTotale: distanceTotale,
            activities: {
                'terrassement': { cumul: 0, target: distanceTotale, unit: 'ml' }
            }
        };
        
        populateTronconSelect();
        renderTroncons();
        updateStats();
        updateAllCharts();
        autoSave();
        showNotification(`Tronçon "${name}" ajouté avec succès`);
    } else {
        showNotification('Données invalides', 'error');
    }
}

document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newCumul = parseFloat(document.getElementById('editCumul').value);
    const newTarget = parseFloat(document.getElementById('editTarget').value);
    
    troncons[editingTroncon].activities[editingActivity].cumul = newCumul;
    troncons[editingTroncon].activities[editingActivity].target = newTarget;
    
    closeModal();
    renderTroncons();
    updateStats();
    updateAllCharts();
    autoSave();
    showNotification('Données modifiées avec succès');
});

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.querySelector('.close').addEventListener('click', closeModal);

window.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Fonctions de filtrage par date
function filterByDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Veuillez sélectionner les deux dates', 'error');
        return;
    }
    
    if (startDate > endDate) {
        showNotification('La date de début ne peut pas être supérieure à la date de fin', 'error');
        return;
    }
    
    dateFilter = { start: startDate, end: endDate };
    
    showNotification(`Filtrage appliqué du ${startDate} au ${endDate}`);
    
    // Recréer le graphique linéaire si un tronçon est sélectionné
    const selectedTroncon = document.getElementById('tronconChartSelect').value;
    const selectedActivity = document.getElementById('activityChartSelect').value;
    if (selectedTroncon) {
        createLinearChart(selectedTroncon, selectedActivity || null);
    }
}

function clearDateFilter() {
    dateFilter = null;
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    showNotification('Filtre de date supprimé');
    
    // Recréer le graphique linéaire si un tronçon est sélectionné
    const selectedTroncon = document.getElementById('tronconChartSelect').value;
    const selectedActivity = document.getElementById('activityChartSelect').value;
    if (selectedTroncon) {
        createLinearChart(selectedTroncon, selectedActivity || null);
    }
}

function showDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = dailyHistory.filter(entry => entry.date === today);
    
    if (todayEntries.length === 0) {
        showNotification('Aucune activité enregistrée pour aujourd\'hui', 'error');
        return;
    }
    
    let report = `RAPPORT JOURNALIER - ${today}\n\n`;
    let totalVolume = 0;
    
    const groupedEntries = {};
    todayEntries.forEach(entry => {
        const key = `${entry.troncon} - ${entry.activity}`;
        if (!groupedEntries[key]) {
            groupedEntries[key] = 0;
        }
        groupedEntries[key] += entry.dailyProgress;
        totalVolume += entry.dailyProgress;
    });
    
    Object.entries(groupedEntries).forEach(([key, value]) => {
        report += `${key}: ${formatNumber(value)} ml\n`;
    });
    
    report += `\nVolume total du jour: ${formatNumber(totalVolume)} ml`;
    report += `\nNombre d'entrées: ${todayEntries.length}`;
    alert(report);
}

function resetData() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action est irréversible.')) {
        // Réinitialiser avec les valeurs par défaut
        troncons = JSON.parse(JSON.stringify(defaultTroncons));
        dailyHistory = [];
        
        renderTroncons();
        updateStats();
        updateAllCharts();
        populateTronconSelect();
        autoSave();
        showNotification('Données réinitialisées');
    }
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

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)'};
        color: ${type === 'success' ? '#1a1a1a' : 'white'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    const icon = type === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-triangle"></i>';
    notification.innerHTML = `${icon} ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
