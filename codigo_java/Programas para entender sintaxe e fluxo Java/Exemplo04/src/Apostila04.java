/**
 * Programa com o objetivo de:
 * - Apresentar operadores relacionais e lógicos
 * - Reforçar os princípios de contagem, acumulação e comparação
 * 
 * Autor: Professor Lorenzon, 2025-2
 */
   
public class Apostila04 { //inicio da classe

    public static void main (String args[])  { 

    //Contagem e Acumulação: estrutura base de qualquer algoritmo de repetição
    int atributo = 9; // valor inicial
    int contador = 0;
    int acumulador = 0;

    //Acumulador: somando valores de forma explícita e simplificada
    acumulador = acumulador + atributo; // forma tradicional
    acumulador += atributo;             // forma compacta

    //Contador: incrementos equivalentes
    contador = contador + 1;
    contador += 1;
    ++contador;
    contador++; // todas resultam no mesmo efeito: +1

    // Observação: os operadores +=, -=, *=, /= funcionam também com outros tipos

    //Operação unária: sinal negativo
    System.out.printf("\nValor original de atributo: %d\n", atributo);
    atributo = -atributo; // torna negativo
    atributo = atributo * -1; // inverte novamente (negativo * -1 = positivo)
    System.out.printf("Valor final de atributo após inversões: %d\n", atributo);

    //Operadores lógicos e curto-circuito
    boolean x = true, y = true; // testar também false/true, false/false etc.
    boolean resultadoE = x && y;   // AND lógico
    boolean resultadoOu = x || y;  // OR lógico

    System.out.printf(
            "\nResultado da operação lógica AND (x && y): %b\n" +
            "Resultado da operação lógica OR (x || y): %b\n",
            resultadoE, resultadoOu
    );

    //Dica: Curto-circuito
    // - Se x for false, x && y não avalia y (pois já se sabe que será false)
    // - Se x for true, x || y já será true (não avalia y)


    //Operadores relacionais
    int a = 5, b = 10;
    boolean resultado;

    resultado = a == b; // Igualdade
    System.out.printf("\nResultado de (a == b): %b\n", resultado);
    System.out.printf("Negação (!resultado): %b\n", !resultado);

    /* Experimente substituir por:
       resultado = a != b;     // Diferente
       resultado = a < b;      // Menor que
       resultado = a > b;      // Maior que
       resultado = a <= b;     // Menor ou igual
       resultado = a >= b;     // Maior ou igual
    */

    }
}