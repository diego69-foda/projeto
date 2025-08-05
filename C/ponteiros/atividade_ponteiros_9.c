/*Crie duas variáveis inteiras a e b, e dois ponteiros que apontam para essas variáveis, 
respectivamente.  
Depois, faça com que ambos os ponteiros apontem para a mesma variável (a). Mostre 
na tela: Os valores de a e b. Os endereços armazenados nos dois ponteiros. Os valores 
apontados por cada ponteiro antes e depois da alteração.  
Em seguida, usando um dos ponteiros, altere o valor de a. Mostre novamente o valor 
apontado pelos dois ponteiros.  
Reflita sobre o comportamento dos ponteiros que apontam para a mesma região de 
memória, e a diferença entre alterar o endereço armazenado em um ponteiro versus 
alterar o conteúdo do endereço apontado.*/
#include <stdio.h>
#include <stdlib.h>

int main() {
    int a = 0,b = 0,*p1 = &a,*p2 = &b;
    a = 10;
    b = 20;
    p2= &a;
    printf("Valores iniciais:\n");
    printf("a = %d, b = %d\n", a, b);
    printf("Endereços:\n");
    printf("Endereço de p1: %p\n", (void*)p1);
    printf("Endereço de p2: %p\n", (void*)p2);
    printf("Valores apontados por p1: %d\n", *p1);
    printf("Valores apontados por p2: %d\n", *p2);
    *p1 = 30; // Alterando o valor de a através do ponteiro p1
    printf("Valores após alteração:\n");
    printf("Valor apontado por p1: %d\n", *p1);
    printf("Valor apontado por p2: %d\n", *p2);
return 0;
}