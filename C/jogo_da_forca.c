#include <stdio.h>
#include <string.h>


void limparBuffer();

int main() {
    char palavra[50] = "computacao";
    char letrasCertas[50]; 
    int erro = 6;
    int tamanho = strlen(palavra);
    int acertos = 0;
    char tentativa;
    int i, acertou;

    
    for (i = 0; i < tamanho; i++) {
        letrasCertas[i] = '_';
    }

    while (erro > 0 && acertos < tamanho) {
        printf("\nPalavra: ");
        for (i = 0; i < tamanho; i++) {
            printf("%c ", letrasCertas[i]);
        }

        printf("\nDigite uma letra: ");
        scanf(" %c", &tentativa); 
        limparBuffer();

        acertou = 0;

        for (i = 0; i < tamanho; i++) {
            if (palavra[i] == tentativa && letrasCertas[i] == '_') {
                letrasCertas[i] = tentativa;
                acertos++;
                acertou = 1;

            }
        }

        if (acertou) {
            printf("Acertou!\n");
        } else {
            erro--;
            printf("Errou! Vidas restantes: %d\n", erro);
        }
    }

    if (acertos == tamanho) {
        printf("\nParabéns! Você descobriu a palavra: %s\n", palavra);
    } else {
        printf("\nGame over! A palavra era: %s\n", palavra);
    }

    return 0;
}

void limparBuffer() {
    while (getchar() != '\n');
}