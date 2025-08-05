/*Crie  um  programa  em  C  que  receba  elementos  para  compor  um  vetor  de  5  elementos, 
preenchendo  o  mesmo  até  sua  capacidade  máxima,  mas  de  elementos  apenas  pares, 
utilizando a função isPar citada acima. Ignore os números que não pares para inserir no vetor. 
Importante, o vetor tem que estar completo de números lidos pares.*/

#include <stdio.h>
#include "func.h"

int main () {
    int a,vetor[5], i = 0;
    do{
     scanf("%d", &a);
    if( verificapar(a))
    {
       vetor[i] = a;
       i++;
    }
    else
    {
       continue;
    }
    } while(i<5);
    printf("Vetor preenchido com números pares:\n");
    for(int j = 0; j < 5; j++) {
        printf("%d ", vetor[j]);
    }
}