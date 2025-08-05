/* Crie um programa em que exista uma variável inteira e dois ponteiros apontando para 
essa mesma variável. Faça a leitura de um valor inteiro inserido pelo usuário utilizando 
o primeiro ponteiro.  
Em  seguida,  utilize  o  segundo  ponteiro  para  acrescentar  uma  unidade  ao  valor 
armazenado por este ponteiro. 
Ao final, exiba na tela o valor apontado por cada um dos dois ponteiros.  
Após  a  execução,  explique  o  que  aconteceu  logicamente  no  programa  e  por  que  os 
dois  ponteiros  exibem  o  mesmo  valor,  mesmo  tendo  sido  usados  em  momentos 
distintos.
*/
#include <stdio.h>
#include <stdlib.h>

int main() {
    int valor, *p1, *p2;

    // Alocando memória para os ponteiros
    p1 = (int *)malloc(sizeof(int));
    p2 = (int *)malloc(sizeof(int));

    // Lendo o valor usando o primeiro ponteiro
    printf("Digite um valor inteiro: ");
    scanf("%d", p1);

    // Incrementando o valor usando o segundo ponteiro
    *p2 = *p1 + 1;

    // Exibindo os valores apontados pelos ponteiros
    printf("Valor apontado por p1: %d\n", *p1);
    printf("Valor apontado por p2: %d\n", *p2);

    // Liberando a memória alocada
    free(p1);
    free(p2);

    return 0;
}