/* Faça uma estrutura que represente um endereço: rua, número, complemento, bairro, cidade, 
estado e cep. Cada informação será um elemento da estrutura Endereço. Faça um programa 
que receba e apresente os dados de um endereço. Para evitar problemas com a leitura de 
strings incompletas, use a função fgets (variável, sizeof(type), stdin). */

#include <stdio.h>

typedef struct
{
        char rua[50];
        int numero;
        char complemento[20];
        char bairro[30];
        char cidade[30];
        char estado[3];
        char cep[10];
} endereco;
int main(){
    endereco e;

    printf("Rua: ");
    fgets(e.rua, sizeof(e.rua), stdin);

    printf("Numero: ");
    scanf("%d", &e.numero);
    getchar(); // consume newline left by scanf

    printf("Complemento: ");
    fgets(e.complemento, sizeof(e.complemento), stdin);

    printf("Bairro: ");
    fgets(e.bairro, sizeof(e.bairro), stdin);

    printf("Cidade: ");
    fgets(e.cidade, sizeof(e.cidade), stdin);

    printf("Estado: ");
    fgets(e.estado, sizeof(e.estado), stdin);

    printf("CEP: ");
    fgets(e.cep, sizeof(e.cep), stdin);

    printf("\nEndereco completo:\n");
    printf("Rua: %s", e.rua);
    printf("Numero: %d\n", e.numero);
    printf("Complemento: %s", e.complemento);
    printf("Bairro: %s", e.bairro);
    printf("Cidade: %s", e.cidade);
    printf("Estado: %s", e.estado);
    printf("CEP: %s", e.cep);

    return 0;
}