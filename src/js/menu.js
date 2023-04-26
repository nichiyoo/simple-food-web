document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const filterForm = document.getElementById('filterForm');
	const foodContainer = document.getElementById('foodContainer');
	const navCart = document.querySelector('a[href="cart.html"]');

	fetchFood()
		.then((data) => {
			setFilterValue(filterForm);

			if (data.hasOwnProperty('status') && data.status === 'Error') {
				renderEmptyCard(foodContainer);
				return;
			}

			const { dishes, pagination } = data;

			if (dishes.length === 0) {
				renderEmptyCard(foodContainer);
				return;
			}

			renderCard(dishes, foodContainer);

			const foodCard = foodContainer.querySelectorAll('#foodCard');
			foodCard.forEach((card) => {
				const button = card.querySelector('button');
				const spinner = button.querySelector('span');
				button.addEventListener('click', (event) => {
					event.preventDefault();
					deactivateButton(button, spinner);

					const id = button.getAttribute('data-id');
					orderFood(id)
						.then((data) => {
							let current = parseInt(navCart.getAttribute('data-count'));
							navCart.setAttribute('data-count', current + 1);
							triggerToast(data.message);
						})
						.catch((error) => {
							if (error instanceof Unauthorized) {
								triggerToast(error.message);
								localStorage.removeItem('token');
								setTimeout(() => {
									window.location.href = 'login.html';
								}, 1500);
							} else {
								console.error(error.message);
								triggerToast(error.message);
							}
						});

					setTimeout(() => {
						activateButton(button, spinner);
					}, 500);
				});
			});

			const { _, count, current } = pagination;
			$('#pagination').Pagination(
				{
					size: count,
					pageShow: count,
					page: current,
				},
				(obj) => {
					const url = new URL(window.location.origin + window.location.pathname);
					const param = new URLSearchParams(window.location.search);
					param.set('page', obj.page);
					url.search = param;
					window.location = url;
				}
			);
		})
		.catch((error) => {
			console.error(error);
			triggerToast(error.message);
		});

	filterForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const button = event.submitter;
		const spinner = button.querySelector('span');
		deactivateButton(button, spinner);

		const url = new URL(window.location.origin + window.location.pathname);
		const param = new URLSearchParams();

		const vegetarian = filterForm.querySelector('#vegetarian').checked;
		const categories = $('#categories').selectpicker().val();
		const sorting = $('#sorting').selectpicker().val();

		sorting !== '' && param.set('sorting', sorting);
		vegetarian && param.set('vegetarian', vegetarian);
		categories && categories.forEach((category) => param.append('categories', category));
		url.search = param;

		setTimeout(() => {
			window.location = url;
			activateButton(button, spinner);
		}, 500);
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

class Unauthorized extends Error {
	constructor(message) {
		super(message);
		this.name = 'Unauthorized';
	}
}

async function fetchFood() {
	const url = new URL('https://food-delivery.kreosoft.ru/api/dish');
	const param = new URLSearchParams(window.location.search);
	url.search = param;

	const response = await fetch(url);
	const data = await response.json();
	return data;
}

async function orderFood(id) {
	const token = localStorage.getItem('token');
	if (!token) throw new Unauthorized('You are not authorized');

	const url = new URL(`https://food-delivery.kreosoft.ru/api/basket/dish/${id}`);
	const header = new Headers();
	header.append('Content-Type', 'application/json');
	header.append('Authorization', `Bearer ${token}`);

	const response = await fetch(url, {
		method: 'POST',
		headers: header,
	});

	if (response.status === 401) throw new Unauthorized('You are not authorized');
	if (response.ok) return { message: 'Food ordered' };
}

function setFilterValue(filterForm) {
	const param = new URLSearchParams(window.location.search);
	const categories = param.getAll('categories');
	const sorting = param.get('sorting');
	const vegetarian = param.get('vegetarian');

	$('#categories').selectpicker('val', categories);
	$('#sorting').selectpicker('val', sorting);
	vegetarian && (filterForm.querySelector('#vegetarian').checked = true);
}

function activateButton(button, spinner) {
	button.disabled = false;
	spinner.classList.add('d-none');
}

function deactivateButton(button, spinner) {
	button.disabled = true;
	spinner.classList.remove('d-none');
}

function renderEmptyCard(container) {
	container.innerHTML = `
	<div class="col-12">
		<div class="d-flex py-5 justify-content-center align-items-center text-center">
				<h6>No Dishes Found</h6>
		</div>
	</div>`;
}

function renderCard(dishes, container) {
	const star = `
	<svg
		xmlns="http://www.w3.org/2000/svg"
		enable-background="new 0 0 24 24"
		height="24px"
		viewBox="0 0 24 24"
		width="24px"
		fill="#000000"
		class="star active">
		<g>
			<path d="M0 0h24v24H0V0z" fill="none" />
			<path d="M0 0h24v24H0V0z" fill="none" />
		</g>
		<g>
			<path
				d="m12 17.27 4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z" />
		</g>
	</svg>`;

	container.innerHTML = '';
	dishes.forEach((dish) => {
		const card = document.createElement('div');
		card.classList.add('col-12', 'col-md-6', 'col-lg-4', 'col-xl-3');
		card.id = 'foodCard';

		let { id, name, image, category, description, price, rating, vegetarian } = dish;
		rating = Math.ceil(dish.rating / 2);

		card.innerHTML = `
		<div class="card h-100 rounded-3 overflow-hidden position-relative" class="foodCard">
			<img
				src="${image}"
				class="card-img-top object-fit-cover"
				alt="${name}" />
			<div class="p-4">
				<h6>${name}</h6>
				<div class="d-flex justify-content-between align-item-center">
					<p>${category}</p>
					<p id="star" aria-label="${rating}"></p>
				</div>
				<p class="pb-5">${description}</p>
			</div>
			<div class="card-footer w-100 position-absolute bottom-0 bg-white d-flex justify-content-between align-items-center">
				<span>$${price}</span>
				<button class="btn btn-deats" id="orderButton" data-id="${id}">
					<span
						class="spinner-border spinner-border-sm me-2 d-none"
						role="status"
						aria-hidden="true"
						id="orderSpinner">
					</span>
					Add to cart
				</button>
			</div>
			${vegetarian ? '<span class="vegetarian position-absolute top-0 end-0 px-2 py-1 rounded-3 m-2">Vegetarian</span>' : ''}
		</div>
		`;

		container.appendChild(card);
		const starRating = card.querySelector('#star');

		Array.from({ length: 5 }, (_, index) => {
			starRating.innerHTML += star;
			index > dish.rating && starRating.lastChild.classList.remove('active');
		});
	});
}
