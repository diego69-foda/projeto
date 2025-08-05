#include <stdio.h>
int main()
{
int vetchola[5],i=0,aux;
do
{
scanf("%d",&aux);
if(aux>0) {
vetchola[i] = aux;
i++;
}
else {
continue;
}
} while(i<5);
printf("Os valores positivos digitados foram:\n");
for(i=0; i<5; i++)
{
printf("%d\n",vetchola[i]);
}
return 0;
}