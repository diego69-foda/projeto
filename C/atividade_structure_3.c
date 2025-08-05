#include <stdio.h>
#include <stdlib.h> // Para malloc
#include <string.h>

// Definição da estrutura do nodo da lista encadeada
typedef struct Pessoa
{
    char nome[50];
    int id;
    int idade;
    struct Pessoa *proximo; // Ponteiro para o próximo nodo na lista
} Pessoa;

// Ponteiros globais para o início e fim da lista
Pessoa *primeiro = NULL;
Pessoa *ultimo = NULL;

// Prototipação das funções
void adicionarpessoa();
void listagem();
void liberarlista();

int main() {
    // Adicionando pessoas à lista
    adicionarPessoa("João Silva", 1, 22);
    adicionarPessoa("Maria Souza", 2, 30);
    adicionarPessoa("Pedro Santos", 3, 25);
    adicionarPessoa("Ana Costa", 4, 28);

    // Listando as pessoas na lista
    listagem();

    // Adicionando mais uma pessoa para demonstrar o crescimento da lista
    adicionarPessoa("Carlos Oliveira", 5, 35);
    printf("\n--- Após adicionar mais uma pessoa ---\n");
    listagem();

    // Liberando a memória alocada
    liberarLista();
    printf("\nMemória da lista liberada.\n");
    listagem(); // Tentando listar após liberar deve mostrar que está vazia

    return 0;
}
// Função para adicionar uma nova pessoa à lista
void adicionarPessoa(const char *nome, int id, int idade) {
    Pessoa *novaPessoa = (Pessoa *) malloc(sizeof(Pessoa));
    if (novaPessoa == NULL) {
        printf("Erro ao alocar memória para nova pessoa.\n");
        return;
    }

    strcpy(novaPessoa->nome, nome);
    novaPessoa->id = id;
    novaPessoa->idade = idade;
    novaPessoa->proximo = NULL; // O novo nodo sempre aponta para NULL inicialmente

    if (primeiro == NULL) { // Se a lista estiver vazia
        primeiro = novaPessoa;
        ultimo = novaPessoa;
    } else { // Se a lista já contiver elementos
        ultimo->proximo = novaPessoa; // O último elemento existente aponta para o novo
        ultimo = novaPessoa;         // O novo elemento se torna o último da lista
    }
}

// Função para listar os elementos da lista encadeada
void listagem() {
    Pessoa *atual = primeiro; // Começa pelo primeiro elemento da lista
    if (atual == NULL) {
        printf("A lista de pessoas está vazia.\n");
        return;
    }

    printf("--- Listagem de Pessoas ---\n");
    while (atual != NULL) { // Percorre a lista até o final (NULL)
        printf("ID: %d, Nome: %s, Idade: %d\n", atual->id, atual->nome, atual->idade);
        atual = atual->proximo; // Avança para o próximo nodo
    }
    printf("--------------------------\n");
}

// Função para liberar a memória alocada pela lista
void liberarLista() {
    Pessoa *atual = primeiro;
    Pessoa *proximo;
    while (atual != NULL) {
        proximo = atual->proximo;
        free(atual);
        atual = proximo;
    }
    primeiro = NULL;
    ultimo = NULL;
}
