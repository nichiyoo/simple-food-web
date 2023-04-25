document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;

	const filterForm = document.getElementById('filterForm');
	const filterButton = filterForm.querySelector('button');
	const filterSpinner = filterForm.querySelector('#filterSpinner');

	const foodContainer = document.getElementById('foodContainer');

	async function getFood({ page, sorting, categories, vegetarian }) {
		const url = new URL('https://food-delivery.kreosoft.ru/api/dish');
		const target = new URL(window.location.origin + window.location.pathname);

		const param = new URLSearchParams();
		page && param.set('page', page);
		sorting && param.set('sorting', sorting);
		vegetarian && param.set('vegetarian', vegetarian);
		categories && categories.forEach((category) => param.append('categories', category));

		url.search = param;
		target.search = param;
		window.history.pushState({}, '', target);

		const response = await fetch(url);
		const data = await response.json();
		return data;
	}

	getFood({})
		.then((data) => {
			const { dishes, pagination } = data;
			renderCard(dishes, foodContainer);
		})
		.catch((error) => {
			triggerToast(error.message);
			console.error(error);
		});

	filterForm.addEventListener('submit', async (event) => {
		deactivateButton(filterButton, filterSpinner);
		event.preventDefault();

		const filterDataObj = {
			vegetarian: filterForm.querySelector('#vegetarian').checked,
			categories: $('#categories').selectpicker().val(),
			sorting: filterForm.querySelector('#sorting').value,
		};

		filterDataObj.sorting === 'Default' && delete filterDataObj.sorting;
		filterDataObj.categories.length === 0 && delete filterDataObj.categories;

		try {
			const data = await getFood(filterDataObj);
			if (data.status === 'Error') {
				renderEmptyCard(foodContainer);
				activateButton(filterButton, filterSpinner);
				return;
			}
			const { dishes, pagination } = data;
			renderCard(dishes, foodContainer);
		} catch (error) {
			triggerToast(error.message);
			console.error(error);
		}

		activateButton(filterButton, filterSpinner);
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
		card.classList.add('col');
		card.id = 'foodCard';

		let { id, name, image, category, description, price, rating, vegetarian } = dish;
		rating = Math.ceil(dish.rating / 2);

		card.innerHTML = `
		<div class="card h-100 rounded-3 overflow-hidden position-relative">
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
				<a href="/order.html?id=${id}" class="btn btn-deats">Order</a>
			</div>
			${vegetarian ? '<span class="vegetarian position-absolute top-0 end-0 px-2 py-1 rounded-3 m-2">Vegetarian</span>' : ''}
		</div>
		`;

		container.appendChild(card);
		const starRating = card.querySelector('#star');

		Array.from({ length: 5 }, (_, i) => {
			starRating.innerHTML += star;
			i < dish.rating && starRating.lastChild.classList.add('active');
		});
	});
}
