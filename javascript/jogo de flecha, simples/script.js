// Configuração inicial
const svg = document.getElementById("svg");
const svgNS = "http://www.w3.org/2000/svg";
svg.setAttribute("width", window.innerWidth);
svg.setAttribute("height", window.innerHeight);

// Criação da flecha
const arrow = document.createElementNS(svgNS, "path");
arrow.setAttribute("id", "arrow");
arrow.setAttribute("d", "M0,-8 L15,0 L0,8 Z");
arrow.setAttribute("fill", "#333");
arrow.setAttribute("stroke", "#000");
arrow.setAttribute("stroke-width", "1");
arrow.setAttribute("transform", "translate(100, 300)");
svg.appendChild(arrow);

// Criação do alvo
const target = document.createElementNS(svgNS, "circle");
target.setAttribute("id", "target");
target.setAttribute("cx", "500");
target.setAttribute("cy", "300");
target.setAttribute("r", "30");
svg.appendChild(target);

// Variáveis do jogo
const origin = { x: 100, y: 300 };
let isDragging = false;
let arrowInFlight = false;
let arrowSpeed = { x: 0, y: 0 };
let arrowPosition = { x: origin.x, y: origin.y };
let score = 0;

// Atualiza a flecha durante o arrasto
function updateArrow(mouseX, mouseY) {
    const dx = mouseX - origin.x;
    const dy = mouseY - origin.y;
    const distance = Math.min(150, Math.sqrt(dx*dx + dy*dy));
    const angle = Math.atan2(dy, dx);
    
    // Calcula a força do lançamento
    arrowSpeed = {
        x: -dx * 0.1,
        y: -dy * 0.1
    };
    
    // Atualiza aparência da flecha
    const stretchFactor = 1 + (distance / 120);
    arrow.setAttribute("d", `M0,-8 L${15 * stretchFactor},0 L0,8 Z`);
    arrow.setAttribute("transform", `
        translate(${origin.x}, ${origin.y})
        rotate(${angle * (180/Math.PI)})
    `);
}

// Lança a flecha
function launchArrow() {
    if (arrowInFlight) return;
    
    arrowInFlight = true;
    arrowPosition = { x: origin.x, y: origin.y };
    
    const flightInterval = setInterval(() => {
        // Atualiza posição
        arrowPosition.x += arrowSpeed.x;
        arrowPosition.y += arrowSpeed.y;
        
        // Atualiza transformação
        const angle = Math.atan2(arrowSpeed.y, arrowSpeed.x);
        arrow.setAttribute("transform", `
            translate(${arrowPosition.x}, ${arrowPosition.y})
            rotate(${angle * (180/Math.PI)})
        `);
        
        // Verifica colisão com o alvo
        const dx = arrowPosition.x - 500;
        const dy = arrowPosition.y - 300;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < 30) { // Acertou o alvo!
            clearInterval(flightInterval);
            target.setAttribute("fill", "gold");
            target.setAttribute("r", "40");
            score++;
            console.log(`Acertou! Pontuação: ${score}`);
            
            // Reseta após 1 segundo
            setTimeout(() => {
                target.setAttribute("fill", "red");
                target.setAttribute("r", "30");
                resetArrow();
            }, 1000);
            return;
        }
        
        // Verifica se saiu da tela
        if (arrowPosition.x < 0 || arrowPosition.x > window.innerWidth ||
            arrowPosition.y < 0 || arrowPosition.y > window.innerHeight) {
            clearInterval(flightInterval);
            resetArrow();
        }
    }, 16); // ~60fps
}

function resetArrow() {
    arrowInFlight = false;
    arrow.setAttribute("d", "M0,-8 L15,0 L0,8 Z");
    arrow.setAttribute("transform", `translate(${origin.x}, ${origin.y})`);
}

// Event listeners
svg.addEventListener("mousedown", (e) => {
    if (arrowInFlight) return;
    isDragging = true;
    arrow.setAttribute("fill", "#c00");
});

window.addEventListener("mousemove", (e) => {
    if (!isDragging || arrowInFlight) return;
    const rect = svg.getBoundingClientRect();
    updateArrow(e.clientX - rect.left, e.clientY - rect.top);
});

window.addEventListener("mouseup", () => {
    if (!isDragging || arrowInFlight) return;
    isDragging = false;
    arrow.setAttribute("fill", "#333");
    launchArrow();
});

// Movimenta o alvo periodicamente
setInterval(() => {
    if (arrowInFlight) return;
    const newY = 150 + Math.random() * 300;
    target.setAttribute("cy", newY);
}, 2000);