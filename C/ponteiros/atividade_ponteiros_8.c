/*  Crie  uma  variável  inteira  chamada  valor  e  um  ponteiro  p  que  aponta  para  ela.  Em 
seguida, declare um ponteiro para ponteiro, chamado pp, que aponta para p.  
Peça para o usuário digitar um valor e armazene esse valor usando o ponteiro duplo 
pp. Mostre na tela: O valor de valor acessado diretamente.  O valor de valor acessado 
via p. O valor de valor acessado via pp.  Interprete o que significa ter um ponteiro para 
ponteiro e como a modificação em um nível afeta os demais.*/
#include <stdio.h>
#include <stdlib.h>

int main() {
    int valor = 1,*p = &valor, **pp = &p;
    printf("Digite um valor: ");
    scanf("%d",*pp);
    printf("Valor acessado diretamente: %d\n", valor);
    printf("Valor acessado via p: %d\n", *p);
    printf("Valor acessado via pp: %d\n", **pp);
    return 0;
}