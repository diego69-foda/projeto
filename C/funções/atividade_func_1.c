/*  Crie  um  programa  em  C  que  contenha  uma  função  chamada  dobro.  Essa  função  deve 
receber  um  número  inteiro  como  parâmetro  e  retornar  o  seu  dobro.  No  main,  leia  um 
número fornecido pelo usuário, chame a função e exiba o resultado na tela.*/
#include <stdio.h>
#include "func.h"
int main(){
    int a = 0; 
 scanf("%d", &a);
 printf("O dobro de %d é %d\n", a, dobro(a));
}
