// Arquivo: calculadora.ts

function somar(a: number, b: number): number {
  return a + b;
}

const numero1 = 10;
const numero2 = 5;

const resultado = somar(numero1, numero2);

console.log(`O resultado da soma de ${numero1} e ${numero2} é: ${resultado}`);

// Para testar o erro de tipo, descomente a linha abaixo:
// somar(numero1, "5"); // Isso geraria um erro durante a compilação