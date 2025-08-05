#include <stdio.h>
#include <string.h>
#include <stdlib.h> // Para limpar o buffer de entrada

#define MAX_TAREFAS 100

typedef struct {
    int id;
    char descricao[100];
    int prioridade; // 1 a 5
    int concluida;  // 0 = não, 1 = sim
} Tarefa;

// Vetor global
Tarefa tarefas[MAX_TAREFAS];
int proximo_id = 1; // Para gerar IDs únicos

// Protótipos
void adicionarTarefa();
void listarTarefas(int filtrar, int valor_filtro_prioridade, int valor_filtro_status);
void marcarComoConcluida();
void removerTarefa();
void editarTarefa();
void filtrarPorPrioridade();
void filtrarPorStatus();
int contarEspacosLivres();
int buscarIndiceTarefaPorId(int id);
void limparBufferEntrada();

int main() {
    // Inicialização
    for (int i = 0; i < MAX_TAREFAS; i++) {
        tarefas[i].id = -1; // Marca como livre
    }

    int opcao;
    do {
        printf("\n--- GERENCIADOR DE TAREFAS ---\n");
        printf("Espaços livres: %d/%d\n", contarEspacosLivres(), MAX_TAREFAS);
        printf("1. Adicionar tarefa\n");
        printf("2. Listar todas as tarefas\n");
        printf("3. Marcar tarefa como concluída\n");
        printf("4. Remover tarefa\n");
        printf("5. Editar tarefa\n");
        printf("6. Filtrar por prioridade\n");
        printf("7. Filtrar por status\n");
        printf("8. Sair\n");
        printf("Escolha uma opção: ");

        if (scanf("%d", &opcao) != 1) {
            printf("Opção inválida. Por favor, digite um número.\n");
            limparBufferEntrada(); // Limpa entrada inválida
            opcao = 0; // Reseta a opção para continuar o loop
            continue; // Volta ao início do loop
        }

        switch (opcao) {
            case 1: adicionarTarefa(); break;
            case 2: listarTarefas(0, -1, -1); break; // Listar sem filtro
            case 3: marcarComoConcluida(); break;
            case 4: removerTarefa(); break;
            case 5: editarTarefa(); break;
            case 6: filtrarPorPrioridade(); break;
            case 7: filtrarPorStatus(); break;
            case 8: printf("Saindo do programa.\n"); break;
            default: printf("Opção inválida!\n"); break;
        }
    } while (opcao != 8);

    return 0;
}


// Função para limpar o buffer de entrada (útil após scanf)
void limparBufferEntrada() {
    int c;
    while ((c = getchar()) != '\n' && c != EOF);
}

// Conta quantos espaços estão livres no array de tarefas
int contarEspacosLivres() {
    int contador = 0;
    for (int i = 0; i < MAX_TAREFAS; i++) {
        if (tarefas[i].id == -1) {
            contador++;
        }
    }
    return contador;
}

// Busca o índice de uma tarefa pelo ID
int buscarIndiceTarefaPorId(int id) {
    for (int i = 0; i < MAX_TAREFAS; i++) {
        if (tarefas[i].id == id) {
            return i; // Retorna o índice no vetor
        }
    }
    return -1; // Não encontrado
}

// Adiciona uma nova tarefa
void adicionarTarefa() {
    int indice_livre = -1;
    for (int i = 0; i < MAX_TAREFAS; i++) {
        if (tarefas[i].id == -1) {
            indice_livre = i;
            break;
        }
    }

    if (indice_livre == -1) {
        printf("Erro: Limite de tarefas atingido!\n");
        return;
    }

    tarefas[indice_livre].id = proximo_id++;

    printf("Digite a descrição da tarefa: ");
    limparBufferEntrada(); // Limpa o buffer antes de ler a string
    fgets(tarefas[indice_livre].descricao, 100, stdin);
    tarefas[indice_livre].descricao[strcspn(tarefas[indice_livre].descricao, "\n")] = 0; // Remove a nova linha

    printf("Digite a prioridade (1 a 5): ");
    while (scanf("%d", &tarefas[indice_livre].prioridade) != 1 || tarefas[indice_livre].prioridade < 1 || tarefas[indice_livre].prioridade > 5) {
        printf("Prioridade inválida. Digite um número entre 1 e 5: ");
        limparBufferEntrada();
    }

    tarefas[indice_livre].concluida = 0; // Nova tarefa começa como não concluída

    printf("Tarefa adicionada com sucesso! ID: %d\n", tarefas[indice_livre].id);
}

