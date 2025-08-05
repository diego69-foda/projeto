#include <stdio.h>
#include <stdlib.h>
#include <time.h> // Biblioteca adicionada para a função time()


#define BINGO_RANGE 100

int matriz[9][9], matriz2[9][9];

// Protótipos das funções
void validation();
void randomizar();
void inicializar();
void jogo();

int main() 
{
    // Inicializa o gerador de números aleatórios para que o jogo seja diferente a cada execução.
    srand(time(NULL)); 
    
    inicializar();
    jogo();
    
    return 0; // Esta linha nunca será alcançada devido ao exit() no jogo, mas é uma boa prática.
}

void randomizar() {
    int num = 0, used[BINGO_RANGE] = {0};
    // Garante que as variáveis de laço sejam locais para esta função.
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            do {
                num = rand() % BINGO_RANGE; // Gera um número entre 0 e BINGO_RANGE-1
            } while (used[num]); // Garante que o número não foi usado antes
            matriz[i][j] = num;
            used[num] = 1; // Marca o número como usado
        }
    }
}

void inicializar() {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            matriz[i][j] = 0;
            matriz2[i][j] = 0; // matriz2 controla os números já marcados
        }
    }
}

void jogo() {
    char resposta;
    int x = 0;
    printf("BINGO\n\n");
    
    randomizar(); // Preenche a cartela com números aleatórios

    while (1) {
        x = rand() % BINGO_RANGE;
        printf("O numero sorteado foi: %d\n\n", x);

        // Marca o número na cartela se ele for encontrado
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (x == matriz[i][j]) {
                    matriz2[i][j] = 1; // 1 significa que o número foi marcado
                }
            }
        }

        // Imprime a cartela e os marcadores 'X'
        for (int i = 0; i < 9; i++) {
            // Imprime a linha de números
            for (int j = 0; j < 9; j++) {
                // %2d garante que o número sempre use 2 espaços, alinhando a grade
                printf("%2d ", matriz[i][j]);
            }
            printf("\n");
            
            // Imprime a linha de marcadores 'X'
            for (int j = 0; j < 9; j++) {
                if(matriz2[i][j] == 1){
                    printf(" X "); // Centralizado para alinhar com %2d
                } else {
                    printf("   "); // 3 espaços para manter o alinhamento
                }
            }
            printf("\n\n");
        }

        // A validação agora ocorre a cada rodada, dentro do loop.
        validation();

        printf("Deseja sortear outro numero? ('s' para sair, outra tecla para continuar)\n");
        scanf(" %c", &resposta);

        if (resposta == 's' || resposta == 'S') {
            printf("Saindo do jogo...\n");
            exit(0);
        } else {
            printf("Continuando...\n\n");
        }
    }
}

void validation() {
    // Declaração de variáveis locais para laços e controle.
    int i, j;
    int bingo_linha, bingo_coluna;
    int bingo_diag1 = 1, bingo_diag2 = 1;

    // 1. Verificação de vitória por LINHA
    for (i = 0; i < 9; i++) {
        bingo_linha = 1; // Assume que a linha é um bingo até que se prove o contrário
        for (j = 0; j < 9; j++) {
            if (matriz2[i][j] == 0) {
                bingo_linha = 0; // Encontrou um número não marcado, não é bingo
                break; // Sai do laço interno, vai para a próxima linha
            }
        }
        if (bingo_linha) {
            printf("\nBINGO! Vitoria na linha %d!\n", i + 1);
            exit(0);
        }
    }

    // 2. Verificação de vitória por COLUNA
    for (j = 0; j < 9; j++) {
        bingo_coluna = 1; // Assume que a coluna é um bingo
        for (i = 0; i < 9; i++) {
            if (matriz2[i][j] == 0) {
                bingo_coluna = 0; // Encontrou um número não marcado
                break; // Vai para a próxima coluna
            }
        }
        if (bingo_coluna) {
            printf("\nBINGO! Vitoria na coluna %d!\n", j + 1);
            exit(0);
        }
    }

    // 3. Verificação da DIAGONAL PRINCIPAL (canto superior esquerdo ao inferior direito)
    for (i = 0; i < 9; i++) {
        if (matriz2[i][i] == 0) {
            bingo_diag1 = 0;
            break;
        }
    }
    if (bingo_diag1) {
        printf("\nBINGO! Vitoria na DIAGONAL PRINCIPAL!\n");
        exit(0);
    }
    
    // 4. Verificação da DIAGONAL SECUNDÁRIA (canto superior direito ao inferior esquerdo)
    for (i = 0; i < 9; i++) {
        if (matriz2[i][8 - i] == 0) {
            bingo_diag2 = 0;
            break;
        }
    }
    if (bingo_diag2) {
        printf("\nBINGO! Vitoria na DIAGONAL SECUNDARIA!\n");
        exit(0);
    }
}