/**
 * api.js
 * Módulo para centralizar todas as chamadas de API (fetch).
 * Lida com headers, autenticação e tratamento de erros padrão.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            // Não autorizado, redirecionar para login
            window.location.href = '/'; 
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            // Lança um erro com a mensagem do servidor para ser pego no 'catch'
            return Promise.reject(data);
        }

        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        // Retorna a promessa rejeitada para que o chamador possa lidar com o erro
        return Promise.reject(error.error || 'Erro de conexão com o servidor.');
    }
}

// Funções de API exportadas
const api = {
    // Auth
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getCurrentUser: () => request('/auth/me'),

    // Tickets
    getTickets: (filters = '') => request(`/tickets?${filters}`),
    getTicket: (id) => request(`/tickets/${id}`),
    createTicket: (data) => request('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    updateTicket: (id, data) => request(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    // ... e assim por diante para cada endpoint (services, users, companies, stats, etc.)
};