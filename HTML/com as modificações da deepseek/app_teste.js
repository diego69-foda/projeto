// Variáveis globais
let currentUser = null, isAdmin = false, companies = [], services = [], currentPage = 'dashboard';
let darkMode = localStorage.getItem('darkMode') === 'true';

// Elementos DOM
const DOM = {
  loginArea: document.getElementById('login-area'),
  mainArea: document.getElementById('main-area'),
  usernameDisplay: document.getElementById('username-display'),
  adminElements: document.querySelectorAll('.admin-only'),
  themeToggle: document.getElementById('themeToggle')
};

// Configuração inicial
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  if (localStorage.getItem('auth_token')) fetchCurrentUser();
  setupEventListeners();
});

// Tema
function applyTheme() {
  const { themeToggle } = DOM;
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
  }
}

// Event Listeners
function setupEventListeners() {
  const { themeToggle } = DOM;
  themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
  });

  // Formulários
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  
  // Navegação
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Perfil
  document.getElementById('logout-link').addEventListener('click', handleLogout);
  document.getElementById('profile-link').addEventListener('click', openProfileModal);
  document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
  
  // Validação de senha
  ['profile-confirm-password', 'profile-password'].forEach(id => {
    document.getElementById(id).addEventListener('input', validatePasswordMatch);
  });
  
  // CRUD
  const crudButtons = {
    'new-ticket-btn': openTicketModal,
    'new-service-btn': openServiceModal,
    'new-user-btn': openUserModal,
    'new-company-btn': openCompanyModal,
    'save-ticket-btn': saveTicket,
    'save-service-btn': saveService,
    'save-user-btn': saveUser,
    'save-company-btn': saveCompany
  };
  
  Object.entries(crudButtons).forEach(([id, handler]) => {
    document.getElementById(id)?.addEventListener('click', handler);
  });
  
  // Comentários e filtros
  document.getElementById('add-comment-btn')?.addEventListener('click', addComment);
  document.getElementById('apply-filters-btn')?.addEventListener('click', loadTickets);
}

// Autenticação
async function handleAuth(e, endpoint, successMsg) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const body = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    if (response.ok) {
      if (endpoint === 'login') {
        localStorage.setItem('auth_token', 'authenticated');
        currentUser = data.user;
        isAdmin = currentUser.is_admin;
        showMainArea();
        loadDashboard();
      }
      showNotification(successMsg, 'success');
      if (endpoint === 'register') {
        document.getElementById('login-tab').click();
        form.reset();
      }
    } else {
      showNotification(data.error || `Erro ao ${endpoint === 'login' ? 'fazer login' : 'registrar'}`, 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    showNotification('Erro ao conectar com o servidor', 'danger');
  }
}

const handleLogin = (e) => handleAuth(e, 'login', 'Login realizado com sucesso!');
const handleRegister = (e) => handleAuth(e, 'register', 'Registro realizado com sucesso!');

async function fetchCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      currentUser = await response.json();
      isAdmin = currentUser.is_admin;
      showMainArea();
      loadDashboard();
    } else {
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
  
  // Atualizar navegação
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.classList.toggle('active', link === e.target);
  });
  
  // Mostrar página selecionada
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.toggle('d-none', page.id !== `${targetPage}-page`);
  });
  
  currentPage = targetPage;
  
  // Carregar dados da página
  const pageLoaders = {
    dashboard: loadDashboard,
    tickets: loadTickets,
    services: loadServices,
    users: loadUsers,
    companies: loadCompanies
  };
  
  if (pageLoaders[targetPage]) pageLoaders[targetPage]();
}

// Dashboard
async function loadDashboard() {
  try {
    const [ticketsData, tickets, servicesData] = await Promise.all([
      fetch('/api/tickets/stats').then(r => r.json()),
      fetch('/api/tickets').then(r => r.json()),
      fetch('/api/services/stats').then(r => r.json())
    ]);
    
    // Atualizar contadores
    const statusCounts = ticketsData.by_status;
    document.getElementById('total-tickets').textContent = ticketsData.total;
    document.getElementById('open-tickets').textContent = statusCounts.aberto;
    document.getElementById('in-progress-tickets').textContent = statusCounts.em_andamento;
    document.getElementById('resolved-tickets').textContent = statusCounts.resolvido;
    
    // Tickets recentes
    const recentTicketsTable = document.getElementById('recent-tickets-table');
    recentTicketsTable.innerHTML = tickets.slice(0, 5).map(ticket => `
      <tr onclick="openTicketModal(${ticket.id})" style="cursor:pointer">
        <td>${ticket.id}</td>
        <td>${ticket.title}</td>
        <td><span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span></td>
        <td>${formatDate(ticket.created_at)}</td>
      </tr>
    `).join('');
    
    // Gráfico de serviços
    renderServicesChart(servicesData.top_services);
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    showNotification('Erro ao carregar dados do dashboard', 'danger');
  }
}

