/*  Crie duas variáveis inteiras a e b, e dois ponteiros que apontam para essas variáveis, 
respectivamente. 
Depois, faça com que ambos os ponteiros apontem para a mesma variável (a). 
Mostre na tela: Os valores de a e b. Os endereços armazenados nos dois ponteiros. Os 
valores apontados por cada ponteiro antes e depois da alteração. 
Em seguida, usando um dos ponteiros, altere o valor de a. Mostre novamente o valor 
apontado pelos dois ponteiros. 
Reflita sobre o comportamento dos ponteiros que apontam para a mesma região de 
memória, e a diferença entre alterar o endereço armazenado em um ponteiro versus 
alterar o conteúdo do endereço apontado. 
 */
#include <stdio.h>
#include <stdlib.h>

int main() {
    int a = 10, b = 20;
    int *p1 = &a, *p2 = &b;

    // Ambos os ponteiros apontam para a mesma variável (a)
    p2 = p1;

    printf("Valores iniciais:\n");
    printf("a: %d, b: %d\n", a, b);
    printf("Endereços armazenados:\n");
    printf("p1: %p, p2: %p\n", (void*)p1, (void*)p2);
    printf("Valores apontados por p1 e p2: %d, %d\n", *p1, *p2);

    // Alterando o valor de a usando p1
    *p1 = 30;

    printf("\nApós alterar o valor de a via p1:\n");
    printf("a: %d, b: %d\n", a, b);
    printf("Valores apontados por p1 e p2: %d, %d\n", *p1, *p2);

    return 0;
}