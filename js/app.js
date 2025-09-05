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
let charts = {};
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

// Fonction d'initialisation des données
function initializeData() {
    // Charger depuis localStorage
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
    } else {
        // Utiliser les données par défaut
        troncons = JSON.parse(JSON.stringify(defaultTroncons));
        dailyHistory = [];
    }
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

// ... (le reste des fonctions de gestion des données) ...
