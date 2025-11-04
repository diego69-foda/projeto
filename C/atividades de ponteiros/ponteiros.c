// função de mostrar valores de um "pilha" usando ponteiros
#include <stdio.h>
#include <stdlib.h>
#include "ponteiros.h"

static void stackTester(stack_t *pilha){
    
    int valor;
    
    inicializar(pilha);
	if (!push(pilha, 5)) {
	    printf("Elemento não inserido, falha!");
	}
	
	push(pilha, 15);
	push(pilha, 25);
	mostrar(pilha);

	if (!pop(pilha, &valor)){
	   printf("Elemento não retirado, falha!"); 
	}

	printf("Removido: %d\n", valor);
	mostrar(pilha);
	pop(pilha, &valor);
	mostrar(pilha);
    
}

int main() {
	stack_t pilhaNaStack, *pilhaNaHeap;
	
	stackTester (&pilhaNaStack);

	if (!criarPilha(&pilhaNaHeap)) { //devido **
	    printf ("Problemas na criação da pilha");
	} 
	else {
	    stackTester (pilhaNaHeap);
	}
	
	return 0;
}

