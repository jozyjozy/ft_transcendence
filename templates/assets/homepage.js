
function loadPage(url, targetId, scriptSrc = null) {
    killsocket();
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(targetId).innerHTML = data;
            document.getElementById('content').style.display = "block";
            document.getElementById('content2').style.display = "none";

            if (scriptSrc) {
                var script = document.createElement('script');
                script.src = scriptSrc;
                document.body.appendChild(script);
            }
        })
        .catch(error => {
            console.log('There was a problem with the fetch operation:', error);
        });
}

let player1 = "";
let player2 = "";
let player3 = "";
let player4 = "";
let winner1 = '';
let winner2 = '';
let loser1 = '';
let loser2 = '';
let loserFinal = '';
let winnerFinal = '';
let first = '';
let second = '';
let third = '';
let forth = '';

function loadgamepriv() {
    console.log(window. location. href)
    url = (window. location. href)
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}/;
    const uuidMatch = url.match(uuidRegex);
    console.log(uuidMatch[0])
    url = `https://${window.location.host}/rooms/${uuidMatch[0]}`;
    loadPage(url, 'content', RoomGameScriptSrc);
    window.history.pushState({ page: 'Game', url: url }, '', url);
}

function killsocket(){
    if (Ws && Ws.readyState !== WebSocket.CLOSED) {
        Ws.close();
        console.log("WebSocket connection closed");
    } else if (Ws){
        console.log("WebSocket connection is already closed or does not exist");
    } else {
        console.log("Chatsocket = null")
    }
}

function loadHomepage()
{
	document.getElementById('content').style.display = "none";
	document.getElementById('content2').style.display = "block";
	window.history.pushState({ page: 'homepage' }, '', '/');
}

function loadChat() {
    var url = chatUrl;
    loadPage(url, 'content', chatScriptSrc);
    window.history.pushState({ page: 'chat', url: url }, '', url);
}

function loadAuth() {
    redirect(authurl)
}

function loadProfile() {
    var url = profileUrl;
    loadPage(url, 'content');
    window.history.pushState({ page: 'profile', url: url }, '', url);
}

function loadcom(element)
    {
        url = "/profile/" + element.id;
        loadPage(url, 'content', see_profileScript);
        window.history.pushState({ page: 'Userlist', url: url }, '', url);
    }

function loadUserList() {
    var url = listUserUrl;
    loadPage(url, 'content');
    window.history.pushState({ page: 'profile', url: url }, '', url);
}

function loadLogin() {
    var url = loginUrl;
    loadPage(url, 'content', loginScriptSrc);
    window.history.pushState({ page: 'login', url: url }, '', url);
}

function loadRegister() {
    url = registerUrl;
    loadPage(url, 'content', registerScript);
    window.history.pushState({ page: 'register', url: url }, '', url);
}

function loadEditProfile() {
    var url = editProfileUrl;
    loadPage(url, 'content',updateprofileScript);
    window.history.pushState({ page: 'editProfile', url: url }, '', url);
}

function loadPongRoom() {
    var url = pongRoomUrl;
    loadPage(url, 'content', GameRoomScriptSrc);
    window.history.pushState({ page: 'pongRoom', url: url }, '', url);
}

function loadPongLocal() {
    const userDataElement = document.getElementById('user-username');
    const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
    var url = pongLocalUrl + username;
    loadPage(url, 'content', PongLocalScriptSrc);
    window.history.pushState({ page: 'pongRoom', url: url }, '', url);
}

function loadPongLocalAi() {
    const userDataElement = document.getElementById('user-username');
    const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
    var url = pongLocalAiUrl + username;
    loadPage(url, 'content', PongLocalAiScriptSrc);
    window.history.pushState({ page: 'pongRoom', url: url }, '', url);
}

function loadPong() {
    var url = pongUrl;
    loadPage(url, 'content', pongScriptSrc);
    window.history.pushState({ page: 'pong', url: url }, '', url);
}

function loadTournement() {
    const userDataElement = document.getElementById('user-username');
    const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
    var url = TournementUrl + username;
    loadPage(url, 'content', TornementScriptSrc);
    window.history.pushState({ page: 'Tornement', url: url }, '', url);
}

window.addEventListener('popstate', function(event) {
    if (event.state) {
        if (event.state.url) {
            console.log(event.state.url);
            if (event.state.url == pongUrl)
            {
                loadPage(event.state.url, 'content', pongScriptSrc);
            }
            else if (event.state.url == chatUrl)
            {
                loadPage(event.state.url, 'content', chatScriptSrc);
            }
            else if (event.state.url === chatgroup) {
                loadPage(event.state.url, 'content', GroupChatScriptSrc);
            }
            else if (event.state.url == pongRoomUrl)
            {
                    loadPage(event.state.url, 'content', GameRoomScriptSrc);
            }
            else if (event.state.url == loginUrl)
            {
                loadPage(event.state.url, 'content', loginScriptSrc);
            }
            else if (event.state.url === listUserUrl) {
                loadPage(event.state.url, 'content');
            }
            else if (event.state.url === profileUrl) {
                loadPage(event.state.url, 'content');
            }
            else if (event.state.url === editProfileUrl) {
                loadPage(event.state.url, 'content');
            }
            else if (event.state.url === registerUrl) {
                loadPage(event.state.url, 'content');
            }
            else if (event.state.url.includes(pongLocalUrl)) {
                const userDataElement = document.getElementById('user-username');
                const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
                var url = pongLocalUrl + username;
                loadPage(url, 'content', PongLocalScriptSrc);
            }
            else if (event.state.url.includes(pongLocalAiUrl)) {
                console.log("la");
                const userDataElement = document.getElementById('user-username');
                const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
                var url = pongLocalAiUrl + username;
                loadPage(url, 'content', PongLocalAiScriptSrc);;
                // initgame();
            }
            else if (event.state.url.includes(TournementUrl)) {
                const userDataElement = document.getElementById('user-username');
                const username = userDataElement ? userDataElement.getAttribute('data-username') : 'guest';
                var url = TournementUrl + username;
                loadPage(event.state.url, 'content', TornementScriptSrc);
            }
            else
            {
                loadPage(event.state.url, 'content');
            }
        } else if (event.state.page === 'homepage') {
            loadHomepage();
        }
    } else {
        loadHomepage();
    }
});
