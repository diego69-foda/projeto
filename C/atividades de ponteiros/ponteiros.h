#include <stdio.h>

typedef struct nodo {
	int valor;
	struct nodo *prox;
} nodo_t;

typedef struct {
	nodo_t *topo;
} stack_t;

void	    inicializar  (stack_t *p);
int 		vazia        (stack_t *p);
int 		push         (stack_t *p, int valor); //retorno é 0-falha, 1-sucesso
int 		pop          (stack_t *p, int *valor);  //retorno é 0-falha, 1-sucesso
void 		mostrar      (stack_t *p);

int         criarPilha   (stack_t **ponteiroStack);	

void inicializar  (stack_t *p) {
    p->topo = NULL;
}

int vazia(stack_t *p) {
	return (p->topo == NULL);
}

int push(stack_t *p, int valor) {
	
nodo_t *novo = (nodo_t*) malloc(sizeof(nodo_t));
	
	//Guardian clause, fail fisrt
    if (novo == NULL) {
		printf("Erro: Falha na alocacao de memoria.\n");
		//Early return
		return 0;
	}
    //Happy Path
	novo->valor = valor;
	novo->prox = p->topo;
	p->topo = novo;
	printf("Inserido %d no topo.\n", p->topo->valor);
	return 1;
}


int pop(stack_t *p, int *valor) {
	if (vazia(p)) {
		printf("Erro: Underflow! Pilha vazia.\n");
		return 0;
	}
	nodo_t *temp = p->topo;
	*valor = temp->valor;
	p->topo = temp->prox;
	temp->prox = NULL;  //evitando o endereço morto
	free(temp);
	return 1;
}
int criarPilha(stack_t **ponteiroStack){
    
	*ponteiroStack = (stack_t *) malloc (sizeof(stack_t));
	
	if (*ponteiroStack == NULL) {
	    return 0;
	}
	inicializar (*ponteiroStack);
	return 1;
}

void mostrar(stack_t *n) { // topo
	nodo_t *aux = n->topo;
  while(aux != NULL){
			printf("o valor é %d", aux->valor);
			aux = aux->prox;
		}
}
