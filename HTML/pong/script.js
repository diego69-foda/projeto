const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Game constants
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 16;
const PADDLE_MARGIN = 10;
const PLAYER_X = PADDLE_MARGIN;
const AI_X = canvas.width - PADDLE_WIDTH - PADDLE_MARGIN;
const PADDLE_SPEED = 8;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2 - BALL_SIZE / 2;
let ballY = canvas.height / 2 - BALL_SIZE / 2;
let ballSpeedX = 6;
let ballSpeedY = 4;

// Mouse movement for player paddle
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle within canvas
  playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Ball collision with top/bottom walls
  if (ballY <= 0 || ballY + BALL_SIZE >= canvas.height) {
    ballSpeedY = -ballSpeedY;
    ballY = Math.max(0, Math.min(canvas.height - BALL_SIZE, ballY));
  }

  // Ball collision with player paddle
  if (
    ballX <= PLAYER_X + PADDLE_WIDTH &&
    ballY + BALL_SIZE >= playerY &&
    ballY <= playerY + PADDLE_HEIGHT
  ) {
    ballSpeedX = Math.abs(ballSpeedX);
    // Add a little randomness for challenge
    ballSpeedY += (Math.random() - 0.5) * 2;
    ballX = PLAYER_X + PADDLE_WIDTH;
  }

  // Ball collision with AI paddle
  if (
    ballX + BALL_SIZE >= AI_X &&
    ballY + BALL_SIZE >= aiY &&
    ballY <= aiY + PADDLE_HEIGHT
  ) {
    ballSpeedX = -Math.abs(ballSpeedX);
    ballSpeedY += (Math.random() - 0.5) * 2;
    ballX = AI_X - BALL_SIZE;
  }

  // Ball out of bounds: reset position
  if (ballX < 0 || ballX > canvas.width) {
    resetBall();
  }

  // Simple AI: move towards ball
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  if (aiCenter < ballY + BALL_SIZE / 2) {
    aiY += PADDLE_SPEED;
  } else if (aiCenter > ballY + BALL_SIZE / 2) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp AI paddle
  aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Draw all game objects
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw middle dashed line
  ctx.setLineDash([10, 15]);
  ctx.strokeStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw player paddle
  ctx.fillStyle = "#39f";
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw AI paddle
  ctx.fillStyle = "#f33";
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw ball
  ctx.fillStyle = "#fff";
  ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

// Reset ball to center
function resetBall() {
  ballX = canvas.width / 2 - BALL_SIZE / 2;
  ballY = canvas.height / 2 - BALL_SIZE / 2;
  ballSpeedX = (Math.random() < 0.5 ? 1 : -1) * 6;
  ballSpeedY = (Math.random() < 0.5 ? 1 : -1) * 4;
}

gameLoop();