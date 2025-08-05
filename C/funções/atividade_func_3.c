/*Verifica se um número é par, usando uma função isPar que retorna 1 se o número for par*/
#include <stdio.h>
#include "func.h"

int main () {
    int a;
    scanf("%d", &a);
    if( verificapar(a)== 1)
    {
        printf("O número %d é par.\n", a);
    }
    else
    {
        printf("O número %d é ímpar.\n", a);
    }
}