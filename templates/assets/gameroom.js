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

function initgameroom() {
    Ws = new WebSocket(`wss://${window.location.host}/game/`);
    Ws.onopen = function(event) {
        console.log('client says connection opened');
        add_event_to_all_buttons();
    };

    Ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const type = message.type;
        const data = message.data;
        switch(type) {
            case "leave_room":
                leave_room_handler(data);
                break;
            case "join_room":
                join_room_handler(data);
                break;
            case "delete_room":
                delete_room_handler(data);
                break;
            case "add_room":
                add_room_handler(data);
                break;
            default:
                break;
        }
    }

    function leave_room_handler(uuid) {
        var leave_button = document.getElementById(`leave-${uuid}`);
        var open_button = document.getElementById(`open-${uuid}`);
        if (leave_button) leave_button.remove();
        if (open_button) open_button.remove();
        var button = `<button id="join-${uuid}" class="group_option" value="join_room ${uuid}">Join</button>`;
        var dev_body = document.getElementById(uuid);
        dev_body.innerHTML += button;
        add_event_to_all_buttons();
    }

    function join_room_handler(uuid) {
        var join_button = document.getElementById(`join-${uuid}`);
        if (join_button) join_button.remove();
        var leave_button = `<button id="leave-${uuid}" class="group_option" value="leave_room ${uuid}">Leave</button>`;
        var open_button = `<button id="open-${uuid}" class="group_option" value="open_room ${uuid}">Open</button>`;
        var dev_body = document.getElementById(uuid);
        dev_body.innerHTML += leave_button;
        dev_body.innerHTML += open_button;
        add_event_to_all_buttons();
    }

    function delete_room_handler(uuid) {
        var room_div = document.getElementById(uuid);
        if (room_div) room_div.remove();
    }

    function add_room_handler(room) {
        var room_list = document.getElementById("gameroom");
        var room_item = `
        <div id="${room.uuid}">
        <li><a>${room.name}</a></li>
        <button id="join-${room.uuid}" class="group_option" value="join_room ${room.uuid}">Join</button>
        <button id="delete-${room.uuid}" class="group_option" value="delete_room ${room.uuid}">Delete</button>
        </div>`;
        room_list.innerHTML += room_item;
        add_event_to_all_buttons();
    }

    function add_event_to_all_buttons() {
        const keys = document.querySelectorAll('.group_option');
        keys.forEach(item => { item.addEventListener('click', send_event_message) });
    }

    function loadgroup(url) {
        loadPage(url, 'content', RoomGameScriptSrc);
        window.history.pushState({ page: 'Game', url: url }, '', url);
    }

    function send_event_message(event) {
        const { target } = event;
        const room = target.value.split(" ");
        const room_uuid = room[1] || null;
        const action = room[0];
        if (action === "open_room") {
            loadgroup(`https://${window.location.host}/rooms/${room_uuid}`);
        } else if (action !== "add_room")   
            {
                const data = {
                    "type": action,
                    "data": room_uuid,
                };
                Ws.send(JSON.stringify(data));
        }
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        add_event_to_all_buttons();
    });

    document.getElementById('add-room').addEventListener('click', () => {
        const roomName = prompt("Enter new room name:");
        if (roomName) {
            const data = {
                "type": "add_room",
                "data": roomName,
            };
            Ws.send(JSON.stringify(data));
        }
    });
}

initgameroom();