function renderServicesChart(topServices) {
  const ctx = document.getElementById('services-chart');
  if (window.servicesChart) window.servicesChart.destroy();
  
  window.servicesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topServices.map(s => s.name),
      datasets: [{
        label: 'Tickets',
        data: topServices.map(s => s.ticket_count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

// Tickets
async function loadTickets() {
  try {
    const filters = ['status', 'priority', 'company_from', 'service_id']
      .map(field => {
        const value = document.getElementById(`filter-${field}`).value;
        return value ? `${field}=${value}` : null;
      })
      .filter(Boolean);
    
    const url = `/api/tickets${filters.length ? `?${filters.join('&')}` : ''}`;
    const tickets = await fetch(url).then(r => r.json());
    
    document.getElementById('tickets-table').innerHTML = tickets.map(ticket => `
      <tr>
        <td>${ticket.id}</td>
        <td>${ticket.title}</td>
        <td>${ticket.company_from}</td>
        <td>${ticket.company_to}</td>
        <td>${ticket.service}</td>
        <td><span class="status-badge status-${ticket.status}">${formatStatus(ticket.status)}</span></td>
        <td><span class="priority-badge priority-${ticket.priority}">${formatPriority(ticket.priority)}</span></td>
        <td>${formatDate(ticket.created_at)}</td>
        <td><button class="btn btn-sm btn-primary view-ticket" data-id="${ticket.id}"><i class="bi bi-eye"></i></button></td>
      </tr>
    `).join('');
    
    // Event listeners para botões de visualização
    document.querySelectorAll('.view-ticket').forEach(btn => {
      btn.addEventListener('click', () => openTicketModal(btn.getAttribute('data-id')));
    });
    
    // Carregar opções de filtro se necessário
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
    const [companies, services] = await Promise.all([
      fetch('/api/companies').then(r => r.json()),
      fetch('/api/services').then(r => r.json())
    ]);
    
    const populateSelect = (selectId, items) => {
      const select = document.getElementById(selectId);
      select.innerHTML = items.map(item => 
        `<option value="${item.id}">${item.name}</option>`
      ).join('');
    };
    
    populateSelect('filter-company', companies);
    populateSelect('filter-service', services);
  } catch (error) {
    console.error('Erro ao carregar opções de filtro:', error);
  }
}

// CRUD Genérico
async function openCrudModal(type, id = null) {
  const modal = new bootstrap.Modal(document.getElementById(`${type}Modal`));
  const form = document.getElementById(`${type}-form`);
  
  form.reset();
  document.getElementById(`${type}-id`).value = '';
  
  if (id) {
    const item = await fetch(`/api/${type}s/${id}`).then(r => r.json());
    if (item) {
      document.getElementById(`${type}ModalLabel`).textContent = `Editar ${type === 'ticket' ? 'Ticket' : type.charAt(0).toUpperCase() + type.slice(1)}`;
      Object.keys(item).forEach(key => {
        const element = document.getElementById(`${type}-${key.replace(/_/g, '-')}`);
        if (element) element.value = item[key];
      });
      
      if (type === 'ticket') {
        await loadTicketComments(id);
      }
    }
  } else {
    document.getElementById(`${type}ModalLabel`).textContent = `Novo ${type === 'ticket' ? 'Ticket' : type.charAt(0).toUpperCase() + type.slice(1)}`;
    if (type === 'ticket' && currentUser?.company) {
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

async function saveCrudItem(type) {
  const id = document.getElementById(`${type}-id`).value;
  const isNew = !id;
  
  const formData = new FormData(document.getElementById(`${type}-form`));
  const body = Object.fromEntries(formData.entries());
  
  try {
    const url = `/api/${type}s${isNew ? '' : `/${id}`}`;
    const method = isNew ? 'POST' : 'PUT';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById(`${type}Modal`)).hide();
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} ${isNew ? 'criado' : 'atualizado'} com sucesso`, 'success');
      
      if (currentPage === 'dashboard') loadDashboard();
      else if (type === 'ticket') loadTickets();
      else loadItems(type);
    } else {
      const data = await response.json();
      showNotification(data.error || `Erro ao salvar ${type}`, 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    showNotification('Erro ao conectar com o servidor', 'danger');
  }
}

// Funções específicas para cada tipo
const openTicketModal = (id) => openCrudModal('ticket', id);
const openServiceModal = (id) => openCrudModal('service', id);
const openUserModal = (id) => openCrudModal('user', id);
const openCompanyModal = (id) => openCrudModal('company', id);

const saveTicket = () => saveCrudItem('ticket');
const saveService = () => saveCrudItem('service');
const saveUser = () => saveCrudItem('user');
const saveCompany = () => saveCrudItem('company');

// Carregar itens
async function loadItems(type) {
  if (type === 'user' || type === 'company') {
    if (!isAdmin) {
      showNotification('Acesso negado', 'danger');
      return;
    }
  }
  
  try {
    const items = await fetch(`/api/${type}s`).then(r => r.json());
    const table = document.getElementById(`${type}s-table`);
    
    table.innerHTML = items.map(item => {
      let row = `
        <td>${item.id}</td>
        <td>${item.name || item.username || item.title}</td>
      `;
      
      if (type === 'service') {
        row += `
          <td>${item.category || '-'}</td>
          <td>${item.sla_hours || '-'}</td>
        `;
      } else if (type === 'user') {
        row += `
          <td>${item.email}</td>
          <td>${item.company || '-'}</td>
          <td>${item.is_admin ? '<span class="badge bg-primary">Sim</span>' : 'Não'}</td>
          <td>${item.last_login ? formatDate(item.last_login) : 'Nunca'}</td>
        `;
      } else if (type === 'company') {
        row += `
          <td>${item.description || '-'}</td>
          <td>-</td>
        `;
      } else if (type === 'ticket') {
        // Implementação específica já em loadTickets
      }
      
      row += `
        <td>
          <button class="btn btn-sm btn-primary edit-${type}" data-id="${item.id}">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger delete-${type} ${type !== 'ticket' ? 'admin-only' : ''}" data-id="${item.id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      
      return `<tr>${row}</tr>`;
    }).join('');
    
    // Event listeners
    document.querySelectorAll(`.edit-${type}`).forEach(btn => {
      btn.addEventListener('click', () => openCrudModal(type, btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll(`.delete-${type}`).forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(type, btn.getAttribute('data-id')));
    });
    
    updateAdminElementsVisibility();
  } catch (error) {
    console.error(`Erro ao carregar ${type}s:`, error);
    showNotification(`Erro ao carregar ${type}s`, 'danger');
  }
}

const loadServices = () => loadItems('service');
const loadUsers = () => loadItems('user');
const loadCompanies = () => loadItems('company');

// Comentários
async function loadTicketComments(ticketId) {
  try {
    const comments = await fetch(`/api/tickets/${ticketId}/comments`).then(r => r.json());
    const container = document.getElementById('comments-container');
    
    container.innerHTML = comments.length ? comments.map(comment => `
      <div class="comment-container">
        <div class="comment-header">
          <span><strong>${comment.user}</strong></span>
          <span>${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
      </div>
    `).join('') : '<p class="text-muted">Nenhum comentário ainda.</p>';
  } catch (error) {
    console.error('Erro ao carregar comentários:', error);
    showNotification('Erro ao carregar comentários', 'danger');
  }
}

async function addComment() {
  const ticketId = document.getElementById('ticket-id').value;
  const content = document.getElementById('new-comment').value.trim();
  
  if (!content) {
    showNotification('O comentário não pode estar vazio', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
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

// Funções auxiliares
async function loadCompaniesForForm(selectId = null) {
  if (!companies.length) {
    companies = await fetch('/api/companies').then(r => r.json());
  }
  
  const selectIds = selectId ? [selectId] : ['ticket-company-from', 'ticket-company-to'];
  
  selectIds.forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      select.innerHTML = companies.map(company => 
        `<option value="${company.id}">${company.name}</option>`
      ).join('');
    }
  });
}

async function loadServicesForForm() {
  if (!services.length) {
    services = await fetch('/api/services').then(r => r.json());
  }
  
  const select = document.getElementById('ticket-service');
  if (select) {
    select.innerHTML = services.map(service => 
      `<option value="${service.id}">${service.name}</option>`
    ).join('');
  }
}

function confirmDelete(type, id) {
  const messages = {
    ticket: 'excluir este ticket',
    service: 'excluir este serviço',
    user: 'excluir este usuário',
    company: 'excluir esta empresa'
  };
  
  const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  document.getElementById('confirm-message').textContent = `Tem certeza que deseja ${messages[type]}?`;
  
  const confirmButton = document.getElementById('confirm-action-btn');
  const newButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newButton, confirmButton);
  
  newButton.addEventListener('click', () => {
    deleteItem(type, id);
    modal.hide();
  });
  
  modal.show();
}

async function deleteItem(type, id) {
  try {
    const response = await fetch(`/api/${type}s/${id}`, { method: 'DELETE' });
    
    if (response.ok) {
      showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} excluído com sucesso`, 'success');
      if (currentPage === 'dashboard') loadDashboard();
      else if (type === 'ticket') loadTickets();
      else loadItems(type);
    } else {
      const data = await response.json();
      showNotification(data.error || `Erro ao excluir ${type}`, 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    showNotification('Erro ao conectar com o servidor', 'danger');
  }
}

// Formatação
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const formatStatus = (status) => ({
  aberto: 'Aberto',
  em_andamento: 'Em Andamento',
  pendente: 'Pendente',
  resolvido: 'Resolvido',
  fechado: 'Fechado'
}[status] || status);

const formatPriority = (priority) => ({
  baixa: 'Baixa',
  normal: 'Normal',
  alta: 'Alta',
  urgente: 'Urgente'
}[priority] || priority);

// Notificações
function showNotification(message, type = 'info') {
  const toast = document.getElementById('notification-toast');
  toast.className = `toast text-bg-${type}`;
  document.getElementById('toast-message').textContent = message;
  new bootstrap.Toast(toast).show();
}

// Visibilidade
function showLoginArea() {
  DOM.loginArea.style.display = 'block';
  DOM.mainArea.style.display = 'none';
}

function showMainArea() {
  DOM.loginArea.style.display = 'none';
  DOM.mainArea.style.display = 'block';
  
  if (currentUser?.username) {
    DOM.usernameDisplay.textContent = currentUser.username;
  }
  
  updateAdminElementsVisibility();
  
  document.querySelectorAll('.page-content').forEach(page => {
    page.style.display = page.id === 'dashboard-page' ? 'block' : 'none';
  });
}

function updateAdminElementsVisibility() {
  DOM.adminElements.forEach(el => el.classList.toggle('d-none', !isAdmin));
}

// Perfil (simplificado)
function openProfileModal() {
  if (!currentUser) return;
  
  const modal = new bootstrap.Modal(document.getElementById('profileModal'));
  const form = document.getElementById('profile-form');
  
  form.reset();
  document.getElementById('profile-username').value = currentUser.username;
  document.getElementById('profile-email').value = currentUser.email;
  
  modal.show();
}

function validatePasswordMatch() {
  const password = document.getElementById('profile-password').value;
  const confirm = document.getElementById('profile-confirm-password').value;
  const match = password === confirm || (!password && !confirm);
  
  document.getElementById('password-match-error').style.display = match ? 'none' : 'block';
  document.getElementById('save-profile-btn').disabled = !match;
}

async function saveProfile() {
  const formData = new FormData(document.getElementById('profile-form'));
  const body = Object.fromEntries(formData.entries());
  
  try {
    const response = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
      showNotification('Perfil atualizado com sucesso', 'success');
      fetchCurrentUser();
    } else {
      const data = await response.json();
      showNotification(data.error || 'Erro ao atualizar perfil', 'danger');
    }
  } catch (error) {
    console.error('Erro:', error);
    showNotification('Erro ao conectar com o servidor', 'danger');
  }
}