// Variáveis globais
let currentUser = null;
let isAdmin = false;
let companies = [];
let services = [];
let currentPage = 'dashboard';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Adicione esta função
function applyTheme() {
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.getElementById('themeToggle').innerHTML = '<i class="bi bi-moon-fill"></i>';
  }
}

// Adicione este event listener no setupEventListeners()
document.getElementById('themeToggle').addEventListener('click', () => {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
  applyTheme();
});

// Chame applyTheme() no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  // ... resto do seu código
});
// Elementos DOM
const loginArea = document.getElementById('login-area');
const mainArea = document.getElementById('main-area');
const usernameDisplay = document.getElementById('username-display');
const adminElements = document.querySelectorAll('.admin-only');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há token de autenticação
    const token = localStorage.getItem('auth_token');
    if (token) {
        fetchCurrentUser();
    }

    // Configurar listeners de eventos
    setupEventListeners();
});

// Configuração de listeners de eventos
function setupEventListeners() {
    // Formulário de login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Formulário de registro
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    
    // Navegação
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Logout
    document.getElementById('logout-link').addEventListener('click', handleLogout);
    
    // Perfil do usuário
    document.getElementById('profile-link').addEventListener('click', openProfileModal);
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    
    // Validação de senha no perfil
    document.getElementById('profile-confirm-password').addEventListener('input', validatePasswordMatch);
    document.getElementById('profile-password').addEventListener('input', validatePasswordMatch);
    
    // Botões de criação
    document.getElementById('new-ticket-btn').addEventListener('click', () => openTicketModal());
    document.getElementById('new-service-btn').addEventListener('click', () => openServiceModal());
    document.getElementById('new-user-btn').addEventListener('click', () => openUserModal());
    document.getElementById('new-company-btn').addEventListener('click', () => openCompanyModal());
    
    // Botões de salvar
    document.getElementById('save-ticket-btn').addEventListener('click', saveTicket);
    document.getElementById('save-service-btn').addEventListener('click', saveService);
    document.getElementById('save-user-btn').addEventListener('click', saveUser);
    document.getElementById('save-company-btn').addEventListener('click', saveCompany);
    
    // Adicionar comentário
    document.getElementById('add-comment-btn').addEventListener('click', addComment);
    
    // Filtros
    document.getElementById('apply-filters-btn').addEventListener('click', loadTickets);
}

// Autenticação e Usuários
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        console.log('Tentando login com:', email);
        
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Resposta do servidor:', response.status);
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (response.ok) {
            // Armazenar token (simulado, já que estamos usando sessions)
            localStorage.setItem('auth_token', 'authenticated');
            currentUser = data.user;
            isAdmin = currentUser.is_admin;
            
            console.log('Login bem-sucedido, usuário:', currentUser);
            
            // Forçar atualização da visibilidade
            loginArea.style.display = 'none';
            mainArea.style.display = 'block';
            
            // Atualizar elementos da interface
            showMainArea();
            loadDashboard();
            
            // Notificar usuário
            showNotification('Login realizado com sucesso!', 'success');
            
            // Forçar redirecionamento para o dashboard
            document.querySelector('.nav-link[data-page="dashboard"]').classList.add('active');
        } else {
            console.error('Erro no login:', data.error);
            showNotification(data.error || 'Erro ao fazer login', 'danger');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const companyName = document.getElementById('register-company').value;
    const companyDesc = document.getElementById('register-company-desc').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                email, 
                password,
                company_name: companyName,
                company_description: companyDesc
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registro realizado com sucesso! Faça login para continuar.', 'success');
            document.getElementById('login-tab').click();
            document.getElementById('register-form').reset();
        } else {
            showNotification(data.error || 'Erro ao registrar', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

async function fetchCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            isAdmin = currentUser.is_admin;
            
            showMainArea();
            loadDashboard();
        } else {
            // Token inválido ou expirado
            localStorage.removeItem('auth_token');
        }
    } catch (error) {
        console.error('Erro:', error);
        localStorage.removeItem('auth_token');
    }
}

function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => {
            localStorage.removeItem('auth_token');
            currentUser = null;
            isAdmin = false;
            showLoginArea();
            showNotification('Logout realizado com sucesso!', 'success');
        })
        .catch(error => {
            console.error('Erro:', error);
            showNotification('Erro ao fazer logout', 'danger');
        });
}

