// GitHub Profile Explorer
// API endpoints
const GITHUB_API_BASE = 'https://api.github.com';

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const profileContainer = document.getElementById('profileContainer');
const loadingState = document.getElementById('loadingState');
const welcomeMessage = document.getElementById('welcomeMessage');

// Elementos del perfil
const avatar = document.getElementById('avatar');
const nameElement = document.getElementById('name');
const usernameElement = document.getElementById('username');
const bioElement = document.getElementById('bio');
const reposCount = document.getElementById('reposCount');
const followersCount = document.getElementById('followersCount');
const followingCount = document.getElementById('followingCount');
const profileLink = document.getElementById('profileLink');
const repoCountBadge = document.getElementById('repoCountBadge');
const reposList = document.getElementById('reposList');

// Función para mostrar/ocultar errores
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Función para mostrar loading
function setLoading(isLoading) {
    if (isLoading) {
        profileContainer.classList.add('hidden');
        welcomeMessage.classList.add('hidden');
        loadingState.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}

// Función para buscar usuario y repositorios
async function searchGitHubUser(username) {
    if (!username || username.trim() === '') {
        showError('Por favor, ingresa un nombre de usuario');
        return;
    }

    const cleanUsername = username.trim();
    setLoading(true);

    try {
        // Realizar ambas peticiones en paralelo para mejor rendimiento
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`${GITHUB_API_BASE}/users/${cleanUsername}`),
            fetch(`${GITHUB_API_BASE}/users/${cleanUsername}/repos?sort=updated&per_page=20`)
        ]);

        // Manejar errores de usuario no encontrado
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error(`Usuario "${cleanUsername}" no encontrado en GitHub`);
            } else {
                throw new Error(`Error ${userResponse.status}: No se pudo obtener el perfil`);
            }
        }

        const userData = await userResponse.json();
        
        // Obtener repositorios (pueden estar vacíos, pero no es error)
        let reposData = [];
        if (reposResponse.ok) {
            reposData = await reposResponse.json();
        }

        // Renderizar la información
        renderProfile(userData);
        renderRepositories(reposData);
        
        // Mostrar el contenedor del perfil
        profileContainer.classList.remove('hidden');
        welcomeMessage.classList.add('hidden');
        
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        showError(error.message);
        profileContainer.classList.add('hidden');
        welcomeMessage.classList.remove('hidden');
    } finally {
        setLoading(false);
    }
}

// Renderizar información del perfil
function renderProfile(user) {
    // Avatar
    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s avatar`;
    
    // Nombre (si no tiene nombre público, usar el username)
    nameElement.textContent = user.name || user.login;
    
    // Username
    usernameElement.textContent = `@${user.login}`;
    
    // Bio
    bioElement.textContent = user.bio || 'Este usuario no tiene biografía disponible';
    
    // Estadísticas
    reposCount.textContent = user.public_repos || 0;
    followersCount.textContent = user.followers || 0;
    followingCount.textContent = user.following || 0;
    
    // Enlace al perfil
    profileLink.href = user.html_url;
    
    // Actualizar badge de repositorios
    const repoCount = user.public_repos || 0;
    repoCountBadge.textContent = repoCount;
}

// Renderizar lista de repositorios
function renderRepositories(repos) {
    if (!repos || repos.length === 0) {
        reposList.innerHTML = `
            <div class="repo-card" style="grid-column: 1/-1; text-align: center; color: #8b949e;">
                📭 Este usuario no tiene repositorios públicos
            </div>
        `;
        return;
    }
    
    // Limitar a mostrar máximo 12 repos para no saturar
    const reposToShow = repos.slice(0, 12);
    
    reposList.innerHTML = reposToShow.map(repo => `
        <div class="repo-card">
            <a href="${repo.html_url}" target="_blank" class="repo-name">${repo.name}</a>
            ${repo.description ? `<p class="repo-description">${repo.description.substring(0, 100)}${repo.description.length > 100 ? '...' : ''}</p>` : '<p class="repo-description">📄 Sin descripción</p>'}
            <div class="repo-meta">
                ${repo.language ? `<span><span style="color: #58a6ff;">●</span> ${repo.language}</span>` : ''}
                ${repo.stargazers_count > 0 ? `<span>⭐ ${repo.stargazers_count}</span>` : ''}
                ${repo.forks_count > 0 ? `<span>🍴 ${repo.forks_count}</span>` : ''}
                <span>📅 ${new Date(repo.updated_at).toLocaleDateString('es-ES')}</span>
            </div>
        </div>
    `).join('');
}

// Manejador de búsqueda
function handleSearch() {
    const username = searchInput.value.trim();
    if (username) {
        searchGitHubUser(username);
        // Limpiar input si se desea (opcional, mejor mantenerlo)
        // No limpiamos para que el usuario vea lo que buscó
    } else {
        showError('Por favor, ingresa un nombre de usuario para buscar');
        searchInput.focus();
    }
}

// Manejar tecla Enter en el input
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Click en botón buscar
searchBtn.addEventListener('click', handleSearch);

// Sugerencias (botones de ejemplo)
document.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const username = btn.getAttribute('data-user');
        if (username) {
            searchInput.value = username;
            searchGitHubUser(username);
        }
    });
});

// Limpiar mensaje de error al empezar a escribir
searchInput.addEventListener('input', () => {
    errorMessage.classList.add('hidden');
});

// Ejecutar búsqueda inicial con un usuario por defecto? (opcional)
// Para mejorar experiencia, se puede dejar vacío o mostrar welcome
// Si se desea un perfil por defecto al cargar, descomentar la línea:
// searchGitHubUser('github');
