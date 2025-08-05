// Arquivo: calculadora.ts
function somar(a, b) {
    return a + b;
}
var numero1 = 10;
var numero2 = 5;
var resultado = somar(numero1, numero2);
console.log("O resultado da soma de ".concat(numero1, " e ").concat(numero2, " \u00E9: ").concat(resultado));
// Para testar o erro de tipo, descomente a linha abaixo:
// somar(numero1, "5"); // Isso geraria um erro durante a compilação
