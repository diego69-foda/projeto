// Funções para gerenciamento de perfil de usuário
async function openProfileModal() {
    try {
        // Buscar dados atualizados do usuário
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
            const userData = await response.json();
            
            // Preencher o formulário com os dados do usuário
            document.getElementById('profile-id').value = userData.id;
            document.getElementById('profile-username').value = userData.username;
            document.getElementById('profile-email').value = userData.email;
            
            // Mostrar nome da empresa se disponível
            if (userData.company) {
                document.getElementById('profile-company').value = userData.company;
            } else {
                document.getElementById('profile-company').value = 'Nenhuma empresa vinculada';
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
            
            // Atualizar dados do usuário na sessão
            currentUser = updatedUser;
            
            // Atualizar nome de usuário exibido no menu
            document.getElementById('username-display').textContent = updatedUser.username;
            
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
