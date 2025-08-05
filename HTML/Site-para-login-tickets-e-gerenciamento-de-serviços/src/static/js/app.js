/**
 * app.js
 * Ponto de entrada principal do frontend.
 * Responsável por inicializar a aplicação e configurar os event listeners globais.
 */

// Variáveis de estado globais (podem ser movidas para um módulo de estado mais tarde)
let state = {
    currentUser: null,
    isAdmin: false,
    currentPage: 'dashboard',
    companies: [],
    services: [],
};

// Função principal de inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistema de Tickets T1 inicializado.");

    // Configurar todos os listeners de eventos da aplicação
    setupEventListeners();

    // Verificar o estado de autenticação do usuário
    auth.checkLoginStatus();
});

// Dentro de app.js

function setupEventListeners() {
    // --- Autenticação e Perfil (agora vindo de user-management.js) ---
    document.getElementById('login-form').addEventListener('submit', handleLogin); // Supondo que handleLogin está no app.js ou user-management.js
    document.getElementById('register-form').addEventListener('submit', handleRegister); // Idem
    document.getElementById('logout-link').addEventListener('click', handleLogout); // Idem
    
    document.getElementById('profile-link').addEventListener('click', openProfileModal); // Chama a função de user-management.js
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile); // Chama a função de user-management.js

    // --- Navegação ---
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', ui.handleNavigation); // Usa o módulo ui.js
    });
    
    // --- Gestão de Utilizadores (Admin - vindo de user-management.js) ---
    // Na navegação, quando a página de utilizadores for carregada, ela deve chamar loadUsers()
    // Exemplo dentro de ui.handleNavigation:
    // if (targetPage === 'users') {
    //     loadUsers(); // Chama a função de user-management.js
    // }
    document.getElementById('new-user-btn').addEventListener('click', () => openUserEditorModal()); // ou uma função similar para abrir o modal de novo usuário
    document.getElementById('save-user-btn').addEventListener('click', saveUser); // Chama a função de user-management.js
    
    // --- Outras Funcionalidades (continuam modulares) ---
    document.getElementById('save-ticket-btn').addEventListener('click', ticket.save); // Usa o módulo ticket.js
    document.getElementById('save-service-btn').addEventListener('click', service.save); // Usa o módulo service.js
    // ... e assim por diante.
}