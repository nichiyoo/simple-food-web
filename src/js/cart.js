!localStorage.getItem('token') && (window.location.href = 'login.html');

document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;
	const cartContainer = document.getElementById('cartContainer');
	const navCart = document.querySelector('a[href="cart.html"]');

	async function getCart() {
		const token = localStorage.getItem('token');
		const url = new URL('https://food-delivery.kreosoft.ru/api/basket');
		const header = new Headers();
		header.append('Content-Type', 'application/json');
		header.append('Authorization', `Bearer ${token}`);

		const response = await fetch(url, {
			method: 'GET',
			headers: header,
		});

		if (response.status === 401) throw new Unauthorized('Your session has expired');
		const data = await response.json();
		return data;
	}

	async function updateFood(id, method) {
		const token = localStorage.getItem('token');
		const url = new URL(`https://food-delivery.kreosoft.ru/api/basket/dish/${id}`);
		const header = new Headers();
		header.append('Content-Type', 'application/json');
		header.append('Authorization', `Bearer ${token}`);

		method == 'decrease' && url.searchParams.append('increase', true);
		method == 'delete' && url.searchParams.append('increase', false);

		const response = await fetch(url, {
			method: method == 'increase' ? 'POST' : 'DELETE',
			headers: header,
		});

		if (response.ok) {
			if (method == 'increase') return { message: 'Food added to cart' };
			if (method == 'decrease') return { message: 'Food removed from cart' };
			if (method == 'delete') return { message: 'Food deleted from cart' };
			throw new Error('Unhandled method');
		}

		if (response.status === 401) throw new Unauthorized('Your session has expired');
		return { message: 'Something went wrong' };
	}

	getCart()
		.then((data) => {
			const carts = data;

			if (carts.length === 0) {
				renderEmptyCart(cartContainer);
				return;
			}

			renderCart(carts, cartContainer);
			const cartCards = document.querySelectorAll('#cartCard');

			cartCards.forEach((card) => {
				const id = card.getAttribute('data-id');
				const buttons = card.querySelectorAll('button');
				const count = card.querySelector('#cartAmount');

				buttons.forEach((button) => {
					button.addEventListener('click', (e) => {
						e.preventDefault();

						let amount = parseInt(count.textContent);
						let current = parseInt(navCart.getAttribute('data-count'));
						const method = button.getAttribute('data-method');

						switch (method) {
							case 'increase':
								amount++;
								count.textContent = amount;
								navCart.setAttribute('data-count', current + 1);
								break;
							case 'decrease':
								amount--;
								count.textContent = amount;
								navCart.setAttribute('data-count', current - 1);

								break;
							case 'delete':
								count.textContent = 0;
								navCart.setAttribute('data-count', current - amount);
								break;
							default:
								throw new Error('Unhandled method');
						}

						if (count.textContent == 0) card.remove();
						if (cartContainer.children.length === 0) renderEmptyCart(cartContainer);

						updateFood(id, method)
							.then((data) => {
								triggerToast(data.message);
							})
							.catch((error) => {
								if (error instanceof Unauthorized) {
									triggerToast(error.message);
									setTimeout(() => {
										window.location.href = 'login.html';
									}, 1500);
								} else {
									console.error(error);
									triggerToast(error.message);
									setTimeout(() => {
										window.location.reload();
									}, 1500);
								}
							});
					});
				});
			});
		})
		.catch((error) => {
			if (error instanceof Unauthorized) {
				triggerToast(error.message);
				setTimeout(() => {
					window.location.href = 'login.html';
				}, 1500);
			} else {
				console.error(error);
				triggerToast(error.message);
			}
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

function renderEmptyCart(container) {
	container.innerHTML = `
	<div class="col-12">
		<div class="d-flex py-5 justify-content-center align-items-center text-center">
			<h6>Your cart is empty</h6>
		</div>
	</div>`;
}

function renderCart(carts, container) {
	container.innerHTML = '';
	carts.forEach((cart) => {
		const { name, price, totalPrice, amount, image, id } = cart;

		const card = document.createElement('div');
		card.classList.add('card', 'mb-4', 'rounded-3', 'overflow-hidden');
		card.setAttribute('id', 'cartCard');
		card.setAttribute('data-id', id);

		card.innerHTML = `
		<div class="row g-0">
			<div class="col-12 col-xl-4">
				<img
					src="${image}"
					class="card-img-top object-fit-cover h-100"
					alt="food image" />
			</div>
			<div class="col-12 col-xl-8 position-relative">
				<div class="card-body mb-5">
					<h6>${name}</h6>
					<p>$${price}</p>
				</div>
				<div
					class="card-footer w-100 position-absolute bottom-0 bg-white d-flex align-items-center justify-content-between">
					<span>Total Price $${totalPrice}</span>
					<div class="d-flex align-items-center justify-content-end">
						<button class="btn btn-deats square" data-method="increase">+</button>
						<span class="mx-3" id="cartAmount">
							${amount}
						</span>
						<button class="btn btn-deats square me-3" data-method="decrease">-</button>
						<button class="btn btn-danger btn-sm" data-method="delete">delete</button>
					</div>
				</div>
			</div>
		</div>
		`;
		container.appendChild(card);
	});
}

class Unauthorized extends Error {
	constructor(message) {
		super(message);
		this.name = 'Unauthorized';
	}
}
