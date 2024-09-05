function startProfileUpdate() {
    const form = document.getElementById('profile-update-form');
    const formErrors = document.getElementById('form-errors');

    if (!form) {
        console.log('Le formulaire avec l\'ID "profile-update-form" est introuvable.');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        formErrors.textContent = '';

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => {
            console.log("ici1");
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Erreur réseau');
                });
            }
            console.log("ici2");
            loadProfile();
            return ;
        })
        .then(data => {
            console.log("ici3");
            if (data.success) {
                console.log("ici4");
                loadProfile();
            } else {
                console.log("ici5");
                formErrors.textContent = Object.values(data.errors).join(' ');
            }
        })
        .catch(error => {
            formErrors.textContent = 'Une erreur est survenue. Veuillez réessayer.';
            console.log('Erreur:', error);
        });
    });
}

startProfileUpdate();
