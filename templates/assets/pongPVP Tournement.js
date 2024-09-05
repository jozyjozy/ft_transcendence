
var homepageUrl5 = "{% url 'ft_transcendenceLAJ' %}";
window.addEventListener('load', function(event)
{
    window.location.href = homepageUrl5;
});

function initgame(name1)
{
    const canvas = document.getElementById('pongCanvas');
    const ctx = canvas.getContext('2d');

	if (name1 == 'start')
		{
			player1 = prompt("Enter name of player 1:");
			player2 = prompt("Enter name of player 2:");
			player3 = prompt("Enter name of player 3:");
			player4 = prompt("Enter name of player 4:");
			winner1 = '';
			winner2 = '';
			loser1 = '';
			loser2 = '';
			loserFinal = '';
			winnerFinal = '';
			first = '';
			second = '';
			third = '';
			forth = '';
		}
	let tournamentFinished = 0;
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
        console.log('Chat Ws closed');
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
			Ws.close();
			writeScore();
		}
		else
		{
			writeScore(player1_score, player2_score);
			draw();
		}
    };

	function writeScore()
	{
		var checkDoc = document.getElementById('player1_name');
        var checkDoc2 = document.getElementById('player2_name');

		if (checkDoc)
			document.getElementById('player1_name').innerText = player1;
		if (checkDoc2)
			document.getElementById('player2_name').innerText = player2;

		checkDoc = document.getElementById('player1_scoreD');
        checkDoc2 = document.getElementById('player2_scoreD');
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
			if (winner1 == '')
				{
					winner1 = player1;
					loser1 = player2;
					player1 = player3;
					player2 = player4;
					player1_score = 0;
					player2_score = 0;
					game_finished = 0;
					initgame();
				}
				else if (winner2 == '')
				{
					winner2 = player1;
					loser2 = player2;
					player1 = loser1;
					player2 = loser2;
					player1_score = 0;
					player2_score = 0;
					game_finished = 0;
					initgame();
				}
				else if (loserFinal == '')
				{
					loserFinal = player2;
					third = player1;
					player1 = winner1;
					player2 = winner2;
					player1_score = 0;
					player2_score = 0;
					game_finished = 0;
					initgame();
				}
				else
				{
					winnerFinal = player1;
					first = player1;
					second = player2;
					forth = loserFinal;
					winScreen(player1)
				}
		}
		else if (player2_score >= 3)
		{
			if (checkDoc2)
				document.getElementById('player2_scoreD').innerText = 3;
			if (winner1 == '')
			{
				winner1 = player2;
				loser1 = player1;
				player1 = player3;
				player2 = player4;
				player1_score = 0;
				player2_score = 0;
				game_finished = 0;
				initgame();
			}
			else if (winner2 == '')
			{
				winner2 = player2;
				loser2 = player1;
				player1 = loser1;
				player2 = loser2;
				player1_score = 0;
				player2_score = 0;
				game_finished = 0;
				initgame();
			}
			else if (loserFinal == '')
			{
				loserFinal = player1;
				third = player2;
				player1 = winner1;
				player2 = winner2;
				player1_score = 0;
				player2_score = 0;
				game_finished = 0;
				initgame();
			}
			else
			{
				winnerFinal = player2;
				first = player2;
				second = player1;
				forth = loserFinal;
				winScreen(player2);
			}
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
		Ws.send(JSON.stringify({ player: 'player1', action: 'won' }));
	}

	function winScreen(player) {
		tournamentFinished = 1;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = '48px Arial';
		ctx.textAlign = 'center';
		ctx.fillStyle = 'green';
		ctx.fillText('Gold ' + first, canvas.width / 2, canvas.height / 2 - 100);
		ctx.fillStyle = 'grey';
		ctx.fillText('Silver ' + second, canvas.width / 2, canvas.height / 2 - 50);
		ctx.fillStyle = 'orange';
		ctx.fillText('Bronze ' + third, canvas.width / 2, canvas.height / 2 + 50);
		ctx.fillStyle = 'black';
		ctx.fillText('Iron ' + forth, canvas.width / 2, canvas.height / 2 + 100);
		//Ws.send(JSON.stringify({ player: player, action: 'won' }));
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
		if (tournamentFinished == 0 && Ws.readyState ===  WebSocket.OPEN)
		{
			if (e.key === 'ArrowUp') {
				Ws.send(JSON.stringify({player: 'player2', action: 'upl'}));
			} else if (e.key === 'ArrowDown') {
				Ws.send(JSON.stringify({player: 'player2', action: 'downl'}));
			} else if (e.key === 'w') {
				Ws.send(JSON.stringify({player: 'player1', action: 'upl'}));
			} else if (e.key === 's') {
				Ws.send(JSON.stringify({player: 'player1', action: 'downl'}));
			}
		}
    });

    document.addEventListener('keyup', function(e) {
		if (tournamentFinished == 0 && Ws.readyState ===  WebSocket.OPEN)
		{
			if (e.key === 'ArrowUp') {
				Ws.send(JSON.stringify({player: 'player2', action: 'stop_upl'}));
			} else if (e.key === 'ArrowDown') {
				Ws.send(JSON.stringify({player: 'player2', action: 'stop_downl'}));
			} else if (e.key === 'w') {
				Ws.send(JSON.stringify({player: 'player1', action: 'stop_upl'}));
			} else if (e.key === 's') {
				Ws.send(JSON.stringify({player: 'player1', action: 'stop_downl'}));
			}
		}
    });
}
// var headers = document.getElementsByTagName('h2');
//     for (var i = 0; i < headers.length; i++) {
//         var header = headers[i];
//         if (header.textContent.includes('Left Player')) {
//             header.innerHTML = player1 + " score";
//         } else if (header.textContent.includes('Right Player')) {
//             header.innerHTML = player2 + " score";;
//         }
//     }

// const player3 = prompt("Enter name of player 3:");
// const player4 = prompt("Enter name of player 4:");
// initgame();
// var headers = document.getElementsByTagName('h2');
//     for (var i = 0; i < headers.length; i++) {
//         var header = headers[i];
//         if (header.textContent.includes('Left Player')) {
//             header.innerHTML = player3 + " score";
//         } else if (header.textContent.includes('Right Player')) {
//             header.innerHTML = player4 + " score";;
//         }
//     }
initgame('start');