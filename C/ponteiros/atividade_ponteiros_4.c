/*Usando  dois  inteiros  m  e  n  e  dois  ponteiros  que  cada  um  aponte  para  uma  das 
variáveis, troque os valores das variáveis utilizando apenas ponteiros;*/
#include <stdio.h>


int main() {
    int m = 10,n = 5,*p1, *p2 = &n;
    p1 = malloc(sizeof(int));
    *p1 = m;
    m = *p2;
    *p2 = *p1;
    printf("Valor de m: %d\n", m);
    printf("Valor de n: %d\n", *p2);
    
    return 0;

}