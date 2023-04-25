document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const loginForm = document.getElementById('loginForm');
	const loginButton = loginForm.querySelector('button');
	const loginSpinner = loginButton.querySelector('#loginSpinner');

	loginForm.addEventListener('submit', async (e) => {
		loginButton.disabled = true;
		loginSpinner.classList.remove('d-none');

		e.preventDefault();

		const loginData = {
			email: document.getElementById('email').value,
			password: document.getElementById('password').value,
		};

		try {
			const url = new URL('https://food-delivery.kreosoft.ru/api/account/login');
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(loginData),
			});

			if (response.ok) {
				const data = await response.json();
				localStorage.setItem('token', data.token);
				window.location.href = 'menu.html';
			} else {
				const data = await response.json();
				triggerToast(data.message);
			}
		} catch (error) {
			triggerToast(error.message);
			console.error(error);
		}

		loginButton.disabled = false;
		loginSpinner.classList.add('d-none');
	});

	function triggerToast(message) {
		const toast = document.getElementById('liveToast');
		const trigger = bootstrap.Toast.getOrCreateInstance(toast);
		toast.querySelector('.toast-body').innerHTML = message;
		trigger.show();
	}
});
