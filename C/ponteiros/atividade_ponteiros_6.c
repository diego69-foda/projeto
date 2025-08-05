/*  Crie três variáveis inteiras a = 3, b = 4 e c = 0. Crie dois ponteiros, um apontando para 
a e outro para b. Usando apenas os ponteiros e a variável c, calcule e armazene em c 
o valor de a * b + 1. Mostre o resultado ao final; */

#include <stdio.h>
#include <stdlib.h>

int main(){
int a = 3, b =4,c=0,*p1 = &a, *p2 = &b;
c = (*p1) * (*p2) + 1;
printf("O resultado de a * b + 1 é: %d\n", c);
return 0;

}