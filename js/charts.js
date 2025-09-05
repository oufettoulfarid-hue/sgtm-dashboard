
// Gestion des graphiques
function createAllCharts() {
    createGlobalChart();
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

// ... (autres fonctions de graphiques) ...
