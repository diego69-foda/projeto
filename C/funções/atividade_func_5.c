/*  Calcular  a  média  de  3  valores  inteiros  alocados  em  um  arranjo  considerando  que  cada 
elemento par deve ser armazenado com o seu dobro. Caso não seja par, deve inserido como 
foi recebido. Informe ao final a média dos números armazenados no vetor.*/

#include <stdio.h>
#include "func.h"

int main(){
    int i = 0;
    double somador = 0.0, vetor[3], a, aux[3];
    for(i = 0; i<3; i++)
    {
        printf("Digite o %dº valor: ", i + 1);
        scanf(" %lf", &aux[i]);
        if (verificapar(aux[i])) {
            vetor[i] = dobro(aux[i]);
        } else {
            vetor[i] = aux[i]; 
        }
    }
    i = 0;
    while(i<3)
    {
        somador += vetor[i];
        i++;
    }

    a = tirarmedia(somador, i);
    printf("A média dos números armazenados no vetor é: ");
    printf("%lf",a);
    
    return 0;
}    