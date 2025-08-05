# Requisitos do Sistema de Tickets entre Empresas

## Visão Geral
Este sistema permitirá que usuários criem tickets de serviços entre empresas A e B, com gerenciamento de serviços e diferentes níveis de permissão de usuários.

## Requisitos Funcionais

### 1. Autenticação e Autorização
- Registro de novos usuários com informações básicas (nome, email, senha)
- Login de usuários com email e senha
- Recuperação de senha via email
- Diferentes níveis de acesso: administrador e usuário comum
- Vinculação de usuários a empresas específicas (A ou B)

### 2. Gestão de Tickets
- Criação de tickets de serviço da empresa A para empresa B
- Campos obrigatórios: título, descrição, serviço relacionado, prioridade
- Campos opcionais: anexos, data limite
- Status de tickets: aberto, em andamento, pendente, resolvido, fechado
- Histórico de alterações em cada ticket
- Comentários em tickets
- Notificações sobre atualizações de tickets

### 3. Gerenciamento de Serviços
- Cadastro de novos serviços disponíveis
- Edição e exclusão de serviços existentes
- Categorização de serviços
- Definição de SLAs (acordos de nível de serviço) por tipo de serviço
- Relatórios de desempenho por serviço

### 4. Administração do Sistema
- Painel administrativo para gestão de usuários
- Atribuição e revogação de permissões de administrador
- Visualização de logs e atividades do sistema
- Configurações gerais do sistema
- Relatórios e estatísticas de uso

## Requisitos Não Funcionais

### 1. Segurança
- Senhas armazenadas com criptografia
- Proteção contra ataques comuns (SQL Injection, XSS, CSRF)
- Autenticação em duas etapas (opcional)
- Sessões com tempo de expiração

### 2. Usabilidade
- Interface responsiva (desktop e mobile)
- Tempo de resposta rápido (< 2 segundos)
- Design intuitivo e amigável
- Feedback visual para ações do usuário

### 3. Desempenho
- Suporte a múltiplos usuários simultâneos
- Tempo de carregamento de página < 3 segundos
- Otimização de consultas ao banco de dados

### 4. Escalabilidade
- Arquitetura que permita crescimento futuro
- Modularização do código para facilitar manutenção

## Tecnologias Escolhidas
- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript (com Bootstrap para responsividade)
- **Banco de Dados**: MySQL
- **Autenticação**: Flask-Login
- **ORM**: SQLAlchemy
