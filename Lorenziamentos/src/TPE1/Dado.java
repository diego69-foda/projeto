package TPE1;

public class Dado {
    int face = 1;
    
    public void rolar() {
        face = (int)(Math.random() * 6) + 1;
    }
}
