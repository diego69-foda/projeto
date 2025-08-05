const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.clear();
console.log('Bem-vindo ao Jogo de Adivinhação!');
console.log('Estou pensando em um número entre 1 e 100...\n');

const numeroSecreto = Math.floor(Math.random() * 100) + 1;
let tentativas = 0;

function fazerPergunta() {
  readline.question('Digite seu palpite: ', (palpite) => {
    tentativas++;
    
    const numero = parseInt(palpite);
    
    if (isNaN(numero)) {
      console.log('Por favor, digite um número válido!\n');
      return fazerPergunta();
    }
    
    if (numero === numeroSecreto) {
      console.log(`\nParabéns! Você acertou em ${tentativas} tentativas!`);
      return readline.close();
    }
    
    console.log(numero < numeroSecreto 
      ? 'O número é maior. Tente novamente!\n' 
      : 'O número é menor. Tente novamente!\n');
    
    fazerPergunta();
  });
}

fazerPergunta();