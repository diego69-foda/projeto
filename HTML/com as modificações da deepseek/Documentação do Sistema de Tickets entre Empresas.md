# Documentação do Sistema de Tickets entre Empresas

## Visão Geral

Este sistema permite que usuários criem e gerenciem tickets de serviços entre empresas, com diferentes níveis de permissão e funcionalidades específicas para administradores e usuários comuns.

## Acesso ao Sistema

- **URL de Acesso**: [https://5000-imnhxy41vjgrbqws3ffhf-417ec936.manusvm.computer](https://5000-imnhxy41vjgrbqws3ffhf-417ec936.manusvm.computer)
- **Observação**: Esta URL é temporária para fins de demonstração.

## Funcionalidades Principais

### 1. Autenticação e Autorização
- Registro de novos usuários
- Login com email e senha
- Diferentes níveis de acesso: administrador e usuário comum
- Vinculação de usuários a empresas específicas

### 2. Gestão de Tickets
- Criação de tickets entre empresas
- Definição de título, descrição, serviço relacionado e prioridade
- Acompanhamento por status: aberto, em andamento, pendente, resolvido, fechado
- Sistema de comentários em tickets
- Filtros por status, prioridade, empresa e serviço

### 3. Gerenciamento de Serviços
- Cadastro e edição de serviços disponíveis
- Categorização de serviços
- Definição de SLAs (acordos de nível de serviço)
- Estatísticas de uso por serviço

### 4. Administração do Sistema
- Painel administrativo para gestão de usuários
- Criação e gerenciamento de empresas
- Atribuição e revogação de permissões de administrador
- Relatórios e estatísticas de uso

## Guia de Uso

### Primeiro Acesso

1. Acesse a URL do sistema
2. Na tela inicial, clique na aba "Registrar"
3. Preencha os dados solicitados (nome de usuário, email, senha)
4. Selecione uma empresa (se disponível)
5. Clique em "Registrar"
6. Faça login com as credenciais cadastradas

### Criação de Tickets

1. No menu principal, clique em "Tickets"
2. Clique no botão "Novo Ticket"
3. Preencha os campos obrigatórios:
   - Título
   - Descrição
   - Empresa de origem
   - Empresa de destino
   - Serviço
   - Prioridade
4. Opcionalmente, defina uma data limite
5. Clique em "Salvar"

### Acompanhamento de Tickets

1. No menu principal, clique em "Tickets"
2. Utilize os filtros disponíveis para encontrar tickets específicos
3. Clique no ícone de visualização para abrir os detalhes do ticket
4. Adicione comentários ou altere o status conforme necessário

### Gerenciamento de Serviços (Administradores)

1. No menu principal, clique em "Serviços"
2. Para adicionar um novo serviço, clique em "Novo Serviço"
3. Preencha os campos:
   - Nome
   - Descrição
   - Categoria
   - SLA (horas)
4. Clique em "Salvar"

### Gerenciamento de Usuários e Empresas (Administradores)

1. No menu principal, clique em "Usuários" ou "Empresas"
2. Para adicionar, clique no botão correspondente
3. Preencha os campos solicitados
4. Para editar ou excluir, utilize os ícones nas linhas da tabela

## Níveis de Acesso

### Usuário Comum
- Visualizar dashboard
- Criar e acompanhar tickets
- Adicionar comentários
- Visualizar serviços disponíveis

### Administrador
- Todas as permissões de usuário comum
- Gerenciar usuários (criar, editar, excluir)
- Gerenciar empresas (criar, editar, excluir)
- Gerenciar serviços (criar, editar, excluir)
- Atribuir permissões de administrador

## Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 5
- **Banco de Dados**: MySQL
- **Autenticação**: Flask-Login
- **ORM**: SQLAlchemy

## Suporte e Contato

Para suporte ou dúvidas sobre o sistema, entre em contato com o administrador do sistema.

---

© 2025 Sistema de Tickets entre Empresas