// Lista as tarefas (com opção de filtro)
// filtrar: 0 = sem filtro, 1 = por prioridade, 2 = por status
void listarTarefas(int filtrar, int valor_filtro_prioridade, int valor_filtro_status) {
    printf("\n--- LISTA DE TAREFAS ---\n");
    int encontrou = 0;
    for (int i = 0; i < MAX_TAREFAS; i++) {
        if (tarefas[i].id != -1) { // Se a tarefa existe
            int mostrar = 1;
            if (filtrar == 1 && tarefas[i].prioridade != valor_filtro_prioridade) {
                mostrar = 0;
            }
            if (filtrar == 2 && tarefas[i].concluida != valor_filtro_status) {
                mostrar = 0;
            }

            if (mostrar) {
                encontrou = 1;
                printf("ID: %d | Descrição: %s | Prioridade: %d | Concluída: %s\n",
                       tarefas[i].id,
                       tarefas[i].descricao,
                       tarefas[i].prioridade,
                       tarefas[i].concluida ? "Sim" : "Não");
            }
        }
    }
    if (!encontrou) {
        printf("Nenhuma tarefa encontrada" );
        if(filtrar == 1) printf(" com a prioridade %d.\n", valor_filtro_prioridade);
        else if (filtrar == 2) printf(" com o status %s.\n", valor_filtro_status ? "Concluída" : "Não Concluída");
        else printf(".\n");
    }
    printf("------------------------\n");
}

// Marca uma tarefa como concluída
void marcarComoConcluida() {
    int id_tarefa;
    printf("Digite o ID da tarefa a ser marcada como concluída: ");
    if (scanf("%d", &id_tarefa) != 1) {
         printf("Entrada inválida.\n");
         limparBufferEntrada();
         return;
    }

    int indice = buscarIndiceTarefaPorId(id_tarefa);
    if (indice != -1) {
        tarefas[indice].concluida = 1;
        printf("Tarefa %d marcada como concluída.\n", id_tarefa);
    } else {
        printf("Erro: Tarefa com ID %d não encontrada.\n", id_tarefa);
    }
}

// Remove uma tarefa
void removerTarefa() {
    int id_tarefa;
    printf("Digite o ID da tarefa a ser removida: ");
     if (scanf("%d", &id_tarefa) != 1) {
         printf("Entrada inválida.\n");
         limparBufferEntrada();
         return;
    }

    int indice = buscarIndiceTarefaPorId(id_tarefa);
    if (indice != -1) {
        tarefas[indice].id = -1; // Marca como livre (remoção lógica)
        printf("Tarefa %d removida com sucesso.\n", id_tarefa);
    } else {
        printf("Erro: Tarefa com ID %d não encontrada.\n", id_tarefa);
    }
}

// Edita uma tarefa existente
void editarTarefa() {
    int id_tarefa;
    printf("Digite o ID da tarefa a ser editada: ");
     if (scanf("%d", &id_tarefa) != 1) {
         printf("Entrada inválida.\n");
         limparBufferEntrada();
         return;
    }

    int indice = buscarIndiceTarefaPorId(id_tarefa);
    if (indice != -1) {
        printf("Editando Tarefa ID: %d (Descrição atual: %s, Prioridade atual: %d)\n",
               tarefas[indice].id, tarefas[indice].descricao, tarefas[indice].prioridade);

        printf("Digite a nova descrição (ou deixe em branco para manter): ");
        limparBufferEntrada();
        char nova_descricao[100];
        fgets(nova_descricao, 100, stdin);
        nova_descricao[strcspn(nova_descricao, "\n")] = 0;
        if (strlen(nova_descricao) > 0) {
            strcpy(tarefas[indice].descricao, nova_descricao);
        }

        printf("Digite a nova prioridade (1 a 5, ou 0 para manter): ");
        int nova_prioridade;
        while (scanf("%d", &nova_prioridade) != 1 || (nova_prioridade != 0 && (nova_prioridade < 1 || nova_prioridade > 5))) {
             printf("Prioridade inválida. Digite um número entre 1 e 5, ou 0 para manter: ");
             limparBufferEntrada();
        }
        if (nova_prioridade != 0) {
            tarefas[indice].prioridade = nova_prioridade;
        }

        printf("Tarefa %d editada com sucesso.\n", id_tarefa);

    } else {
        printf("Erro: Tarefa com ID %d não encontrada.\n", id_tarefa);
    }
}

// Filtra tarefas por prioridade
void filtrarPorPrioridade() {
    int prioridade_filtro;
    printf("Digite a prioridade para filtrar (1 a 5): ");
    while (scanf("%d", &prioridade_filtro) != 1 || prioridade_filtro < 1 || prioridade_filtro > 5) {
        printf("Prioridade inválida. Digite um número entre 1 e 5: ");
        limparBufferEntrada();
    }
    listarTarefas(1, prioridade_filtro, -1); // Chama listarTarefas com filtro de prioridade
}

// Filtra tarefas por status (concluída ou não)
void filtrarPorStatus() {
    int status_filtro;
    printf("Digite o status para filtrar (0 = Não Concluída, 1 = Concluída): ");
    while (scanf("%d", &status_filtro) != 1 || (status_filtro != 0 && status_filtro != 1)) {
        printf("Status inválido. Digite 0 ou 1: ");
        limparBufferEntrada();
    }
    listarTarefas(2, -1, status_filtro); // Chama listarTarefas com filtro de status
}
