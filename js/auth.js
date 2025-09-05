// Configuration des utilisateurs autorisés
const authorizedUsers = {
    'troncon12': 'KhFa1212',
    'directeur': 'Ahmed El jami',
    'Troncon3': 'Abdo3',
    'Troncon4': 'Badr4'
};

let currentUser = '';

// Système d'authentification
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const accessCode = document.getElementById('accessCode').value.trim();
    
    if (authorizedUsers[username] && authorizedUsers[username] === accessCode) {
        currentUser = username;
        localStorage.setItem('sgtm_current_user', username);
        document.getElementById('currentUser').textContent = username;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Initialiser les données APRÈS la connexion
        initializeData();
        initializeDateInput();
        populateTronconSelect();
        renderTroncons();
        updateStats();
        createAllCharts();
        showNotification('Connexion réussie!');
    } else {
        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = 'Nom d\'utilisateur ou code d\'accès incorrect';
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
});

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        // Sauvegarder avant de déconnecter
        saveToDatabase();
        currentUser = '';
        localStorage.removeItem('sgtm_current_user');
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('loginForm').reset();
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('sgtm_current_user');
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById('currentUser').textContent = savedUser;
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
        // Initialiser les données
        initializeData();
        initializeDateInput();
        populateTronconSelect();
        renderTroncons();
        updateStats();
        createAllCharts();
    }
});