// Navegação
function handleNavigation(e) {
    e.preventDefault();
    
    const targetPage = e.target.getAttribute('data-page');
    if (!targetPage) return;
    
    // Atualizar navegação ativa
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Esconder todas as páginas
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
    });
    
    // Mostrar página selecionada
    const pageElement = document.getElementById(`${targetPage}-page`);
    pageElement.classList.remove('d-none');
    
    // Garantir que o botão Novo Ticket esteja visível na página de tickets
    if (targetPage === 'tickets') {
        const newTicketBtn = document.getElementById('new-ticket-btn');
        if (newTicketBtn) {
            newTicketBtn.style.display = 'block';
            console.log('Botão Novo Ticket deve estar visível agora');
        }
    }
    
    currentPage = targetPage;
    
    // Carregar dados da página
    switch (targetPage) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'tickets':
            loadTickets();
            break;
        case 'services':
            loadServices();
            break;
        case 'users':
            loadUsers();
            break;
        case 'companies':
            loadCompanies();
            break;
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Carregar estatísticas de tickets
        const ticketsResponse = await fetch('/api/tickets/stats');
        const ticketsData = await ticketsResponse.json();
        
        // Atualizar contadores
        document.getElementById('total-tickets').textContent = ticketsData.total;
        document.getElementById('open-tickets').textContent = ticketsData.by_status.aberto;
        document.getElementById('in-progress-tickets').textContent = ticketsData.by_status.em_andamento;
        document.getElementById('resolved-tickets').textContent = ticketsData.by_status.resolvido;
        
        // Carregar tickets recentes
        const recentTicketsResponse = await fetch('/api/tickets');
        const tickets = await recentTicketsResponse.json();
        
        const recentTicketsTable = document.getElementById('recent-tickets-table');
        recentTicketsTable.innerHTML = '';
        
        // Mostrar apenas os 5 tickets mais recentes
        const recentTickets = tickets.slice(0, 5);
        
        recentTickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td><span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span></td>
                <td>${formatDate(ticket.created_at)}</td>
            `;
            row.style.cursor = 'pointer';
            row.addEventListener('click', () => openTicketModal(ticket.id));
            recentTicketsTable.appendChild(row);
        });
        
        // Carregar estatísticas de serviços
        const servicesResponse = await fetch('/api/services/stats');
        const servicesData = await servicesResponse.json();
        
        // Renderizar gráfico de serviços mais utilizados
        renderServicesChart(servicesData.top_services);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showNotification('Erro ao carregar dados do dashboard', 'danger');
    }
}

function renderServicesChart(topServices) {
    const ctx = document.getElementById('services-chart');
    
    // Destruir gráfico anterior se existir
    if (window.servicesChart) {
        window.servicesChart.destroy();
    }
    
    // Criar novo gráfico
    window.servicesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topServices.map(service => service.name),
            datasets: [{
                label: 'Tickets',
                data: topServices.map(service => service.ticket_count),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Tickets
async function loadTickets() {
    try {
        // Construir URL com filtros
        let url = '/api/tickets';
        const filters = [];
        
        const status = document.getElementById('filter-status').value;
        if (status) filters.push(`status=${status}`);
        
        const priority = document.getElementById('filter-priority').value;
        if (priority) filters.push(`priority=${priority}`);
        
        const company = document.getElementById('filter-company').value;
        if (company) filters.push(`company_from=${company}`);
        
        const service = document.getElementById('filter-service').value;
        if (service) filters.push(`service_id=${service}`);
        
        if (filters.length > 0) {
            url += '?' + filters.join('&');
        }
        
        const response = await fetch(url);
        const tickets = await response.json();
        
        const ticketsTable = document.getElementById('tickets-table');
        ticketsTable.innerHTML = '';
        
        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.company_from}</td>
                <td>${ticket.company_to}</td>
                <td>${ticket.service}</td>
                <td><span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span></td>
                <td><span class="priority-badge priority-${ticket.priority}">${formatPriority(ticket.priority)}</span></td>
                <td>${formatDate(ticket.created_at)}</td>
                <td>
                    <button class="btn btn-sm btn-primary view-ticket" data-id="${ticket.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            ticketsTable.appendChild(row);
        });
        
        // Adicionar event listeners para botões de visualização
        document.querySelectorAll('.view-ticket').forEach(button => {
            button.addEventListener('click', () => {
                const ticketId = button.getAttribute('data-id');
                openTicketModal(ticketId);
            });
        });
        
        // Carregar opções de filtro
        if (!document.getElementById('filter-company').options.length > 1) {
            await loadFilterOptions();
        }
        
    } catch (error) {
        console.error('Erro ao carregar tickets:', error);
        showNotification('Erro ao carregar tickets', 'danger');
    }
}

async function loadFilterOptions() {
    try {
        // Carregar empresas para filtro
        const companiesResponse = await fetch('/api/companies');
        const companiesData = await companiesResponse.json();
        
        const companyFilter = document.getElementById('filter-company');
        companiesData.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            companyFilter.appendChild(option);
        });
        
        // Carregar serviços para filtro
        const servicesResponse = await fetch('/api/services');
        const servicesData = await servicesResponse.json();
        
        const serviceFilter = document.getElementById('filter-service');
        servicesData.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceFilter.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar opções de filtro:', error);
    }
}

async function openTicketModal(ticketId = null) {
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
    const modalTitle = document.getElementById('ticketModalLabel');
    const ticketForm = document.getElementById('ticket-form');
    const ticketDetails = document.getElementById('ticket-details');
    const saveButton = document.getElementById('save-ticket-btn');
    
    // Resetar formulário
    ticketForm.reset();
    document.getElementById('ticket-id').value = '';
    
    // Carregar empresas e serviços para o formulário
    await loadCompaniesForForm();
    await loadServicesForForm();
    
    if (ticketId) {
        // Modo de edição/visualização
        modalTitle.textContent = 'Detalhes do Ticket';
        ticketDetails.classList.remove('d-none');
        
        try {
            const response = await fetch(`/api/tickets/${ticketId}`);
            const ticket = await response.json();
            
            // Preencher formulário
            document.getElementById('ticket-id').value = ticket.id;
            document.getElementById('ticket-title').value = ticket.title;
            document.getElementById('ticket-description').value = ticket.description;
            
            // Selecionar empresas
            const companyFromSelect = document.getElementById('ticket-company-from');
            const companyToSelect = document.getElementById('ticket-company-to');
            
            for (let i = 0; i < companyFromSelect.options.length; i++) {
                if (companyFromSelect.options[i].textContent === ticket.company_from) {
                    companyFromSelect.selectedIndex = i;
                    break;
                }
            }
            
            for (let i = 0; i < companyToSelect.options.length; i++) {
                if (companyToSelect.options[i].textContent === ticket.company_to) {
                    companyToSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Selecionar serviço
            const serviceSelect = document.getElementById('ticket-service');
            for (let i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].textContent === ticket.service) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
            
            // Selecionar prioridade e status
            document.getElementById('ticket-priority').value = ticket.priority;
            document.getElementById('ticket-status').value = ticket.status;
            
            // Definir deadline se existir
            if (ticket.deadline) {
                const deadlineDate = new Date(ticket.deadline);
                document.getElementById('ticket-deadline').value = deadlineDate.toISOString().split('T')[0];
            }
            
            // Carregar comentários
            await loadTicketComments(ticketId);
            
        } catch (error) {
            console.error('Erro ao carregar ticket:', error);
            showNotification('Erro ao carregar detalhes do ticket', 'danger');
        }
    } else {
        // Modo de criação
        modalTitle.textContent = 'Novo Ticket';
        ticketDetails.classList.add('d-none');
        
        // Pré-selecionar empresa do usuário como origem
        if (currentUser && currentUser.company) {
            const companyFromSelect = document.getElementById('ticket-company-from');
            for (let i = 0; i < companyFromSelect.options.length; i++) {
                if (companyFromSelect.options[i].textContent === currentUser.company) {
                    companyFromSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }
    
    modal.show();
}

async function loadTicketComments(ticketId) {
    try {
        const response = await fetch(`/api/tickets/${ticketId}/comments`);
        const comments = await response.json();
        
        const commentsContainer = document.getElementById('comments-container');
        commentsContainer.innerHTML = '';
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="text-muted">Nenhum comentário ainda.</p>';
            return;
        }
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-container';
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span><strong>${comment.user}</strong></span>
                    <span>${formatDate(comment.created_at)}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            commentsContainer.appendChild(commentElement);
        });
        
    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        showNotification('Erro ao carregar comentários', 'danger');
    }
}

async function addComment() {
    const ticketId = document.getElementById('ticket-id').value;
    const commentContent = document.getElementById('new-comment').value.trim();
    
    if (!commentContent) {
        showNotification('O comentário não pode estar vazio', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/tickets/${ticketId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: commentContent })
        });
        
        if (response.ok) {
            document.getElementById('new-comment').value = '';
            await loadTicketComments(ticketId);
            showNotification('Comentário adicionado com sucesso', 'success');
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao adicionar comentário', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

async function saveTicket() {
    const ticketId = document.getElementById('ticket-id').value;
    const isNewTicket = !ticketId;
    
    const ticketData = {
        title: document.getElementById('ticket-title').value,
        description: document.getElementById('ticket-description').value,
        company_from_id: document.getElementById('ticket-company-from').value,
        company_to_id: document.getElementById('ticket-company-to').value,
        service_id: document.getElementById('ticket-service').value,
        priority: document.getElementById('ticket-priority').value,
        deadline: document.getElementById('ticket-deadline').value || null
    };
    
    // Adicionar status se estiver editando
    if (!isNewTicket) {
        ticketData.status = document.getElementById('ticket-status').value;
    }
    
    try {
        let url = '/api/tickets';
        let method = 'POST';
        
        if (!isNewTicket) {
            url = `/api/tickets/${ticketId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();
            
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'tickets') {
                loadTickets();
            }
            
            showNotification(
                isNewTicket ? 'Ticket criado com sucesso' : 'Ticket atualizado com sucesso', 
                'success'
            );
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao salvar ticket', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

