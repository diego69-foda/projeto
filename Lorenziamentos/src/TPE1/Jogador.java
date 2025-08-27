package TPE1;

public class Jogador {
    String nome;
    Dado dado1;
    Dado dado2;
    
    public Jogador(String nome) {
        this.nome = nome;
        this.dado1 = new Dado();
        this.dado2 = new Dado();
    }
    
    public int jogar() {
        dado1.rolar();
        dado2.rolar();
        return dado1.face + dado2.face;
    }
    
}
