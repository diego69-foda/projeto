/*Faça um programa que contenha uma estrutura que representa uma Pessoa e cujos dados são 
nome e idade. Faça a entrada de dados de 5 pessoas, armazenando as informações em um 
arranjo de tipo estrutura. Leia os dados e ao final apresente o nome da pessoa de maior idade.*/

#include <stdio.h>
typedef struct
{
    char nome[50];
    int idade;
} Pessoa;
int main(){
 Pessoa pessoa[5],maisvelha;
 int i;

 for (i=0; i < 5; i++)
{
    printf("Digite o nome da pessoa %d: ", i + 1);
    fgets(pessoa[i].nome, sizeof(pessoa[i].nome), stdin);
    
    printf("Digite a idade da pessoa %d: ", i + 1);
    scanf("%d", &pessoa[i].idade);
    getchar(); // Limpa o buffer do teclado
}
maisvelha = pessoa[0];
for(i=0;i<5;i++)
{
    if(pessoa[i].idade > maisvelha.idade)
    {
        maisvelha = pessoa[i];
    }
    
}
printf("a pessoa mais velha é: %s com idade %d\n", maisvelha.nome, maisvelha.idade);
return 0;
}
