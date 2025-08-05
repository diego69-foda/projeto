 /*
 Exemplo01: Programa simples para entender sintaxe e fluxo em Java.
 
 Conceitos abordados:
 - Organização de pacotes (`package`)
 - Importação de classes (`import`)
 - Método `main` como ponto de entrada
 - Declaração de variáveis primitivas
 - Entrada de dados customizada via classe `Teclado`
 - Saída de dados com `System.out.println` e `System.out.printf`
 
 Autoria: Professor Lorenzon, revisão 2025-2.
*/
   public class Exemoplo01 { //inicio da classe

    // Método principal: onde a execução começa
    public static void main (String args[])  {   
                                          
              //Tipos primitivos de dados com camelCase
              int      valorInteiro        = 0;      //padrão de inicialização é 0
              boolean  logicoVerdadeiro    = true;   //padrão de inicialização é false
              // OBS: Evitar o uso de float, prefira double para maior precisão.
              float    valorFlutuante      = 3.14f;  //ou double sem f 
              // ERRO COMUM: tentar usar vírgula como separador decimal sem tratamento. 
              double   valorDecimal        = 1.0;    //prefira double e use . para casa demimal 
              //char também é um tipo primitivo em C, mas String não é.
              char     umaLetra            = 'A'; 

              umaLetra = 'B';          
              
              // float é menos preciso que double. Ao converter de double para float, é necessário "casting":
              // valorFlutuante = (float) Teclado.readDouble();

              // %d = inteiro, %.2f = float com 2 casas, %b = booleano
              //System.out.println: saída simples
              //System.out.printf: saída formatada

              System.out.printf ( "Valores inicializados:\n\nInteiro: %d\nDecimal: %.2f\nBooleano: %b", //uso de formatadores
                                   valorInteiro,
                                   valorFlutuante,                                   
                                   logicoVerdadeiro);

              //leitura dos valores e escrita dos mesmos via usuário
              
              System.out

import java.util.Scanner;
import java.util.InputMismatchException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

/**
 * Classe utilitária para leitura segura de dados do teclado.
 * Usa a classe Scanner, com tratamento de exceções e mensagens orientativas.
 * 
 * Autor: Professor Lorenzon, revisão 2025-2
 * Uso: salvar dentro da pasta 'utils' no projeto.
 */

public class Teclado {

    // Scanner único reutilizável
    private static final Scanner scanner = new Scanner(System.in);

    /**
     * Lê um valor inteiro digitado pelo usuário.
     * Repete enquanto a entrada for inválida.
     */
    public static int readInt() {
        while (true) {
            try {
                return scanner.nextInt();
            } catch (InputMismatchException e) {
                System.out.println("Entrada inválida! Digite um número inteiro.");
                scanner.nextLine(); // limpa buffer
            }
        }
    }

    public static int readInt(String mensagem) {
        System.out.print(mensagem + " ");
        return readInt();
    }

    /**
     * Lê uma string (linha completa) digitada pelo usuário.
     * Rejeita entradas vazias.
     */
    public static String readString() {
        while (true) {
            String valor = scanner.nextLine().trim();
            if (!valor.isEmpty()) return valor;
            System.out.println("Entrada vazia! Digite novamente.");
        }
    }

    public static String readString(String mensagem) {
        System.out.print(mensagem + " ");
        return readString();
    }

    /**
     * Lê um valor decimal (double) digitado pelo usuário.
     * Repete enquanto a entrada for inválida.
     */
    public static double readDouble() {
        while (true) {
            try {
                return scanner.nextDouble();
            } catch (InputMismatchException e) {
                System.out.println("Entrada inválida! Digite um número decimal.");
                scanner.nextLine(); // limpa buffer
            }
        }
    }

    public static double readDouble(String mensagem) {
        System.out.print(mensagem + " ");
        return readDouble();
    }

    /**
     * Lê uma data no formato yyyy-MM-dd (ex: 2025-07-24).
     * Repete até o usuário digitar um formato válido.
     */
    public static LocalDate readDate() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        while (true) {
            String entrada = readString();
            try {
                return LocalDate.parse(entrada, formatter);
            } catch (DateTimeParseException e) {
                System.out.println("Data inválida! Use o formato AAAA-MM-DD.");
            }
        }
    }

    public static LocalDate readDate(String mensagem) {
        System.out.print(mensagem + " ");
        return readDate();
    }
}
