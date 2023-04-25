document.addEventListener('DOMContentLoaded', function () {
	const bootstrap = window.bootstrap;
	const setMask = window.IMask;

	const registerForm = document.getElementById('registerForm');
	const registerButton = registerForm.querySelector('button');
	const registerSpinner = registerButton.querySelector('#registerSpinner');

	const phone = document.getElementById('phone');
	setMask(phone, { mask: '+{7} (000) 000-00-00' });

	registerForm.addEventListener('submit', async (event) => {
		deactivateButton(registerButton, registerSpinner);
		event.preventDefault();

		if (!registerForm.checkValidity()) {
			event.stopPropagation();
			activateButton(registerButton, registerSpinner);
		}

		registerForm.classList.add('was-validated');

		const registerData = {
			fullName: registerForm.elements.name.value,
			password: registerForm.elements.password.value,
			email: registerForm.elements.email.value,
			address: registerForm.elements.address.value,
			birthDate: new Date(registerForm.elements.dob.value).toISOString(),
			gender: registerForm.elements.gender.value,
			phoneNumber: registerForm.elements.phone.value,
		};

		try {
			const url = new URL('https://food-delivery.kreosoft.ru/api/account/register');
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registerData),
			});

			if (response.ok) {
				const data = await response.json();
				localStorage.setItem('token', data.token);
				window.location.href = 'menu.html';
			} else {
				const data = await response.json();

				if (Object.keys(data).includes('DuplicateUserName')) {
					const email = registerForm.elements.email;
					email.classList.add('is-invalid');
					email.nextElementSibling.innerHTML = data.DuplicateUserName[0];
					activateButton(registerButton, registerSpinner);
					return;
				}

				const { errors } = data;
				Object.keys(errors).forEach((key) => {
					const input = registerForm.elements[key.toLowerCase()];
					input.classList.add('is-invalid');
					input.nextElementSibling.innerHTML = errors[key][0];
				});

				triggerToast(data.title);
			}
		} catch (error) {
			triggerToast(error.message);
			console.error(error);
		}

		activateButton(registerButton, registerSpinner);
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
