document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  const selectionContainer = document.querySelector('.Selection');
  const passengersContainer = document.getElementById('passengersContainer');
  const addPassengerBtn = document.getElementById('addPassengerBtn');
  const passengerRadios = document.querySelectorAll('input[name="passengers"]');
  const departureDateInput = document.getElementById('departureDate');
  const message = document.getElementById('message');
  const destinationSelect = document.getElementById('destination');
  let passengerCount = 1;
  let maxPassengers = 1;
  let destinationsData = [];
  let accommodationsData = []; // For prices and details

  /* Fetch destinations */
  fetch('data/destinations.json')
    .then(r => r.ok ? r.json() : Promise.reject('Network error'))
    .then(data => {
      destinationsData = data.destinations;
      const optionsHTML = data.destinations.map(dest =>
        `<option value="${dest.id}">${dest.name} – $${dest.price.toLocaleString()} ${dest.currency} – ${dest.distance}</option>`
      ).join('');
      destinationSelect.insertAdjacentHTML('beforeend', optionsHTML);
    })
    .catch(console.error);

  /* Fetch accommodations with prices/details */
  fetch('data/accommodations.json')
    .then(r => r.ok ? r.json() : Promise.reject('Network error'))
    .then(data => {
      accommodationsData = data.accommodations;
      renderAccommodationCards(); // Generate cards dynamically
    })
    .catch(console.error);

  /* Dynamically render accommodation cards from JSON */
  const renderAccommodationCards = () => {
    selectionContainer.innerHTML = ''; // Clear any hard-coded cards
    accommodationsData.forEach(accom => {
      const card = document.createElement('div');
      card.id = accom.id;
      card.className = 'px-6 py-3 accommodation text-2xl';
      card.style.display = 'none'; // Hidden until destination selected
      card.innerHTML = `
        <h3 class="text-[#0ea8ed] font-orbitron">${accom.name}</h3>
        <p class="text-xl font-light">${accom.shortDescription}</p>
        <p class="price-per-day text-neon-cyan font-bold mt-2">$${accom.pricePerDay.toLocaleString()}/day</p>
        <ul class="features mt-2 text-sm space-y-1 text-gray-300">
          ${accom.features.map(f => `<li class="flex items-center"><i class="fas fa-star text-neon-yellow mr-1"></i>${f}</li>`).join('')}
        </ul>
      `;
      selectionContainer.appendChild(card);
    });
  };

  // Make accommodations depend on selected destination (UPDATED LOGIC)
  destinationSelect.addEventListener('change', () => {
    const selectedId = destinationSelect.value; // e.g., "mars"

    // If no destination is selected, hide all and clear selection
    if (!selectedId) {
        document.querySelectorAll('.accommodation').forEach(card => {
            card.style.display = 'none';
            card.classList.remove('selected');
        });
        localStorage.removeItem('selectedAccommodation');
        return;
    }

    // Loop through each accommodation CARD
    document.querySelectorAll('.accommodation').forEach(card => {
        // Find the matching data for this card from accommodationsData
        const accomData = accommodationsData.find(a => a.id === card.id);
        if (!accomData) return;

        // Check if the selected destination (selectedId) is in this accommodation's "availableOn" array
        const isAvailable = accomData.availableOn.includes(selectedId);
        card.style.display = isAvailable ? 'block' : 'none';
    });

    // Deselect if hidden
    const selected = document.querySelector('.accommodation.selected');
    if (selected && selected.style.display === 'none') {
      selected.classList.remove('selected');
      localStorage.removeItem('selectedAccommodation');
    }
  });

  // passenger radio
  passengerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      maxPassengers = value === '1' ? 1 : value === '2' ? 2 : 6;
      while (passengerCount > maxPassengers) {
        const last = passengersContainer.lastElementChild;
        if (last) last.remove();
        passengerCount--;
      }
      addPassengerBtn.style.display = maxPassengers > 1 ? 'block' : 'none';
    });
  });
  // Accommodation Selection
  if (selectionContainer) {
    selectionContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.accommodation');
      if (!card || card.style.display === 'none') return;
      document.querySelectorAll('.accommodation').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      localStorage.setItem('selectedAccommodation', card.id);
    });
    // Restore saved
    const saved = localStorage.getItem('selectedAccommodation');
    if (saved) document.getElementById(saved)?.classList.add('selected');
  }
  // Add Passenger Button
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
        <input id="fName${passengerCount}" type="text" class="form-input w-full px-4 py-3 my-2" placeholder="Enter your first name"/>
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Last Name (Passenger ${passengerCount})</label>
        <input id="lName${passengerCount}" type="text" class="form-input w-full px-4 py-3 my-2" placeholder="Enter your last name"/>
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Email (Passenger ${passengerCount})</label>
        <input id="email${passengerCount}" type="email" class="form-input w-full px-4 py-3 my-2" placeholder="Enter your email"/>
        <div class="error"></div>
      </div>
      <div class="flex flex-col input-control">
        <label class="text-xl">Phone (Passenger ${passengerCount})</label>
        <input id="phone${passengerCount}" type="tel" class="form-input w-full px-4 py-3 my-2" placeholder="+212XXXXXXXXX"/>
        <div class="error"></div>
      </div>
    `;
    passengersContainer.appendChild(fields);
  });
  // error
  const setError = (input, msg) => {
    const control = input.parentElement;
    const error = control.querySelector('.error');
    if (error) {
      error.textContent = msg;
    }
    control.classList.add('error');
    control.classList.remove('success');
  };
  // success
  const setSuccess = (input) => {
    const control = input.parentElement;
    const error = control.querySelector('.error');
    if (error) {
      error.textContent = '';
    }
    control.classList.add('success');
    control.classList.remove('error');
  };
  const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isPhone = (val) => /^\+212[5-7]\d{8}$/.test(val);
  const isAlpha = (val) => /^([A-Za-z\s]{3,})$/.test(val.trim());
  // validation
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
      const fNameVal = fName.value.trim();
      if (!fNameVal) {
        setError(fName, 'First name required');
        valid = false;
      } else if (!isAlpha(fNameVal)) {
        setError(fName, 'First name must be at least 3 letters (no numbers)');
        valid = false;
      } else {
        setSuccess(fName);
      }
      // Last Name
      const lNameVal = lName.value.trim();
      if (!lNameVal) {
        setError(lName, 'Last name required');
        valid = false;
      } else if (!isAlpha(lNameVal)) {
        setError(lName, 'Last name must be at least 3 letters (no numbers)');
        valid = false;
      } else {
        setSuccess(lName);
      }
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
        setError(phone, 'Must start with +212 followed by 9 digits (e.g., +212612345678)');
        valid = false;
      } else setSuccess(phone);
    }
    return valid;
  };
  // Submit
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
      const errorDiv = c.querySelector('.error');
      if (errorDiv) errorDiv.textContent = '';
    });
    document.querySelectorAll('.accommodation').forEach(c => {
      c.classList.remove('selected');
      c.style.display = 'block'; // Reset visibility
    });
    localStorage.removeItem('selectedAccommodation');
    while (passengersContainer.children.length > 1) {
      passengersContainer.removeChild(passengersContainer.lastChild);
    }
    passengerCount = 1;
    maxPassengers = 1;
    document.getElementById('solo').checked = true;
    addPassengerBtn.style.display = 'none';
  });
});