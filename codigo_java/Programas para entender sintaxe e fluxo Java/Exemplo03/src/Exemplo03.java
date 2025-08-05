/**
 * Programa com o objetivo de:
 * - Apresentar operadores aritméticos em Java
 * - Explicar divisão inteira, divisão real e operador módulo (%)
 * 
 * Autor: Professor Lorenzon, 2025-2
 */
   
public class Exemplo03 { //inicio da classe

    public static void main (String args[])  { 

        //divisão inteira e flutuante
        int div;
        int resto;        
        int v1, v2 = 0;

        //fazendo uma divisão inteira
        v1 = 10;
        v2 = 3; //v2 não pode ser 0
        div = v1 / v2;
        System.out.printf ("\n\nO resultado da divisão inteira de %d / %d é %d", v1, v2, div);

        //Extraindo o resto com o operador módulo
        v1 = 51;
        v2 = 2; //v2 não pode ser 0
        resto = v1 % v2;
        System.out.printf ("\n\nO resto da divisão inteira de %d / %d é %d", v1, v2, resto);

        //Pegadinha: divisão com int retorna int mesmo se atribuído a double
        double real;
        v1 = 10;
        v2 = 3;
        real = v1 / v2; // Ainda será 3.0 (pois v1 e v2 são int)
        System.out.printf("\nDivisão decimal esperada? %d / %d = %.3f ← Ops!", v1, v2, real);

        //Correto: forçar pelo menos um valor a ser double (casting)
        real = (double) v1 / v2;
        System.out.printf("\nAgora sim: divisão decimal de %d / %d = %.3f", v1, v2, real);

    }
   }

