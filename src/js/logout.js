document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const logoutForm = document.getElementById('logoutForm');
	const logoutButton = logoutForm.querySelector('button');
	const logoutSpinner = logoutForm.querySelector('#logoutSpinner');

	logoutForm.addEventListener('submit', async (event) => {
		deactivateButton(logoutButton, logoutSpinner);

		event.preventDefault();

		const token = localStorage.getItem('token');
		if (!token) {
			triggerToast('You are not logged in');
			await timer(2000);
			activateButton(logoutButton, logoutSpinner);
			window.location.href = 'login.html';
			return;
		}

		try {
			const url = new URL('https://food-delivery.kreosoft.ru/api/account/logout');

			const headers = new Headers();
			headers.append('Content-Type', 'application/json');
			headers.append('Authorization', `Bearer ${token}`);

			const response = await fetch(url, {
				method: 'POST',
				headers,
			});

			if (response.ok) {
				localStorage.removeItem('token');
				window.location.href = 'login.html';
			} else {
				const data = await response.json();
				triggerToast(data.message);
			}
		} catch (error) {
			triggerToast(error.message);
			console.error(error);
		}

		activateButton(logoutButton, logoutSpinner);
	});

	function triggerToast(message) {
		const toast = document.getElementById('liveToast');
		const trigger = bootstrap.Toast.getOrCreateInstance(toast);

		toast.querySelector('.toast-body').innerHTML = message;
		trigger.show();
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

function timer(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
