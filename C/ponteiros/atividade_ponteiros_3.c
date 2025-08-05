/*Crie duas variáveis inteiras a e b, e um ponteiro para inteiro. Atribua valores para a e 
b, faça o ponteiro apontar para a, e depois para b. Mostre os valores apontados em 
cada caso; */
#include <stdio.h>

int main(){
    int a,b, *p = &a;
    printf("Digite o valor de a: ");
    scanf("%d", p);
    p = &b;
    printf("Digite o valor de b: ");
    scanf("%d", p);
    printf("Valor de a: %d\n", a);
    printf("Valor de b: %d\n", b);
}