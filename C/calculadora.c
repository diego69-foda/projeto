#include <stdio.h>
#include "funcoes.h"
#include "string.h"

int calculadora(char, int, int);
int somar(int, int);
int subtrair(int, int);
int dividir(int, int);
int multiplicar(int, int);

int main(void) {
    
	int a, b, resultado;
	char comando;
    
	printf("calculadora de dois numeros simples!\n");
	printf("digite o primeiro numero: ");
	scanf("%d", &a);
	printf("digite o segundo numero: ");
	scanf("%d", &b);
	printf("escolha um desses comandos:\n +, -, / ou *\n");
	printf("digite o comando: ");
	scanf(" %c", &comando);
	resultado = calculadora (comando, a, b);
    printf ("Resultado %d", resultado);
    
	return 0;
}

int calculadora(char comando, int a, int b){
    int resultado = 0;
    
switch(comando){
	    case '+':
	        resultado = somar(a, b);
	        break;
	    case '-':
	        resultado = subtrair(a, b);
	        break;
	    case '*':
	        resultado = multiplicar(a, b);
	        break;
	   case '/':
	        if(b != 0)
	            resultado = dividir(a, b);
	        else{
	            printf("ERRO! Divisão por zero! ");
	            resultado = 0;
	        }
	        break;
	    default:
	        printf("Operação Inválida! ");
	        resultado = 0;
}
    return resultado;
}

int somar(int a, int b){
    return a + b;
}

int subtrair(int a, int b){
    return a - b;
}

int dividir(int a, int b){
    return a / b;
}

int multiplicar(int a, int b){
    return a * b;
}