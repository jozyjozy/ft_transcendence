var homepageUrl5 = "{% url 'ft_transcendenceLAJ' %}";
window.addEventListener('load', function(event) {
    window.location.href = homepageUrl5;
});

function initgame() {
    let gameFinished = 0;
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');


	let player1_score = 0;
	let player2_score = 0;
	let game_finished = 0;
    let paddleWidth = 10;
    let paddleHeight = 100;
    let player1Y = canvas.height / 2 - paddleHeight / 2;
    let player2Y = canvas.height / 2 - paddleHeight / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballRadius = 10;
    Ws = new WebSocket(`wss://${window.location.host}${window.location.pathname}`);

    Ws.onopen = function(e) {
        console.log("connected");
    };

    Ws.onclose = function(e) {
        console.log('Pong Local Ws closed');
    };


    Ws.onmessage = function(e) {
        const data = JSON.parse(e.data);
		player1_score = data.player1_score;
		player2_score = data.player2_score;
		game_finished = data.game_finished;
        player1Y = data.player1_y;
        player2Y = data.player2_y;
        ballX = data.ball_x;
        ballY = data.ball_y;
		if (game_finished == 1)
		{
            gameFinished = 1;
            if (player1_score == 3)
            {
                Ws.send(JSON.stringify({ player: 'player1', action: 'won' }));
                console.log("msg sent, p1 wins");
            }
            if (player2_score == 3)
                {
                    Ws.send(JSON.stringify({ player: 'player1', action: 'won' }));
                    console.log("msg sent, p1 wins");
                }
			Ws.close();
			writeScore();
		}
		else
		{
            if (player1_score > 0 && player2_score > 0)
			    writeScore(player1_score, player2_score);
            else if (player1_score > 0)
			    writeScore(player1_score, 0);
            else if (player2_score > 0)
			    writeScore(0, player2_score);
            else
                writeScore(0, 0);
			draw();
		}
    };

	function writeScore()
	{
        var checkDoc = document.getElementById('player1_scoreD');
        var checkDoc2 = document.getElementById('player2_scoreD');
        if (player1_score < 3 && player2_score < 3)
		{
            if (checkDoc)
			    document.getElementById('player1_scoreD').innerText = player1_score;
			if (checkDoc2)
                document.getElementById('player2_scoreD').innerText = player2_score;
		}
		else if (player1_score >= 3)
		{
			if (checkDoc)
                document.getElementById('player1_scoreD').innerText = 3;
			winScreen();
		}
		else if (player2_score >= 3)
		{
			if (checkDoc2)
                document.getElementById('player2_scoreD').innerText = 3;
			loseScreen();
		}
	}


	function loseScreen() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'red';
		ctx.font = '48px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
		ctx.font = '24px Arial';
		ctx.fillText('Your Score: ' + player1_score, canvas.width / 2, canvas.height / 2 + 50);
    }

	function winScreen() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'green';
		ctx.font = '48px Arial';
		ctx.textAlign = 'center';
		ctx.fillText('You Win', canvas.width / 2, canvas.height / 2);
		ctx.font = '24px Arial';
		ctx.fillText('Your Score: ' + player1_score, canvas.width / 2, canvas.height / 2 + 50);
    }

    function drawRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function drawCircle(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRect(0, player1Y, paddleWidth, paddleHeight, 'black');
        drawRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight, 'black');
        drawCircle(ballX, ballY, ballRadius, 'black');
    }

    document.addEventListener('keydown', function(e) {
        if (gameFinished == 0 && Ws.readyState ===  WebSocket.OPEN)
        {
            if (e.key === 'w') {
                Ws.send(JSON.stringify({player: 'player1', action: 'upl'}));
            } else if (e.key === 's') {
                Ws.send(JSON.stringify({player: 'player1', action: 'downl'}));
            } else if (e.key === 'ArrowUp') {
                Ws.send(JSON.stringify({player: 'player2', action: 'upl'}));
            } else if (e.key === 'ArrowDown') {
                Ws.send(JSON.stringify({player: 'player2', action: 'downl'}));
            }
        }
    });

    document.addEventListener('keyup', function(e)
    {
        if (gameFinished == 0 && Ws.readyState ===  WebSocket.OPEN)
        {
            if (e.key === 'w') {
                Ws.send(JSON.stringify({player: 'player1', action: 'stop_upl'}));
            } else if (e.key === 's') {
                Ws.send(JSON.stringify({player: 'player1', action: 'stop_downl'}));
            } else if (e.key === 'ArrowUp') {
                Ws.send(JSON.stringify({player: 'player2', action: 'stop_upl'}));
            } else if (e.key === 'ArrowDown') {
                Ws.send(JSON.stringify({player: 'player2', action: 'stop_downl'}));
            }
        }
    });
}
initgame();
