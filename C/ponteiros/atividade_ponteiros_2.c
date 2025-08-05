/*Declare uma variável inteira x e um ponteiro para x. Use o ponteiro para modificar o 
valor  de  x  para  o  dobro  do  valor  inicial.  Mostre  o  valor  de  x  antes  e  depois  destas 
operações;*/

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main() {
    int x;
    int *p = &x;

    printf("Digite um valor inteiro: ");
    scanf("%d", p);
    printf("Valor de x antes: %d\n", x);
    *p = x * 2;
    printf("Valor de x depois: %d\n", x);
}