//fazer jogo da velha em c
#include <stdio.h>

// Inicialização explícita de todas as variáveis globais
int matriz[3][3] = {{0, 0, 0}, {0, 0, 0}, {0, 0, 0}};
int linha = 0, coluna = 0, a = 0, b = 0, cont = 0;
int ganhou = 0, letra = 0, letra1 = 0;

void jogo()
{
    while (cont < 9)
    {
        if (ganhou)
        {
            if(cont % 2 == 1)
            {    
                printf("Parabéns por ter ganhado X\n");
                break;
            }
            
            if(cont % 2 == 0)
            {
                printf("Parabéns por ter ganhado O\n");
                break;
            }
        }
        
        printf("Escolha a linha e a coluna que deseja marcar: ");
        scanf("%d", &a);
        scanf("%d", &b);
        
        if(a > 2 || b > 2 || a < 0 || b < 0)    
        {   
            printf("Essa casa não existe, tente novamente.\n");
            continue;
        }
        
        if(matriz[a][b] > 0)
        {
            printf("Essa casa já foi escolhida, tente novamente.\n");
            continue;
        }
        
        if(cont % 2 == 0)
        {    
            matriz[a][b] = 1; // X
        }
        else // Simplificado o if para else
        {
            matriz[a][b] = 2; // O
        }
        
        cont++;
        letra = 0;
        printf("\n       COLUNA\n");
        printf("     0    1    2\n");
        printf("LINHA\n");
        
        for (linha = 0; linha < 3; linha++)
        {
            if (letra == 0)
            {
                printf("0  ");
            }
            if (letra == 1)
            {
                printf("1  ");
            }
            if (letra == 2)
            {
                printf("2  ");
            }
            
            for (coluna = 0; coluna < 3; coluna++)
            {
                if (matriz[linha][coluna] == 0)
                {
                    printf("|___|");
                }
                else if (matriz[linha][coluna] == 1)
                {
                    printf("|_X_|");
                }
                else if (matriz[linha][coluna] == 2)
                {
                    printf("|_O_|");
                }
            }
            
            letra++;
            printf("\n");
        }
        
        // Verificação de vitória movida para fora do loop de exibição
        // Verificação por linhas e colunas
        for (int i = 0; i < 3; i++)
        {
            if ((matriz[i][0] == matriz[i][1] && matriz[i][1] == matriz[i][2] && matriz[i][0] != 0) ||
                (matriz[0][i] == matriz[1][i] && matriz[1][i] == matriz[2][i] && matriz[0][i] != 0))
            {
                ganhou = 1;
            }
        }
        
        // Verificação por diagonais
        if ((matriz[0][0] == matriz[1][1] && matriz[1][1] == matriz[2][2] && matriz[0][0] != 0) ||
            (matriz[0][2] == matriz[1][1] && matriz[1][1] == matriz[2][0] && matriz[0][2] != 0))
        {
            ganhou = 1;
        }
        
        // Verificação de empate
        if(!ganhou && cont == 9){
            printf("Deu velha!\n");
        }
    }
}

void inicializar()
{
    for(linha=0; linha<3; linha++)
    {
        for(coluna=0; coluna<3; coluna++)
        {
            matriz[linha][coluna] = 0;
        }
    }
}

int main()
{
    inicializar();

    letra = 0;
    printf("       COLUNA\n");
    printf("     0    1    2\n");
    printf("LINHA\n");
    
    for (linha = 0; linha < 3; linha++)
    {
        if (letra == 0)
        {
            printf("0  ");
        }
        if (letra == 1)
        {
            printf("1  ");
        }
        if (letra == 2)
        {
            printf("2  ");
        }
        
        for (coluna = 0; coluna < 3; coluna++)
        {
            if (matriz[linha][coluna] == 0)
            {
                printf("|___|");
            }
            else if (matriz[linha][coluna] == 1)
            {
                printf("|_X_|");
            }
            else if (matriz[linha][coluna] == 2)
            {
                printf("|_O_|");
            }
        }
        
        letra++;
        printf("\n");
    }
    
    jogo();
    return 0;
}
