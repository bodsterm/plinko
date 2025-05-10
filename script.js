// Initialize balance
let balance = parseFloat(localStorage.getItem('balance')) || 100;
document.getElementById('balance').textContent = balance.toFixed(2);

// Canvas setup
const canvas = document.getElementById('plinkoCanvas');
const ctx = canvas.getContext('2d');

// Plinko board setup
const rows = 10;
const pegSpacing = 50;
const pegRadius = 5;
const ballRadius = 10;
const multipliers = [0, 0.5, 1, 2, 5, 0, 0.5, 1, 2, 5]; // Payout multipliers
let ball = null;

// Draw the Plinko board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw pegs
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < row + 1; col++) {
            let x = canvas.width / 2 - (row * pegSpacing) / 2 + col * pegSpacing;
            let y = 50 + row * pegSpacing;
            ctx.beginPath();
            ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
        }
    }

    // Draw multipliers at the bottom
    for (let i = 0; i < multipliers.length; i++) {
        let x = i * (canvas.width / multipliers.length) + (canvas.width / multipliers.length / 2);
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`x${multipliers[i]}`, x, canvas.height - 10);
    }

    // Draw ball if it exists
    if (ball) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
}

// Ball physics
function updateBall() {
    if (!ball) return;

    ball.y += ball.vy;
    ball.vy += 0.5; // Gravity

    // Check for peg collisions
    let row = Math.floor((ball.y - 50) / pegSpacing);
    if (row < rows) {
        let col = Math.round((ball.x - (canvas.width / 2 - (row * pegSpacing) / 2)) / pegSpacing);
        let pegX = canvas.width / 2 - (row * pegSpacing) / 2 + col * pegSpacing;
        let pegY = 50 + row * pegSpacing;

        if (Math.hypot(ball.x - pegX, ball.y - pegY) < ballRadius + pegRadius) {
            // Bounce left or right randomly
            ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5;
            ball.vy = -2;
        }
    }

    ball.x += ball.vx;

    // Keep ball within bounds
    if (ball.x < ballRadius) ball.x = ballRadius;
    if (ball.x > canvas.width - ballRadius) ball.x = canvas.width - ballRadius;

    // Check if ball reaches the bottom
    if (ball.y > canvas.height - ballRadius) {
        let slot = Math.floor(ball.x / (canvas.width / multipliers.length));
        if (slot < 0) slot = 0;
        if (slot >= multipliers.length) slot = multipliers.length - 1;
        let multiplier = multipliers[slot];
        let bet = parseFloat(document.getElementById('bet').value);
        let winnings = bet * multiplier;
        balance += winnings - bet;
        localStorage.setItem('balance', balance);
        document.getElementById('balance').textContent = balance.toFixed(2);
        document.getElementById('result').textContent = `You ${multiplier > 1 ? 'won' : 'lost'}! Multiplier: x${multiplier}, Net: $${(winnings - bet).toFixed(2)}`;
        ball = null;
    }

    drawBoard();
    if (ball) requestAnimationFrame(updateBall);
}

// Play the game
function playPlinko() {
    let bet = parseFloat(document.getElementById('bet').value);
    if (isNaN(bet) || bet <= 0 || bet > balance) {
        document.getElementById('result').textContent = 'Invalid bet amount!';
        return;
    }

    if (ball) return; // Prevent multiple balls

    ball = {
        x: canvas.width / 2,
        y: 20,
        vx: (Math.random() - 0.5) * 2,
        vy: 0
    };

    document.getElementById('result').textContent = '';
    updateBall();
}

// Reset balance
function resetGame() {
    balance = 100;
    localStorage.setItem('balance', balance);
    document.getElementById('balance').textContent = balance.toFixed(2);
    document.getElementById('result').textContent = 'Balance reset to $100!';
}

// Initial draw
drawBoard();



