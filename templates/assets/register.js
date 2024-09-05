function startregister() {

    const form = document.getElementById('register-form');
    const formErrors = document.getElementById('form-errors');
    
    if (!form) {
        console.log('Le formulaire avec l\'ID "register-form" est introuvable.');
        return;
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        formErrors.textContent = '';

        const formData = new FormData(form);
        const password = formData.get('password');
        const password2 = formData.get('password2');
        const errors = [];

        if (password !== password2) {
            errors.push('Les mots de passe ne correspondent pas.');
        }
        
        if (password.length < 8) {
            errors.push('Le mot de passe doit comporter au moins 8 caractères.');
        }

        if (errors.length > 0) {
            formErrors.textContent = errors.join(' ');
            return;
        }

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.href = data.redirect_url;
            } else {
                formErrors.textContent = Object.values(data.errors).join(' ');
            }
        })
        .catch(error => {
            formErrors.textContent = 'Une erreur est survenue. Veuillez réessayer.';
            console.log('Erreur:', error);
        });
    });
}

startregister();