// Serviços
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        services = await response.json();
        
        const servicesTable = document.getElementById('services-table');
        servicesTable.innerHTML = '';
        
        services.forEach(service => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${service.id}</td>
                <td>${service.name}</td>
                <td>${service.category || '-'}</td>
                <td>${service.sla_hours || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-service" data-id="${service.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-service admin-only" data-id="${service.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            servicesTable.appendChild(row);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.edit-service').forEach(button => {
            button.addEventListener('click', () => {
                const serviceId = button.getAttribute('data-id');
                openServiceModal(serviceId);
            });
        });
        
        document.querySelectorAll('.delete-service').forEach(button => {
            button.addEventListener('click', () => {
                const serviceId = button.getAttribute('data-id');
                confirmDelete('service', serviceId);
            });
        });
        
        // Atualizar visibilidade de elementos admin
        updateAdminElementsVisibility();
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        showNotification('Erro ao carregar serviços', 'danger');
    }
}

async function loadServiceCategories() {
    try {
        const response = await fetch('/api/services/categories');
        const categories = await response.json();
        
        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            categoryList.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function openServiceModal(serviceId = null) {
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    const modalTitle = document.getElementById('serviceModalLabel');
    const serviceForm = document.getElementById('service-form');
    
    // Resetar formulário
    serviceForm.reset();
    document.getElementById('service-id').value = '';
    
    // Carregar categorias existentes
    loadServiceCategories();
    
    if (serviceId) {
        // Modo de edição
        modalTitle.textContent = 'Editar Serviço';
        
        const service = services.find(s => s.id == serviceId);
        if (service) {
            document.getElementById('service-id').value = service.id;
            document.getElementById('service-name').value = service.name;
            document.getElementById('service-description').value = service.description || '';
            document.getElementById('service-category').value = service.category || '';
            document.getElementById('service-sla').value = service.sla_hours || '';
        }
    } else {
        // Modo de criação
        modalTitle.textContent = 'Novo Serviço';
    }
    
    modal.show();
}

async function saveService() {
    const serviceId = document.getElementById('service-id').value;
    const isNewService = !serviceId;
    
    const serviceData = {
        name: document.getElementById('service-name').value,
        description: document.getElementById('service-description').value,
        category: document.getElementById('service-category').value || null,
        sla_hours: document.getElementById('service-sla').value || null
    };
    
    try {
        let url = '/api/services';
        let method = 'POST';
        
        if (!isNewService) {
            url = `/api/services/${serviceId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(serviceData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
            loadServices();
            showNotification(
                isNewService ? 'Serviço criado com sucesso' : 'Serviço atualizado com sucesso', 
                'success'
            );
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao salvar serviço', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

// Usuários (Admin)
async function loadUsers() {
    if (!isAdmin) {
        showNotification('Acesso negado', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        
        const usersTable = document.getElementById('users-table');
        usersTable.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.company || '-'}</td>
                <td>${user.is_admin ? '<span class="badge bg-primary">Sim</span>' : 'Não'}</td>
                <td>${user.last_login ? formatDate(user.last_login) : 'Nunca'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            usersTable.appendChild(row);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                openUserModal(userId);
            });
        });
        
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                confirmDelete('user', userId);
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'danger');
    }
}

async function openUserModal(userId = null) {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    const modalTitle = document.getElementById('userModalLabel');
    const userForm = document.getElementById('user-form');
    
    // Resetar formulário
    userForm.reset();
    document.getElementById('user-id').value = '';
    
    // Carregar empresas para o formulário
    await loadCompaniesForForm('user-company');
    
    if (userId) {
        // Modo de edição
        modalTitle.textContent = 'Editar Usuário';
        
        try {
            const response = await fetch(`/api/users/${userId}`);
            const user = await response.json();
            
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-admin').checked = user.is_admin;
            
            // Selecionar empresa
            const companySelect = document.getElementById('user-company');
            if (user.company) {
                for (let i = 0; i < companySelect.options.length; i++) {
                    if (companySelect.options[i].textContent === user.company) {
                        companySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            showNotification('Erro ao carregar detalhes do usuário', 'danger');
        }
    } else {
        // Modo de criação
        modalTitle.textContent = 'Novo Usuário';
    }
    
    modal.show();
}

async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const isNewUser = !userId;
    
    const userData = {
        username: document.getElementById('user-username').value,
        email: document.getElementById('user-email').value,
        is_admin: document.getElementById('user-admin').checked,
        company_id: document.getElementById('user-company').value || null
    };
    
    // Adicionar senha apenas se fornecida ou se for novo usuário
    const password = document.getElementById('user-password').value;
    if (password || isNewUser) {
        userData.password = password;
    }
    
    try {
        let url = '/api/users';
        let method = 'POST';
        
        if (!isNewUser) {
            url = `/api/users/${userId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            loadUsers();
            showNotification(
                isNewUser ? 'Usuário criado com sucesso' : 'Usuário atualizado com sucesso', 
                'success'
            );
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao salvar usuário', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

// Empresas (Admin)
async function loadCompanies() {
    if (!isAdmin) {
        showNotification('Acesso negado', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/companies');
        companies = await response.json();
        
        const companiesTable = document.getElementById('companies-table');
        companiesTable.innerHTML = '';
        
        companies.forEach(company => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${company.id}</td>
                <td>${company.name}</td>
                <td>${company.description || '-'}</td>
                <td>-</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-company" data-id="${company.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-company" data-id="${company.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            companiesTable.appendChild(row);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.edit-company').forEach(button => {
            button.addEventListener('click', () => {
                const companyId = button.getAttribute('data-id');
                openCompanyModal(companyId);
            });
        });
        
        document.querySelectorAll('.delete-company').forEach(button => {
            button.addEventListener('click', () => {
                const companyId = button.getAttribute('data-id');
                confirmDelete('company', companyId);
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showNotification('Erro ao carregar empresas', 'danger');
    }
}

function openCompanyModal(companyId = null) {
    const modal = new bootstrap.Modal(document.getElementById('companyModal'));
    const modalTitle = document.getElementById('companyModalLabel');
    const companyForm = document.getElementById('company-form');
    
    // Resetar formulário
    companyForm.reset();
    document.getElementById('company-id').value = '';
    
    if (companyId) {
        // Modo de edição
        modalTitle.textContent = 'Editar Empresa';
        
        const company = companies.find(c => c.id == companyId);
        if (company) {
            document.getElementById('company-id').value = company.id;
            document.getElementById('company-name').value = company.name;
            document.getElementById('company-description').value = company.description || '';
        }
    } else {
        // Modo de criação
        modalTitle.textContent = 'Nova Empresa';
    }
    
    modal.show();
}

async function saveCompany() {
    const companyId = document.getElementById('company-id').value;
    const isNewCompany = !companyId;
    
    const companyData = {
        name: document.getElementById('company-name').value,
        description: document.getElementById('company-description').value || ''
    };
    
    try {
        let url = '/api/companies';
        let method = 'POST';
        
        if (!isNewCompany) {
            url = `/api/companies/${companyId}`;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(companyData)
        });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('companyModal')).hide();
            loadCompanies();
            showNotification(
                isNewCompany ? 'Empresa criada com sucesso' : 'Empresa atualizada com sucesso', 
                'success'
            );
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao salvar empresa', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

// Funções auxiliares
async function loadCompaniesForForm(selectId = null) {
    try {
        if (!companies.length) {
            const response = await fetch('/api/companies');
            companies = await response.json();
        }
        
        const companyFromSelect = document.getElementById(selectId || 'ticket-company-from');
        const companyToSelect = document.getElementById(selectId || 'ticket-company-to');
        
        if (companyFromSelect) {
            // Manter apenas a primeira opção (placeholder)
            while (companyFromSelect.options.length > 1) {
                companyFromSelect.remove(1);
            }
            
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companyFromSelect.appendChild(option);
            });
        }
        
        if (companyToSelect && companyToSelect !== companyFromSelect) {
            // Manter apenas a primeira opção (placeholder)
            while (companyToSelect.options.length > 1) {
                companyToSelect.remove(1);
            }
            
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companyToSelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
    }
}

async function loadServicesForForm() {
    try {
        if (!services.length) {
            const response = await fetch('/api/services');
            services = await response.json();
        }
        
        const serviceSelect = document.getElementById('ticket-service');
        
        // Manter apenas a primeira opção (placeholder)
        while (serviceSelect.options.length > 1) {
            serviceSelect.remove(1);
        }
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Erro ao carregar serviços:', error);
    }
}

function confirmDelete(type, id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmMessage = document.getElementById('confirm-message');
    const confirmButton = document.getElementById('confirm-action-btn');
    
    let message = '';
    switch (type) {
        case 'ticket':
            message = 'Tem certeza que deseja excluir este ticket?';
            break;
        case 'service':
            message = 'Tem certeza que deseja excluir este serviço?';
            break;
        case 'user':
            message = 'Tem certeza que deseja excluir este usuário?';
            break;
        case 'company':
            message = 'Tem certeza que deseja excluir esta empresa?';
            break;
    }
    
    confirmMessage.textContent = message;
    
    // Remover listeners anteriores
    const newConfirmButton = confirmButton.cloneNode(true);
    confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
    
    // Adicionar novo listener
    newConfirmButton.addEventListener('click', () => {
        deleteItem(type, id);
        modal.hide();
    });
    
    modal.show();
}

async function deleteItem(type, id) {
    let url = '';
    let successMessage = '';
    let reloadFunction = null;
    
    switch (type) {
        case 'ticket':
            url = `/api/tickets/${id}`;
            successMessage = 'Ticket excluído com sucesso';
            reloadFunction = loadTickets;
            break;
        case 'service':
            url = `/api/services/${id}`;
            successMessage = 'Serviço excluído com sucesso';
            reloadFunction = loadServices;
            break;
        case 'user':
            url = `/api/users/${id}`;
            successMessage = 'Usuário excluído com sucesso';
            reloadFunction = loadUsers;
            break;
        case 'company':
            url = `/api/companies/${id}`;
            successMessage = 'Empresa excluída com sucesso';
            reloadFunction = loadCompanies;
            break;
    }
    
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showNotification(successMessage, 'success');
            if (reloadFunction) reloadFunction();
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao excluir item', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatStatus(status) {
    const statusMap = {
        'aberto': 'Aberto',
        'em_andamento': 'Em Andamento',
        'pendente': 'Pendente',
        'resolvido': 'Resolvido',
        'fechado': 'Fechado'
    };
    
    return statusMap[status] || status;
}

function formatPriority(priority) {
    const priorityMap = {
        'baixa': 'Baixa',
        'normal': 'Normal',
        'alta': 'Alta',
        'urgente': 'Urgente'
    };
    
    return priorityMap[priority] || priority;
}

function showNotification(message, type = 'info') {
    const toast = document.getElementById('notification-toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Definir classe de acordo com o tipo
    toast.className = 'toast';
    toast.classList.add(`text-bg-${type}`);
    
    toastMessage.textContent = message;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

function showLoginArea() {
    loginArea.classList.remove('d-none');
    loginArea.style.display = 'block';
    mainArea.classList.add('d-none');
    mainArea.style.display = 'none';
}

function showMainArea() {
    loginArea.classList.add('d-none');
    loginArea.style.display = 'none';
    mainArea.classList.remove('d-none');
    mainArea.style.display = 'block';
    
    // Atualizar nome de usuário
    if (currentUser && currentUser.username) {
        usernameDisplay.textContent = currentUser.username;
    }
    
    // Atualizar visibilidade de elementos admin
    updateAdminElementsVisibility();
    
    // Garantir que o dashboard seja exibido
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
        page.style.display = 'none';
    });
    
    const dashboardPage = document.getElementById('dashboard-page');
    if (dashboardPage) {
        dashboardPage.classList.remove('d-none');
        dashboardPage.style.display = 'block';
    }
}

function updateAdminElementsVisibility() {
    adminElements.forEach(element => {
        if (isAdmin) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    });
    // ==============================================
// NOTIFICAÇÕES E ATRIBUIÇÃO DE USUÁRIOS
// ==============================================

// Notificações
function loadNotifications() {
  fetch('/api/notifications')
    .then(response => response.json())
    .then(notifications => {
      const list = document.getElementById('notifications-list');
      list.innerHTML = '';
      
      const unreadCount = notifications.filter(n => !n.is_read).length;
      const unreadBadge = document.getElementById('unread-count');
      
      if (unreadCount > 0) {
        unreadBadge.textContent = unreadCount;
        unreadBadge.classList.remove('d-none');
      } else {
        unreadBadge.classList.add('d-none');
      }
      
      notifications.forEach(notification => {
        const item = document.createElement('li');
        item.className = `dropdown-item ${notification.is_read ? '' : 'fw-bold'}`;
        item.innerHTML = `
          <div class="d-flex justify-content-between">
            <span>${notification.message}</span>
            <small class="text-muted">${formatDate(notification.created_at)}</small>
          </div>
        `;
        item.onclick = () => {
          fetch(`/api/notifications/${notification.id}/read`, { method: 'PUT' });
          openTicketModal(notification.ticket_id);
        };
        list.appendChild(item);
      });
    });
}

// Atribuição de usuários
let currentAssignedTicketId = null;

function openAssignUsersModal(ticketId) {
  currentAssignedTicketId = ticketId;
  const modal = new bootstrap.Modal(document.getElementById('assignUsersModal'));
  
  fetch('/api/users')
    .then(response => response.json())
    .then(users => {
      const checklist = document.getElementById('users-checklist');
      checklist.innerHTML = '';
      
      users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'form-check';
        div.innerHTML = `
          <input class="form-check-input" type="checkbox" value="${user.id}" id="user-${user.id}">
          <label class="form-check-label" for="user-${user.id}">
            ${user.username} (${user.email})
          </label>
        `;
        checklist.appendChild(div);
      });
      
      fetch(`/api/tickets/${ticketId}`)
        .then(response => response.json())
        .then(ticket => {
          if (ticket.assigned_users) {
            ticket.assigned_users.forEach(user => {
              const checkbox = document.getElementById(`user-${user.id}`);
              if (checkbox) checkbox.checked = true;
            });
          }
        });
    });
  
  modal.show();
}

// Event Listeners
document.getElementById('mark-all-read').addEventListener('click', (e) => {
  e.preventDefault();
  fetch('/api/notifications/read_all', { method: 'PUT' })
    .then(() => loadNotifications());
});

document.getElementById('save-assignments-btn').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#users-checklist input[type="checkbox"]:checked');
  const userIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
  
  fetch(`/api/tickets/${currentAssignedTicketId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_ids: userIds })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showNotification('Usuários atribuídos com sucesso!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('assignUsersModal')).hide();
      if (currentPage === 'tickets') loadTickets();
    }
  });
});

// Modificação da função openTicketModal
const originalOpenTicketModal = openTicketModal;
openTicketModal = async function(ticketId = null) {
  await originalOpenTicketModal(ticketId);
  
  if (ticketId) {
    const ticket = await (await fetch(`/api/tickets/${ticketId}`)).json();
    if (isAdmin || currentUser.id === ticket.creator_id) {
      const assignButton = document.createElement('button');
      assignButton.className = 'btn btn-sm btn-outline-primary ms-2';
      assignButton.innerHTML = '<i class="bi bi-person-plus"></i> Atribuir Usuários';
      assignButton.onclick = () => openAssignUsersModal(ticketId);
      document.querySelector('#ticketModal .modal-header').appendChild(assignButton);
    }
  }
};

// Inicialização
setInterval(loadNotifications, 30000);

// Adicione esta linha na função handleLogin após o login bem-sucedido
// loadNotifications();
}