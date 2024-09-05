function updateButtons(action, profileId) {
    const buttonContainer = document.getElementById('buttonContainer');

    buttonContainer.innerHTML = '';


    switch(action) {
        case 'addFriend':
            buttonContainer.innerHTML += `<button id="removeFriendBtn" onclick="removeFriend(${profileId})">Remove Friend</button>`;
            buttonContainer.innerHTML += `<button id="blockBtn" onclick="blockUser(${profileId})">Block</button>`;
            break;
        case 'removeFriend':
            buttonContainer.innerHTML += `<button id="addFriendBtn" onclick="addFriend(${profileId})">Add Friend</button>`;
            buttonContainer.innerHTML += `<button id="blockBtn" onclick="blockUser(${profileId})">Block</button>`;
            break;
        case 'blockUser':
            buttonContainer.innerHTML += `<button id="unblockBtn" onclick="unblockUser(${profileId})">Unblock</button>`;
            break;
        case 'unblockUser':
            buttonContainer.innerHTML += `<button id="addFriendBtn" onclick="addFriend(${profileId})">Add Friend</button>`;
            buttonContainer.innerHTML += `<button id="blockBtn" onclick="blockUser(${profileId})">Block</button>`;
            break;
    }
}
function addFriend(profileId) {
    fetch(`/add_friend/?profile_id=` + profileId)
    updateButtons('addFriend', profileId);
}

function removeFriend(profileId) {
    fetch(`/remove_friend/?profile_id=` + profileId)
    updateButtons('removeFriend', profileId);
}

function blockUser(profileId) {
    fetch(`/block_user/?profile_id=` + profileId)
    updateButtons('blockUser', profileId);
}

function unblockUser(profileId) {
    fetch(`/unblock_user/?profile_id=` + profileId)
    updateButtons('unblockUser', profileId);
}
