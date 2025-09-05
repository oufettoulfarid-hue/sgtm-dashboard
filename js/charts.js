// Variables globales pour les graphiques
let charts = {};

// Gestion des graphiques
function createAllCharts() {
    createGlobalChart();
    createActivityPieChart();
}

function createGlobalChart() {
    const ctx = document.getElementById('globalChart').getContext('2d');
    
    if (charts.globalChart) {
        charts.globalChart.destroy();
    }
    
    const allActivities = new Set();
    Object.values(troncons).forEach(tronconData => {
        Object.keys(tronconData.activities).forEach(activity => {
            allActivities.add(activity);
        });
    });
    
    const activityArray = Array.from(allActivities);
    const tronconNames = Object.keys(troncons);
    
    const activityColors = {
        'terrassement': '#f4a261',
        'pose conduite': '#2a9d8f',
        'Livraison conduite': '#e76f51',
        'lit de pose': '#264653',
        'RP': '#457b9d',
        'RS': '#9c89b8'
    };
    
    const datasets = activityArray.map(activity => {
        const data = tronconNames.map(troncon => {
            const tronconData = troncons[troncon];
            if (tronconData.activities[activity]) {
                return Math.round((tronconData.activities[activity].cumul / tronconData.activities[activity].target) * 100);
            }
            return 0;
        });
        
        return {
            label: activity.charAt(0).toUpperCase() + activity.slice(1),
            data: data,
            backgroundColor: activityColors[activity] || '#ffd700',
            borderColor: '#1a1a1a',
            borderWidth: 1
        };
    });
    
    charts.globalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: tronconNames,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffd700',
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#ffd700',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    },
                    title: {
                        display: true,
                        text: 'Pourcentage de progression',
                        color: '#ffd700'
                    }
                },
                x: {
                    ticks: {
                        color: '#ffd700'
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    },
                    title: {
                        display: true,
                        text: 'Tronçons',
                        color: '#ffd700'
                    }
                }
            }
        }
    });
}

function createActivityPieChart() {
    // Cette fonction n'est plus utilisée car nous n'avons qu'un graphique principal
}

function createLinearChart(tronconName, specificActivity = null) {
    const ctx = document.getElementById('linearChart').getContext('2d');
    
    if (charts.linearChart) {
        charts.linearChart.destroy();
    }
    
    if (!troncons[tronconName]) return;
    
    // Filtrer l'historique pour ce tronçon
    let filteredHistory = dailyHistory.filter(entry => entry.troncon === tronconName);
    
    // Appliquer le filtre de date si nécessaire
    if (dateFilter) {
        filteredHistory = filteredHistory.filter(entry => 
            entry.date >= dateFilter.start && entry.date <= dateFilter.end
        );
    }
    
    // Filtrer par activité spécifique si sélectionnée
    if (specificActivity) {
        filteredHistory = filteredHistory.filter(entry => entry.activity === specificActivity);
    }
    
    // Obtenir toutes les dates uniques et les trier
    const allDates = [...new Set(filteredHistory.map(entry => entry.date))].sort();
    
    if (allDates.length === 0) {
        // Si pas de données, créer un graphique avec les données actuelles
        const tronconData = troncons[tronconName];
        const activities = specificActivity ? [specificActivity] : Object.keys(tronconData.activities);
        
        const activityColors = {
            'terrassement': '#f4a261',
            'pose conduite': '#2a9d8f',
            'Livraison conduite': '#e76f51',
            'lit de pose': '#264653',
            'RP': '#457b9d',
            'RS': '#9c89b8'
        };
        
        const datasets = activities.map(activity => {
            const currentValue = tronconData.activities[activity] ? tronconData.activities[activity].cumul : 0;
            return {
                label: activity,
                data: [currentValue],
                borderColor: activityColors[activity] || '#ffd700',
                backgroundColor: (activityColors[activity] || '#ffd700') + '20',
                fill: false,
                tension: 0.1
            };
        });
        
        charts.linearChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Cumul actuel'],
                datasets: datasets
            },
            options: getLinearChartOptions()
        });
        return;
    }
    
    // Obtenir les activités pour ce tronçon
    const activities = specificActivity ? [specificActivity] : Object.keys(troncons[tronconName].activities);
    
    const activityColors = {
        'terrassement': '#f4a261',
        'pose conduite': '#2a9d8f',
        'Livraison conduite': '#e76f51',
        'lit de pose': '#264653',
        'RP': '#457b9d',
        'RS': '#9c89b8'
    };
    
    // Créer les datasets pour chaque activité
    const datasets = activities.map(activity => {
        const data = [];
        let cumulativeSum = getInitialValue(tronconName, activity); // Commencer avec la valeur initiale
        
        allDates.forEach(date => {
            const dayEntries = filteredHistory.filter(entry => 
                entry.date === date && entry.activity === activity
            );
            
            const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.dailyProgress, 0);
            cumulativeSum += dayTotal;
            data.push(cumulativeSum);
        });
        
        return {
            label: activity,
            data: data,
            borderColor: activityColors[activity] || '#ffd700',
            backgroundColor: (activityColors[activity] || '#ffd700') + '20',
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });
    
    charts.linearChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allDates.map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            }),
            datasets: datasets
        },
        options: getLinearChartOptions()
    });
}

function getLinearChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffd700',
                    font: {
                        size: 11
                    },
                    usePointStyle: true
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${formatNumber(context.parsed.y)} ml`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#ffd700',
                    callback: function(value) {
                        return formatNumber(value) + ' ml';
                    }
                },
                grid: {
                    color: 'rgba(255, 215, 0, 0.2)'
                },
                title: {
                    display: true,
                    text: 'Cumul des travaux (ml)',
                    color: '#ffd700'
                }
            },
            x: {
                ticks: {
                    color: '#ffd700',
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    color: 'rgba(255, 215, 0, 0.2)'
                },
                title: {
                    display: true,
                    text: 'Date',
                    color: '#ffd700'
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };
}

function updateAllCharts() {
    createAllCharts();
    
    // Recréer le graphique linéaire si un tronçon est sélectionné
    const selectedTroncon = document.getElementById('tronconChartSelect').value;
    const selectedActivity = document.getElementById('activityChartSelect').value;
    if (selectedTroncon) {
        createLinearChart(selectedTroncon, selectedActivity || null);
    }
}
