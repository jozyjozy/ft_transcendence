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

function initgroup(){
    let data = document.getElementById('User').getAttribute('rq');
    let start = data.indexOf('[');
    let end = data.indexOf(']');
    let profilesString = data.substring(start + 1, end);

    let profilesArray = profilesString.split(', ');

    let profileNames = profilesArray.map(profile => {

    let startIndex = profile.indexOf(': ') + 2;
    let endIndex = profile.indexOf(' Profile');

    return profile.substring(startIndex, endIndex);
});
	Ws = new WebSocket(`wss://${window.location.host}${window.location.pathname}/`);
    const blockedUsers = profileNames;
    Ws.onopen = function(e) {
        console.log("connected");
    };

    Ws.onclose = function(e) {
        ;
    };
    messageAndEventList = document.getElementById('Message');
    messageAndEventList = messageAndEventList.getAttribute('rq');

    messageAndEventList = messageAndEventList.slice(1, -1);
    messageAndEventList = messageAndEventList.split('>, <');
    let chatLog = document.querySelector('#chat-log');
    chatLog.value = "";
    messageAndEventList.forEach(messageEvent => {
        let message = messageEvent.substring(messageEvent.indexOf(":") + 1);
        author = "";
        if (message.indexOf("@") !== -1){
            message = message.substring(0,message.indexOf("@"));
            author = message.substring(message.indexOf(" ") + 1,message.indexOf(":-"));
            if (blockedUsers.includes(author)) {
                ;
            }
            else
                author = "";
        }
        if (author == "")
            chatLog.value += message + '\n';
    });
    Ws.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (blockedUsers.includes(data.author)) {
        return;
    }
    document.querySelector('#chat-log').value += (data.author + ":- " + data.message + '\n');
    var status = data.status
    user = data.user

    if (status == "Left"){
        document.getElementById( `members-${user}` ).remove()
    }else if(status == "Join"){
        var members_list = document.getElementById('members')
        var members_item = document.createElement("li")
        members_item.innerHTML = user
        members_item.setAttribute("id",  `members-${user}` )
        members_list.appendChild(members_item)
    }
};

    document.querySelector('#chat-message-input').focus();

    document.querySelector('#chat-message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {
            document.querySelector('#chat-message-submit').click();
        }
    };

    document.querySelector('#chat-message-submit').onclick = function(e) {
        const dataContainer = document.getElementById('request');
        const username = dataContainer.getAttribute('rq');
        const messageInputDom = document.querySelector('#chat-message-input');
        const message = messageInputDom.value;
        if (message.trim() !== "") {
            const messageData = {
                'type': "text_message",
                'author': username,
                'message': message
            };
            Ws.send(JSON.stringify(messageData));
            messageInputDom.value = '';}
    };
}

initgroup();