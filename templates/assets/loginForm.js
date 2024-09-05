document.getElementById('login-form').addEventListener('submit', function(event) {
	event.preventDefault();

	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;

	fetch('/login_api/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: JSON.stringify({
			username: username,
			password: password
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			window.location.href = '/';
		} else {
			document.getElementById('error-message').textContent = data.message;
		}
	})
	.catch(error => {
		console.log('Error:', error);
	});
});

function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

window.addEventListener('load', function(event) {
    loadHomepage();
})
