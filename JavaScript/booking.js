/* -------------------------------------------------
   booking.js – Full Booking Form with Validation
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  const selectionContainer = document.querySelector('.Selection');
  const passengersContainer = document.getElementById('passengersContainer');
  const addPassengerBtn = document.getElementById('addPassengerBtn');
  const passengerRadios = document.querySelectorAll('input[name="passengers"]');
  const departureDateInput = document.getElementById('departureDate');
  const message = document.getElementById('message');

  let passengerCount = 1;
  let maxPassengers = 1;

  // === 1. Passenger Radio Logic ===
  passengerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      maxPassengers = value === '1' ? 1 : value === '2' ? 2 : 6;

      // Remove extra fields if reducing
      while (passengerCount > maxPassengers) {
        const last = passengersContainer.lastElementChild;
        if (last) last.remove();
        passengerCount--;
      }

      addPassengerBtn.style.display = maxPassengers > 1 ? 'block' : 'none';
    });
  });

  // === 2. Accommodation Selection ===
  if (selectionContainer) {
    selectionContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.accommodation');
      if (!card) return;

      document.querySelectorAll('.accommodation').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      localStorage.setItem('selectedAccommodation', card.id);
    });

    // Restore saved
    const saved = localStorage.getItem('selectedAccommodation');
    if (saved) document.getElementById(saved)?.classList.add('selected');
  }

  // === 3. Add Passenger Button ===
  addPassengerBtn.addEventListener('click', () => {
    if (passengerCount >= maxPassengers) {
      alert(`Maximum ${maxPassengers} passengers allowed.`);
      return;
    }

    passengerCount++;
    const fields = document.createElement('div');
    fields.className = 'passenger-fields grid grid-cols-1 md:grid-cols-2 form-in pt-6';
    fields.dataset.passenger = passengerCount;

    fields.innerHTML = `
      <div class="flex flex-col input-control">
        <label class="text-xl">First Name (Passenger ${passengerCount})</label>
        <input id="fName${passengerCount}" type="text" class="form-input w-full px-4 py-3 my-2" placeholder="First name" required />
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Last Name (Passenger ${passengerCount})</label>
        <input id="lName${passengerCount}" type="text" class="form-input w-full px-4 py-3 my-2" placeholder="Last name" required />
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Email (Passenger ${passengerCount})</label>
        <input id="email${passengerCount}" type="email" class="form-input w-full px-4 py-3 my-2" placeholder="Email" required />
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Phone (Passenger ${passengerCount})</label>
        <input id="phone${passengerCount}" type="tel" class="form-input w-full px-4 py-3 my-2" placeholder="Phone" required />
        <div class="error"></div>
      </div>
    `;

    passengersContainer.appendChild(fields);
  });

  // === 4. Validation Helpers ===
  const setError = (input, msg) => {
    const control = input.parentElement;
    const error = control.querySelector('.error');
    error.textContent = msg;
    control.classList.add('error');
    control.classList.remove('success');
  };

  const setSuccess = (input) => {
    const control = input.parentElement;
    const error = control.querySelector('.error');
    error.textContent = '';
    control.classList.add('success');
    control.classList.remove('error');
  };

  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val) => /^\d{8,15}$/.test(val);
  const isAlpha = (val) => /^[A-Za-z\s]+$/.test(val.trim());

  // === 5. Validate All Fields ===
  const validateForm = () => {
    let valid = true;

    // Destination
    const dest = form.querySelector('#destination');
    if (!dest.value) {
      setError(dest, 'Please select a destination');
      valid = false;
    } else setSuccess(dest);

    // Departure Date
    const dateVal = departureDateInput.value;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateVal);
    if (!dateVal) {
      setError(departureDateInput, 'Departure date is required');
      valid = false;
    } else if (selected <= today) {
      setError(departureDateInput, 'Date must be in the future');
      valid = false;
    } else setSuccess(departureDateInput);

    // Accommodation
    if (!document.querySelector('.accommodation.selected')) {
      alert('Please select an accommodation type.');
      valid = false;
    }

    // Passengers
    for (let i = 1; i <= passengerCount; i++) {
      const fName = document.getElementById(`fName${i}`);
      const lName = document.getElementById(`lName${i}`);
      const email = document.getElementById(`email${i}`);
      const phone = document.getElementById(`phone${i}`);

      // First Name
      if (!fName.value.trim()) {
        setError(fName, 'First name required');
        valid = false;
      } else if (!isAlpha(fName.value)) {
        setError(fName, 'Only letters allowed');
        valid = false;
      } else setSuccess(fName);

      // Last Name
      if (!lName.value.trim()) {
        setError(lName, 'Last name required');
        valid = false;
      } else if (!isAlpha(lName.value)) {
        setError(lName, 'Only letters allowed');
        valid = false;
      } else setSuccess(lName);

      // Email
      if (!email.value.trim()) {
        setError(email, 'Email required');
        valid = false;
      } else if (!isEmail(email.value)) {
        setError(email, 'Invalid email');
        valid = false;
      } else setSuccess(email);

      // Phone
      if (!phone.value.trim()) {
        setError(phone, 'Phone required');
        valid = false;
      } else if (!isPhone(phone.value)) {
        setError(phone, '8–15 digits only');
        valid = false;
      } else setSuccess(phone);
    }

    return valid;
  };

  // === 6. Form Submit ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Collect Data
    const data = {
      destination: form.querySelector('#destination').value,
      departureDate: departureDateInput.value,
      passengers: passengerCount,
      accommodation: document.querySelector('.accommodation.selected')?.id || null,
      specialRequirements: message.value.trim(),
      travelers: []
    };

    for (let i = 1; i <= passengerCount; i++) {
      data.travelers.push({
        firstName: document.getElementById(`fName${i}`).value.trim(),
        lastName: document.getElementById(`lName${i}`).value.trim(),
        email: document.getElementById(`email${i}`).value.trim(),
        phone: document.getElementById(`phone${i}`).value.trim()
      });
    }

    console.log('Booking Submitted:', data);
    alert('Booking confirmed! Check console for details.');

    // Reset
    form.reset();
    document.querySelectorAll('.input-control').forEach(c => {
      c.classList.remove('success', 'error');
      c.querySelector('.error').textContent = '';
    });
    document.querySelectorAll('.accommodation').forEach(c => c.classList.remove('selected'));
    localStorage.removeItem('selectedAccommodation');

    // Reset to 1 passenger
    while (passengersContainer.children.length > 1) {
      passengersContainer.removeChild(passengersContainer.lastChild);
    }
    passengerCount = 1;
    maxPassengers = 1;
    document.getElementById('solo').checked = true;
    addPassengerBtn.style.display = 'none';
  });
});