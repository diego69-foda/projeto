#include <stdio.h>
 
 
int dobro(int);
int quadrado(int);
int verificapar(int);
float media(int,int);

int dobro(int n)
{
    return n * 2;
}

int quadrado(int n)
{
    return n * n;
}

int verificapar(int n)
{
    if ((n % 2) == 0)
        return 1; // é par
    else
        return 0; // é ímpar
}

double tirarmedia (double a, double b)
{
    return a / b;
}


