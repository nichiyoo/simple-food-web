document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const logoutForm = document.getElementById('logoutForm');
	const navCart = document.querySelector('a[href="cart.html"]');
	const navOrders = document.querySelector('a[href="order.html"]');
	const navProfile = document.querySelector('a[href="profile.html"]');

	class Unauthorized extends Error {
		constructor(message) {
			super(message);
			this.name = 'Unauthorized';
		}
	}

	getNavbar()
		.then((data) => {
			navProfile.innerHTML = data.email;
			navCart.setAttribute('data-count', data.carts);
		})
		.catch((error) => {
			[navCart, navOrders, navProfile, logoutForm].forEach((element) => {
				element.remove();
			});
			return;
		});

	logoutForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const button = event.submitter;
		const spinner = button.querySelector('span');
		deactivateButton(button, spinner);

		const token = localStorage.getItem('token');
		if (!token) {
			triggerToast('You are not logged in');
			setTimeout(() => {
				activateButton(button, spinner);
				window.location.href = 'login.html';
			}, 1500);
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
			} else if (response.status === 401) {
				throw new Unauthorized('Your session has expired');
			}
		} catch (error) {
			if (error instanceof Unauthorized) {
				triggerToast(error.message);
				setTimeout(() => {
					activateButton(button, spinner);
					window.location.href = 'login.html';
				}, 1500);
				return;
			}
			triggerToast(error.message);
		}

		activateButton(button, spinner);
	});

	async function getNavbar() {
		const token = localStorage.getItem('token');
		if (!token) throw new Unauthorized('You are not logged in');

		const urls = [
			'https://food-delivery.kreosoft.ru/api/basket',
			'https://food-delivery.kreosoft.ru/api/account/profile',
		];

		const headers = new Headers();
		headers.append('Content-Type', 'application/json');
		headers.append('Authorization', `Bearer ${token}`);

		const [dishResponse, profileResponse] = await Promise.all(
			urls.map((url) => fetch(url, { method: 'GET', headers }))
		);

		const output = {};

		if (dishResponse.ok && profileResponse.ok) {
			const [dishData, profileData] = await Promise.all([dishResponse.json(), profileResponse.json()]);
			output['carts'] = dishData.reduce((acc, dish) => acc + dish.amount, 0);
			output['email'] = profileData.email;
		}

		if (dishResponse.status === 401 || profileResponse.status === 401)
			throw new Unauthorized('Your session has expired');
		return output;
	}

	function triggerToast(message) {
		const toast = document.getElementById('liveToast');
		const trigger = bootstrap.Toast.getOrCreateInstance(toast);
		toast.querySelector('.toast-body').innerHTML = message;
		trigger.show();
		setTimeout(() => {
			trigger.hide();
		}, 1500);
	}

	function activateButton(button, spinner) {
		button.disabled = false;
		spinner.classList.add('d-none');
	}

	function deactivateButton(button, spinner) {
		button.disabled = true;
		spinner.classList.remove('d-none');
	}
});
