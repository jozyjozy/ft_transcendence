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

function initChat()
{
	Ws = new WebSocket(`wss://${window.location.host}/`);
    Ws.onopen = function(event) {
		add_event_to_all_buttons();
    }

    Ws.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const type = message.type;
        const data = message.data;

        switch(type) {
            case "leave_group":
                leave_group_handler(data);
                break;
            case "join_group":
                join_group_handler(data);
                break;
            case "delete_group":
                delete_group_handler(data);
                break;
            case "add_group":
                add_group_handler(data);
                break;
            default :
                break;
        }
    }

    function leave_group_handler(uuid) {
        var leave_button = document.getElementById(`leave-${uuid}`);
        var open_button = document.getElementById(`open-${uuid}`);
        if (leave_button) leave_button.remove();
        if (open_button) open_button.remove();
        var button = `<button id="join-${uuid}" class="group_option" value="join_group ${uuid}">Join</button>`;
        var dev_body = document.getElementById(uuid);
        dev_body.innerHTML += button;
        add_event_to_all_buttons();
    }

    function join_group_handler(uuid) {
        var join_button = document.getElementById(`join-${uuid}`);
        if (join_button) join_button.remove();
        var leave_button = `<button id="leave-${uuid}" class="group_option" value="leave_group ${uuid}">Leave</button>`;
        var open_button = `<button id="open-${uuid}" class="group_option" value="open_group ${uuid}">Open</button>`;
        var dev_body = document.getElementById(uuid);
        dev_body.innerHTML += leave_button;
        dev_body.innerHTML += open_button;
        add_event_to_all_buttons();
    }

    function delete_group_handler(uuid) {
        var group_div = document.getElementById(uuid);
        if (group_div) group_div.remove();
    }

    function add_group_handler(group) {
        var group_list = document.getElementById("list");
        var group_item = `
        <div id="${group.uuid}">
        <li><a>${group.name}</a></li>
        <button id="join-${group.uuid}" class="group_option" value="join_group ${group.uuid}">Join</button>
        <button id="delete-${group.uuid}" class="group_option" value="delete_group ${group.uuid}">Delete</button>
        </div>`;
        group_list.innerHTML += group_item;
        add_event_to_all_buttons();
    }

    function add_event_to_all_buttons() {
        const keys = document.querySelectorAll('.group_option');
        keys.forEach(item => { item.addEventListener('click', send_event_message) });
    }

    function loadgroup(url) {
        loadPage(url, 'content', GroupChatScriptSrc);
        window.history.pushState({ page: 'Group', url: url }, '', url);
    }

    function send_event_message(event) {
        const { target } = event;
        const group = target.value.split(" ");
        const group_uuid = group[1] || null;
        const action = group[0];
        if (action === "open_group") {
            loadgroup(`https://${window.location.host}/groups/${group_uuid}`);
        } else if (action !== "add_group"){
            const data = {
                "type": action,
                "data": group_uuid,
            };
            Ws.send(JSON.stringify(data));
        }
    }
    document.addEventListener('DOMContentLoaded', (event) => {
        add_event_to_all_buttons();
    });
    document.getElementById('add-group').addEventListener('click', () => {
        const groupName = prompt("Enter new group name:");
        if (groupName) {
            const data = {
                "type": "add_group",
                "data": groupName,
            };
            Ws.send(JSON.stringify(data));
        }
    });
}
initChat();

window.addEventListener('load', function(event) {
    loadHomepage();
})
