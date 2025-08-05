/*Função que retorna o quadrado de um número usando a função dobro já criada acima*/
#include <stdio.h>
#include "func.h"

int main() {
    int a = 0;
    scanf("%d", &a);
    printf("O quadrado de %d é %d\n", a, quadrado(a));
    return 0;
}