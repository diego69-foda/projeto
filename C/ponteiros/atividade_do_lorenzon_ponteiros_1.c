/*Crie uma variável inteira a e um ponteiro que aponte para ela. Solicite ao usuário que
digite um valor e efetue a leitura deste valor usando o ponteiro. Mostre o conteúdo
da variável após a entrada também pelo ponteiro.
*/


#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

int main() 
{
    int a = 10;
    int *ptr = &a; // Ponteiro que aponta para a variável a
    printf("valor inicial do ponteiro é %d\n", a); // Mostra o valor inicial da variável a
    printf("Digite um valor inteiro: ");
    scanf("%d", ptr); // Leitura do valor usando o ponteiro
    printf("O valor digitado foi: %d\n", a); // Mostra o conteúdo da variável a
    return 0;
}