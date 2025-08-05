#include <stdlib.h>
void randomizar();
int matriz[9][9], i=0,j=0;



void randomizar()
{
    int num = 0;
    for(i=0; i<9; i++)
    {
        for(j=0; j<9; j++)
        { 
            if(num != matriz[i][j])
            {
                num = rand()%100;
                matriz[i][j] = num;            
            }
            else
            {
                while(num == matriz[i][j])
                {
                    num = rand()%100;
                }
                matriz[i][j] = num;
            }
        }     
    }
}