// Funções para gerenciamento de perfil de usuários por administradores

// Abrir modal de edição de usuário com dados carregados
async function openUserProfileModal(userId) {
    try {
        // Buscar dados do usuário
        const response = await fetch(`/api/users/${userId}`);
        
        if (response.ok) {
            const userData = await response.json();
            
            // Preencher o formulário com os dados do usuário
            document.getElementById('user-id').value = userData.id;
            document.getElementById('user-username').value = userData.username;
            document.getElementById('user-email').value = userData.email;
            document.getElementById('user-admin').checked = userData.is_admin;
            
            // Carregar empresas para o select
            await loadCompaniesForForm('user-company');
            
            // Selecionar a empresa do usuário se existir
            if (userData.company_id) {
                const companySelect = document.getElementById('user-company');
                for (let i = 0; i < companySelect.options.length; i++) {
                    if (companySelect.options[i].value == userData.company_id) {
                        companySelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
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

// Melhorar a função saveUser existente para incluir mais feedback e validação
async function saveUser() {
    const userId = document.getElementById('user-id').value;
    const isNewUser = !userId;
    
    // Validar campos obrigatórios
    const username = document.getElementById('user-username').value;
    const email = document.getElementById('user-email').value;
    
    if (!username || !username.trim()) {
        showNotification('Nome de usuário é obrigatório', 'warning');
        return;
    }
    
    if (!email || !email.trim() || !email.includes('@')) {
        showNotification('Email inválido', 'warning');
        return;
    }
    
    // Preparar dados para envio
    const userData = {
        username: username,
        email: email,
        is_admin: document.getElementById('user-admin').checked,
        company_id: document.getElementById('user-company').value || null
    };
    
    // Adicionar senha apenas se fornecida ou se for novo usuário
    const password = document.getElementById('user-password').value;
    if (password || isNewUser) {
        if (isNewUser && !password) {
            showNotification('Senha é obrigatória para novos usuários', 'warning');
            return;
        }
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
            const data = await response.json();
            
            // Fechar o modal
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            
            // Recarregar lista de usuários
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

// Função para confirmar exclusão de usuário
function confirmDeleteUser(userId, username) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
        deleteUser(userId);
    }
}

// Função para excluir usuário
async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Recarregar lista de usuários
            loadUsers();
            showNotification('Usuário excluído com sucesso', 'success');
        } else {
            const data = await response.json();
            showNotification(data.error || 'Erro ao excluir usuário', 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao conectar com o servidor', 'danger');
    }
}

// Melhorar a função loadUsers existente para incluir mais informações e ações
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
            
            // Destacar o usuário atual
            if (user.id === currentUser.id) {
                row.classList.add('table-primary');
            }
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.company || '-'}</td>
                <td>${user.is_admin ? '<span class="badge bg-primary">Sim</span>' : 'Não'}</td>
                <td>${user.last_login ? formatDate(user.last_login) : 'Nunca'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-id="${user.id}" title="Editar usuário">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${user.id !== currentUser.id ? `
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}" data-username="${user.username}" title="Excluir usuário">
                        <i class="bi bi-trash"></i>
                    </button>
                    ` : ''}
                </td>
            `;
            usersTable.appendChild(row);
        });
        
        // Adicionar event listeners
        document.querySelectorAll('.edit-user').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                openUserProfileModal(userId);
            });
        });
        
        document.querySelectorAll('.delete-user').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                const username = button.getAttribute('data-username');
                confirmDeleteUser(userId, username);
            });
        });
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showNotification('Erro ao carregar usuários', 'danger');
    }
}
