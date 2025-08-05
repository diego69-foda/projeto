#include <stdio.h>
#include "tarefa.h"

int main() {
    // Inicialização
    for (int i = 0; i < MAX_TAREFAS; i++) {
        tarefas[i].id = -1; // Marca como livre
    }

    int opcao;
    do {
        printf("\n--- GERENCIADOR DE TAREFAS ---\n");
        printf("Espaços livres: %d/%d\n", contarEspacosLivres(), MAX_TAREFAS);
        printf("1. Adicionar tarefa\n");                                        //adiciona tarefas
        printf("2. Listar todas as tarefas\n");                                 //mostra todas as tarefas
        printf("3. Marcar tarefa como concluída\n");                            //marca a tarefa como concluida
        printf("4. Remover tarefa\n");                                          //remove uma tarefa criada
        printf("5. Editar tarefa\n");                                           //edita uma tarefa criada
        printf("6. Filtrar por prioridade\n");                                  //mostra as tarefas de acordo com a prioridade
        printf("7. Filtrar por status\n");                                      //mostra as tarefas de acordo com os status
        printf("8. Sair\n");                                                    //para de gerenciar
        printf("Escolha uma opção: ");                                          //linha de escolha de opcões

        if (scanf("%d", &opcao) != 1) {
            printf("Opção inválida. Por favor, digite um número.\n");
            limparBufferEntrada();                                              // Limpa entrada inválida
            opcao = 0;                                                          // Reseta a opção para continuar o loop
            continue;                                                           // Volta ao início do loop
        }

        switch (opcao) {                                                        //resgata/coloca tarefas na biblioteca tarefa.h
            case 1: adicionarTarefa();
            case 2: listarTarefas(0, -1, -1); break;                            // Listar sem filtro
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