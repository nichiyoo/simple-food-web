localStorage.getItem('token') && (window.location.href = 'menu.html');

document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const form = document.getElementById('loginForm');
	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		const button = form.querySelector('button');
		const spinner = button.querySelector('span');
		deactivateButton(button, spinner);

		form.classList.remove('was-validated');
		form.querySelectorAll('.is-invalid').forEach((element) => {
			element.classList.remove('is-invalid');
		});

		if (!form.checkValidity()) {
			event.stopPropagation();
			setTimeout(() => {
				form.classList.add('was-validated');
				activateButton(button, spinner);
			}, 1500);
			return;
		}

		const loginData = {
			email: document.getElementById('email').value,
			password: document.getElementById('password').value,
		};

		try {
			const url = new URL('https://food-delivery.kreosoft.ru/api/account/login');
			const header = new Headers();
			header.append('Content-Type', 'application/json');

			const response = await fetch(url, {
				method: 'POST',
				headers: header,
				body: JSON.stringify(loginData),
			});

			const data = await response.json();

			if (response.ok) {
				localStorage.setItem('token', data.token);
				window.location.href = 'menu.html';
			} else {
				form.querySelector('#email').classList.add('is-invalid');
				form.querySelector('#password').classList.add('is-invalid');

				form.querySelector('#email').nextElementSibling.innerHTML = 'Please check your email.';
				form.querySelector('#password').nextElementSibling.innerHTML = 'Please check your password.';

				form.classList.add('was-validated');
				activateButton(button, spinner);
			}
		} catch (error) {
			console.error(error);
			triggerToast(error.message);
		}

		activateButton(button, spinner);
	});

	function triggerToast(message) {
		const toast = document.getElementById('liveToast');
		const trigger = bootstrap.Toast.getOrCreateInstance(toast);
		toast.querySelector('.toast-body').innerHTML = message;
		trigger.show();
		setTimeout(() => {
			trigger.hide();
		}, 1500);
	}
});

function activateButton(button, spinner) {
	button.disabled = false;
	spinner.classList.add('d-none');
}

function deactivateButton(button, spinner) {
	button.disabled = true;
	spinner.classList.remove('d-none');
}
