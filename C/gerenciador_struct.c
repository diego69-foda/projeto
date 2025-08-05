#include <stdio.h>
#include <string.h>

#define MAX_TAREFAS 100

typedef struct {
    int id;
    char descricao[100];
    int prioridade; // 1 a 5
    int concluida;  // 0 = não, 1 = sim
} Tarefa;

// Vetor global
Tarefa tarefas[MAX_TAREFAS];

// Protótipos
void adicionarTarefa();
void listarTarefas();
void marcarComoConcluida();
void removerTarefa();
void editarTarefa();
void filtrarPorPrioridade();
void filtrarPorStatus();
int contarEspacosLivres();
int buscarTarefaPorId(int id);

int main() {
    // Inicialização
    for (int i = 0; i < MAX_TAREFAS; i++) {
        tarefas[i].id = -1; // Marca como livre
    }

    int opcao;
    do {
        printf("\n--- MENU ---\n");
        printf("Espaços livres: %d\n", contarEspacosLivres());
        printf("1. Adicionar tarefa\n2. Listar tarefas\n3. Marcar como concluída\n4. Remover tarefa\n");
        printf("5. Editar tarefa\n6. Filtrar por prioridade\n7. Filtrar por status\n8. Sair\n");
        printf("Escolha: ");
        scanf("%d", &opcao);

        switch (opcao) {
            case 1: adicionarTarefa(); break;
            case 2: listarTarefas(); break;
            case 3: marcarComoConcluida(); break;
            case 4: removerTarefa(); break;
            case 5: editarTarefa(); break;
            case 6: filtrarPorPrioridade(); break;
            case 7: filtrarPorStatus(); break;
        }
    } while (opcao != 8);

    return 0;
}