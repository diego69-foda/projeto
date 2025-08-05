/*Declare  três  variáveis  inteiras:  a,  b  e  soma.  Atribua  valores  para  a  e  b.  Em  seguida, 
usando dois ponteiros, calcule a soma de a e b, armazene em soma e exiba o resultado;*/

#include <stdio.h>
#include <stdlib.h>

int main () {

    int a = 5,b = 6,soma, *p1 = &a, *p2 = &b;

    soma = *p1 + *p2;

    printf("A soma de %d e %d eh: %d\n", *p1, *p2, soma);
    
    return 0;
}