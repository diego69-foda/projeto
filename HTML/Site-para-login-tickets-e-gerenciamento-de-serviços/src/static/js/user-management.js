/**
 * =================================================================================
 * user-management.js
 * ---------------------------------------------------------------------------------
 * Este arquivo combina as funcionalidades de gerenciamento de perfil de usuário
 * (para o próprio usuário) e gerenciamento de usuários por administradores.
 *
 * Arquivos originais: profile.js, admin-profile.js
 * =================================================================================
 */

// ---------------------------------------------------------------------------------
// SEÇÃO 1: FUNÇÕES GLOBAIS E DE APOIO (ASSUMIDAS)
// ---------------------------------------------------------------------------------
// Estas são funções que os scripts originais parecem usar, mas não definiram.
// Adicionei implementações de exemplo.
// ---------------------------------------------------------------------------------

/**
 * Exibe uma notificação para o usuário.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo de notificação ('success', 'danger', 'warning', etc.).
 */
function showNotification(message, type = 'info') {
    console.log(`[Notification - ${type.toUpperCase()}]: ${message}`);
    // Em um aplicativo real, você substituiria isso por uma biblioteca de toast/notificação.
    // Ex: alert(message); ou usar uma biblioteca como Toastify.js
    const notificationArea = document.getElementById('notification-area');
    if (notificationArea) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        notificationArea.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

/**
 * Formata uma string de data para um formato legível.
 * @param {string} dateString - A data no formato ISO (ex: '2024-12-31T23:59:59Z').
 * @returns {string} - A data formatada (ex: '31/12/2024 20:59').
 */
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Carrega uma lista de empresas para um elemento <select> do formulário.
 * @param {string} selectElementId - O ID do elemento <select>.
 */
async function loadCompaniesForForm(selectElementId) {
    const companySelect = document.getElementById(selectElementId);
    if (!companySelect) return;
    
    // Implementação de exemplo. Substitua pela sua chamada de API real.
    try {
        // const response = await fetch('/api/companies');
        // const companies = await response.json();
        const companies = [
            { id: 1, name: 'Empresa Alpha' },
            { id: 2, name: 'Empresa Beta' },
            { id: 3, name: 'Empresa Gamma' },
        ]; // Dados de exemplo

        companySelect.innerHTML = '<option value="">Nenhuma</option>'; // Opção padrão
        companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            companySelect.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao carregar empresas:', error);
        showNotification('Não foi possível carregar a lista de empresas.', 'danger');
    }
}


// ---------------------------------------------------------------------------------
// SEÇÃO 2: GERENCIAMENTO DE PERFIL DO PRÓPRIO USUÁRIO
// ---------------------------------------------------------------------------------
// Funções para um usuário logado gerenciar seu próprio perfil.
// ---------------------------------------------------------------------------------

/**
 * Abre o modal de perfil com os dados do usuário logado.
 */
async function openProfileModal() {
    try {
        // Buscar dados atualizados do usuário logado
        const response = await fetch('/api/auth/me');

        if (response.ok) {
            const userData = await response.json();

            // Preencher o formulário com os dados do usuário
            document.getElementById('profile-id').value = userData.id;
            document.getElementById('profile-username').value = userData.username;
            document.getElementById('profile-email').value = userData.email;

            // Mostrar nome da empresa se disponível
            const companyField = document.getElementById('profile-company');
            if (companyField) {
                 companyField.value = userData.company ? userData.company : 'Nenhuma empresa vinculada';
            }
           
            // Limpar campos de senha
            document.getElementById('profile-password').value = '';
            document.getElementById('profile-confirm-password').value = '';

            // Remover feedback de validação de senha
            document.getElementById('profile-confirm-password').classList.remove('is-invalid');

            // Abrir o modal
            const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
            profileModal.show();
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Erro ao carregar dados do perfil', 'danger');
        }
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

/**
 * Valida se os campos de senha e confirmação de senha coincidem.
 * @returns {boolean} - True se as senhas coincidirem ou se estiverem vazios, false caso contrário.
 */
function validatePasswordMatch() {
    const password = document.getElementById('profile-password').value;
    const confirmPassword = document.getElementById('profile-confirm-password').value;
    const confirmPasswordInput = document.getElementById('profile-confirm-password');

    // Só validar se ambos os campos tiverem conteúdo
    if (password && confirmPassword) {
        if (password !== confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            return false;
        } else {
            confirmPasswordInput.classList.remove('is-invalid');
            return true;
        }
    } else {
        // Se um dos campos estiver vazio, não mostrar erro
        confirmPasswordInput.classList.remove('is-invalid');
        return true;
    }
}

/**
 * Salva as alterações feitas no perfil do usuário logado.
 */
async function saveProfile() {
    // Validar senhas se foram preenchidas
    const password = document.getElementById('profile-password').value;
    if (password && !validatePasswordMatch()) {
        showNotification('As senhas não coincidem', 'warning');
        return;
    }

    const userId = document.getElementById('profile-id').value;

    // Preparar dados para envio
    const userData = {
        username: document.getElementById('profile-username').value,
        email: document.getElementById('profile-email').value
    };

    // Adicionar senha apenas se foi preenchida
    if (password) {
        userData.password = password;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            
            // Atualizar nome de usuário exibido no menu (se houver)
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = updatedUser.username;
            }

            // Fechar o modal
            bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();

            showNotification('Perfil atualizado com sucesso!', 'success');
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Erro ao atualizar perfil', 'danger');
        }
    } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}


// ---------------------------------------------------------------------------------
// SEÇÃO 3: GERENCIAMENTO DE USUÁRIOS POR ADMINISTRADORES
// ---------------------------------------------------------------------------------
// Funções para administradores gerenciarem todos os usuários do sistema.
// ---------------------------------------------------------------------------------

/**
 * Abre o modal de edição de usuário com os dados de um usuário específico.
 * @param {number|string} userId - O ID do usuário a ser editado.
 */
async function openUserEditorModal(userId) {
    try {
        // Buscar dados do usuário pelo ID
        const response = await fetch(`/api/users/${userId}`);

        if (response.ok) {
            const userData = await response.json();

            // Preencher o formulário com os dados do usuário
            document.getElementById('user-id').value = userData.id;
            document.getElementById('user-username').value = userData.username;
            document.getElementById('user-email').value = userData.email;
            document.getElementById('user-admin').checked = userData.is_admin;

            // Carregar e selecionar a empresa do usuário
            await loadCompaniesForForm('user-company');
            document.getElementById('user-company').value = userData.company_id || '';
            
            // Limpar campo de senha
            document.getElementById('user-password').value = '';

            // Atualizar título do modal
            document.getElementById('userModalLabel').textContent = 'Editar Usuário';

            // Abrir o modal
            const userModal = new bootstrap.Modal(document.getElementById('userModal'));
            userModal.show();
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Erro ao carregar dados do usuário', 'danger');
        }
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

/**
 * Salva um usuário (cria um novo ou atualiza um existente).
 * Função usada pelo administrador.
 */
async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const isNewUser = !userId;

    // Validação básica
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;

    if (!username || !username.trim()) {
        showNotification('Nome de usuário é obrigatório.', 'warning');
        return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
        showNotification('Email inválido.', 'warning');
        return;
    }

    // Preparar dados para envio
    const userData = {
        username: username,
        email: email,
        is_admin: document.getElementById('user-admin').checked,
        company_id: document.getElementById('user-company').value || null
    };

    const password = document.getElementById('user-password').value;
    if (password || isNewUser) {
        if (isNewUser && !password) {
            showNotification('Senha é obrigatória para novos usuários.', 'warning');
            return;
        }
        userData.password = password;
    }

    try {
        const url = isNewUser ? '/api/users' : `/api/users/${userId}`;
        const method = isNewUser ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            loadUsers(); // Recarrega a lista de usuários
            showNotification(
                isNewUser ? 'Usuário criado com sucesso!' : 'Usuário atualizado com sucesso!',
                'success'
            );
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao salvar usuário', 'danger');
        }
    } catch (error) {
        console.error('Erro ao salvar usuário:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

/**
 * Exibe uma confirmação antes de excluir um usuário.
 * @param {number|string} userId - O ID do usuário a ser excluído.
 * @param {string} username - O nome do usuário.
 */
function confirmDeleteUser(userId, username) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
        deleteUser(userId);
    }
}

/**
 * Exclui um usuário do sistema.
 * @param {number|string} userId - O ID do usuário a ser excluído.
 */
async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadUsers(); // Recarrega a lista de usuários
            showNotification('Usuário excluído com sucesso.', 'success');
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao excluir usuário', 'danger');
        }
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

/**
 * Carrega e exibe a lista de todos os usuários na tabela de administração.
 */
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Falha ao buscar usuários');
        
        const users = await response.json();
        const usersTableBody = document.getElementById('users-table-body');
        
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = ''; // Limpa a tabela antes de preencher

        // Assumindo que existe uma variável global 'currentUser.id' para comparar
        const currentUserId = window.currentUser ? window.currentUser.id : null;

        users.forEach(user => {
            const row = document.createElement('tr');
            
            if (user.id === currentUserId) {
                row.classList.add('table-primary'); // Destaca o admin logado
            }

            const deleteButtonHtml = user.id !== currentUserId ? `
                <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}" data-username="${user.username}" title="Excluir usuário">
                    <i class="bi bi-trash"></i>
                </button>
            ` : '';

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.company || '-'}</td>
                <td>${user.is_admin ? '<span class="badge bg-primary">Sim</span>' : 'Não'}</td>
                <td>${formatDate(user.last_login) || 'Nunca'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}" title="Editar usuário">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${deleteButtonHtml}
                </td>
            `;
            usersTableBody.appendChild(row);
        });

        // Adiciona os event listeners novamente aos botões criados
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                openUserEditorModal(userId);
            });
        });

        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const username = e.currentTarget.getAttribute('data-username');
                confirmDeleteUser(userId, username);
            });
        });

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar a lista de usuários.', 'danger');
    }
}
