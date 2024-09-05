

const gameSocket = new WebSocket(
    'wss://' + window.location.host + '/game/'
);

console.log("WebSocket created");

const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

gameSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    updateGame(data);
};

gameSocket.onclose = function(e) {
    console.log('Game socket closed');
};


function updateGame(data) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgb(197, 24, 219)";
    context.fillRect(10, data.player1_y, 10, 100); // Player 1 paddle
    context.fillRect(780, data.player2_y, 10, 100); // Player 2 paddle
    context.fillStyle = 'orange';
    context.beginPath();
    context.arc(data.ball_x, data.ball_y, 10, 0, Math.PI * 2);
    context.fill();
}


document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        gameSocket.send(JSON.stringify({ 'player': 'player1', 'action': 'up' }));
    } else if (event.key === 'ArrowDown') {
        gameSocket.send(JSON.stringify({ 'player': 'player1', 'action': 'down' }));
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'ArrowUp') {
        gameSocket.send(JSON.stringify({ 'player': 'player1', 'action': 'stop_up' }));
    } else if (event.key === 'ArrowDown') {
        gameSocket.send(JSON.stringify({ 'player': 'player1', 'action': 'stop_down' }));
    }
});

function initPong()
{
	var canvas = document.getElementById('pongCanvas');
	var context = canvas.getContext('2d');
	var upKeyPressed = false;
	var downKeyPressed = false;

	var aiInit = false;
	var paddle1Height = 100;
	var paddle2Height = 100;
	var paddleWidth = 10;
	var paddleSpeed = 10;
	var leftPaddleY = (canvas.height - paddle1Height) / 2;
	var rightPaddleY = (canvas.height - paddle2Height) / 2;
	var ballSize = 10;

	var playerScore = 0;
	var aiScore = 0;
	var scoreInited = 0;
	updateScoresDisplay();
	if (playerScore < 3 && aiScore < 3) {
		var ballSpeedY = 4;
		var ballSpeedX = 4;
	} else {
		var ballSpeedY = 0;
		var ballSpeedX = 0;
	}
	var ballX = canvas.width / 2;
	var ballY = canvas.height / 2;

	var aiTargetY = rightPaddleY;

	class Bonus {
		constructor()
		{
			this.x = Math.random() < 0.5 ? (canvas.width / 2) - Math.random() * (canvas.width / 3) : (canvas.width / 2) + Math.random() * (canvas.width / 3)
			this.y = Math.random() * (canvas.height - 50);
			this.size = 50;
			this.exists = false;
		}

		draw(context)
		{
			if (this.exists)
			{
				context.font = `${this.size}px Arial`;
				if (Drawn < 0.1)
					context.fillText('🌮', this.x, this.y + this.size);
				if (Drawn >= 0.1 && Drawn < 0.2)
					context.fillText('🍣', this.x, this.y + this.size);
				if (Drawn >= 0.2 && Drawn < 0.3)
					context.fillText('🌶️', this.x, this.y + this.size);
				if (Drawn >= 0.3 && Drawn < 0.4)
					context.fillText('🥫', this.x, this.y + this.size);
				if (Drawn >= 0.4 && Drawn < 0.5)
					context.fillText('🔋', this.x, this.y + this.size);
			}
		}

		reset() {
			this.x = Math.random() < 0.5 ? Math.random() * (canvas.width / 2 - 50) : Math.random() * (canvas.width / 2 - 50) + canvas.width / 2;
			this.y = Math.random() * (canvas.height - 50);
			this.exists = true;
		}
	}

	function drawPaddles() {
		context.fillStyle = "rgb(197, 24, 219)";
		context.fillRect(0, leftPaddleY, paddleWidth, paddle1Height);
		context.fillRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddle2Height);
	}

	function drawBall() {
		context.fillStyle = 'orange';
		context.beginPath();
		context.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
		context.fill();
	}


	function moveBall()
	{
		if (playerScore < 3 && aiScore < 3)
		{
			ballX += ballSpeedX;
			ballY += ballSpeedY;
			if (bonus.exists && ballX + ballSize > bonus.x && ballX - ballSize < bonus.x + bonus.size &&
				ballY + ballSize > bonus.y && ballY - ballSize < bonus.y + bonus.size)
					removeBonus();
		}
		else
		{
			ballSpeedY = 0;
			ballSpeedX = 0;
		}
		if (ballY + ballSize > canvas.height || ballY - ballSize < 0)
		{
			ballSpeedY = -ballSpeedY;
			ballSpeedY *= 1.05;
		}
		if ((ballX - ballSize < paddleWidth && ballY > leftPaddleY && ballY < leftPaddleY + paddle1Height) ||
			(ballX + ballSize > canvas.width - paddleWidth && ballY > rightPaddleY && ballY < rightPaddleY + paddle2Height))
		{
			ballSpeedX = -ballSpeedX;
			ballSpeedX *= 1.05;
			if (ballX - ballSize < paddleWidth)
				ballX = paddleWidth + ballSize;
			else if (ballX + ballSize > canvas.width - paddleWidth)
				ballX = canvas.width - paddleWidth - ballSize;
		}
		if (ballX - ballSize < 0 || ballX + ballSize > canvas.width)
		{
			updateScores();
		}
	}

	function updateScores()
	{
		if (ballX - ballSize < -0.1 && (playerScore < 3 && aiScore < 3))
		{
			aiScore++;
			if (playerScore < 3 && aiScore < 3) {
				resetBall();
			}
		}
		else if (ballX + ballSize > (canvas.width + 1) && (playerScore < 3 && aiScore < 3)) {
			playerScore++;
			if (playerScore < 3 && aiScore < 3) {
				resetBall();
			}
		}
		updateScoresDisplay();
	}

	function loseScreen() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = 'red';
		context.font = '48px Arial';
		context.textAlign = 'center';
		context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
		context.font = '24px Arial';
		context.fillText('Your Score: ' + playerScore, canvas.width / 2, canvas.height / 2 + 50);
	}

	function winScreen() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = 'green';
		context.font = '48px Arial';
		context.textAlign = 'center';
		context.fillText('You Win', canvas.width / 2, canvas.height / 2);
		context.font = '24px Arial';
		context.fillText('Your Score: ' + playerScore, canvas.width / 2, canvas.height / 2 + 50);
	}

	function resetBall() {
		ballX = canvas.width / 2;
		ballY = canvas.height / 2;
		ballSpeedX = -ballSpeedX;
		ballSpeedX = ballSpeedX < 0 ? -4 : 4;
		ballSpeedY = Math.random() < 0.5 ? -4 : 4;
	}

	function updateScoresDisplay() {
		if (playerScore >= 3) {
			document.getElementById('playerScoreDisplay').innerText = playerScore;
			winScreen();
		} else if (aiScore >= 3) {
			document.getElementById('aiScoreDisplay').innerText = aiScore;
			loseScreen();
		} else {
			document.getElementById('aiScoreDisplay').innerText = aiScore;
			document.getElementById('playerScoreDisplay').innerText = playerScore;
		}
	}

	function updateAiTarget() {
		var futureBallX = ballX + ballSpeedX * 0.5;
		var futureBallY = ballY + ballSpeedY * 0.5;
		var timeToTopWall = (ballY - ballSize) / Math.abs(ballSpeedY);
		var timeToBottomWall = (canvas.height - ballY - ballSize) / Math.abs(ballSpeedY);
		var shortestTimeToWall = Math.min(timeToTopWall, timeToBottomWall);
		var xAfterFirstBounce = futureBallX + ballSpeedX * shortestTimeToWall;
		var yAfterFirstBounce = futureBallY + ballSpeedY * shortestTimeToWall;
		var slope = ballSpeedY / ballSpeedX;
		if (ballSpeedX > 0)
			var intersectionY = slope * (canvas.width - paddleWidth - xAfterFirstBounce) + yAfterFirstBounce;
		if (ballSpeedX > 0) {
			aiTargetY = intersectionY;
		}
		setTimeout(updateAiTarget, 1000);
	}

	function bonusSpawn() {
		if (Drawn < 0.5) {
			bonus.exists = true;
			bonus.draw(context);
		}
	}

	function removeBonus() {
		if (Drawn < 0.1) {
			if (ballSpeedX > 0)
				paddle1Height = 2 * paddle1Height;
			else
				paddle2Height = 2 * paddle2Height;
			bonus.reset();
			bonus.exists = false;
			Drawn = 1;
			setTimeout(removeBonusEffect, 10000);
		}
		else if (Drawn >= 0.1 && Drawn < 0.2) {
			if (ballSpeedX < 0)
				paddle1Height = 0.5 * paddle1Height;
			else
				paddle2Height = 0.5 * paddle2Height;
			bonus.reset();
			bonus.exists = false;
			Drawn = 1;
			setTimeout(removeBonusEffect, 10000);
		}
		else if (Drawn >= 0.2 && Drawn < 0.3) {
			ballSpeedY = 2 * ballSpeedY;
			ballSpeedX = 2 * ballSpeedX;
			bonus.reset();
			bonus.exists = false;
			Drawn = 1;
			setTimeout(removeBonusEffect, 1000);
		}
		else if (Drawn >= 0.3 && Drawn < 0.4) {
			ballSpeedX = -ballSpeedX;
			bonus.reset();
			bonus.exists = false;
			Drawn = 1;
		}
		else if (Drawn >= 0.4 && Drawn < 0.5) {
			ballSpeedY = -ballSpeedY;
			bonus.reset();
			bonus.exists = false;
			Drawn = 1;
		}
	}

	function removeBonusEffect() {
		if (paddle1Height > 100)
			paddle1Height--;
		if (paddle1Height < 100)
			paddle1Height++;
		if (paddle2Height > 100)
			paddle2Height--;
		if (paddle2Height < 100)
			paddle2Height++;
		if (Drawn > 0.2 && Drawn < 0.3) {
			ballSpeedY = ballSpeedY / 2;
			ballSpeedX = ballSpeedX / 2;
		}
		setTimeout(removeBonusEffect, 100)
	}

	var bonus = new Bonus();
	var Drawn = Math.random();
	function draw() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		bonusSpawn();
		drawPaddles();
		drawBall();
		moveBall();
		if (aiInit == false) {
			aiInit = true;
			updateAiTarget();
		}
		requestAnimationFrame(draw);
	}
	draw();
}
initPong();
