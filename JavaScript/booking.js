document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  const selectionContainer = document.querySelector('.Selection');
  const passengersContainer = document.getElementById('passengersContainer');
  const addPassengerBtn = document.getElementById('addPassengerBtn');
  const passengerRadios = document.querySelectorAll('input[name="passengers"]');
  const departureDateInput = document.getElementById('departureDate');
  const message = document.getElementById('message');
  const destinationSelect = document.getElementById('destination');
  const totalCounter = document.getElementById('totalCounter');
  let passengerCount = 1;
  let maxPassengers = 1;
  let destinationsData = [];
  let accommodationsData = []; 
  let currentDestinationPrice = 0;
  let currentAccommodationPrice = 0;
  let currentDestinationDuration = 0;
  let isEditMode = false;
  let editBookingIndex = null;

  // Check if we're in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit') === 'true') {
    isEditMode = true;
    editBookingIndex = localStorage.getItem('editBookingIndex');
  }

  // Debug function to log current state
  const debugPassengerState = () => {
    console.log(`Current: passengerCount=${passengerCount}, maxPassengers=${maxPassengers}, visibleFields=${passengersContainer.children.length}`);
  };

  // if user is logged in
  const isUserLoggedIn = () => {
    return localStorage.getItem('loggedIn') === 'true';
  };

  // login status 
  const checkLoginStatus = () => {
    if (!isUserLoggedIn()) {
      form.style.display = 'none';
      
      const loginMessage = document.createElement('div');
      loginMessage.className = 'text-center py-12 planet-card p-8 bg-[#17172b]';
      loginMessage.innerHTML = `
        <div class="mb-6">
          <i class="fas fa-user-astronaut text-6xl text-neon-blue mb-4"></i>
          <h2 class="font-orbitron text-3xl text-glow mb-4">Sign In Required</h2>
          <p class="text-xl text-gray-300 mb-6">You need to be signed in to complete your space journey booking.</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="login.html" class="btn-primary text-white px-8 py-4 rounded-lg font-bold text-lg glow text-center">
            Sign In Now
          </a>
          <a href="index.html" class="bg-space-blue text-white px-8 py-4 rounded-lg font-bold text-lg border border-neon-blue/30 hover:bg-space-purple transition-colors text-center">
            Return Home
          </a>
        </div>
      `;
      
      const main = document.querySelector('main');
      const heroSection = document.querySelector('section.py-16');
      main.insertBefore(loginMessage, heroSection.nextSibling);
    } else {
      form.style.display = 'block';
    }
  };

  checkLoginStatus();

  // Calculate total price
  const updateTotalPrice = () => {
    const basePrice = currentDestinationPrice; 
    const accommodationPrice = currentAccommodationPrice * currentDestinationDuration * passengerCount;
    const totalPrice = basePrice + accommodationPrice;
    
    totalCounter.textContent = totalPrice.toLocaleString();
  };

  // Function to update passenger fields based on current count and max
  const updatePassengerFields = () => {
    const currentFields = passengersContainer.children.length;
    
    // Remove extra fields if we have more than maxPassengers
    while (currentFields > maxPassengers) {
      const lastField = passengersContainer.lastElementChild;
      if (lastField && lastField.dataset.passenger !== '1') {
        lastField.remove();
      } else {
        break;
      }
    }
    
    // Update passenger count to match visible fields
    passengerCount = passengersContainer.children.length;
    
    // Update add passenger button visibility
    addPassengerBtn.style.display = passengerCount < maxPassengers ? 'block' : 'none';
    
    // Update labels for all passenger fields
    document.querySelectorAll('.passenger-fields').forEach((field, index) => {
      const passengerNumber = index + 1;
      field.dataset.passenger = passengerNumber;
      
      // Update all labels and placeholders
      const labels = field.querySelectorAll('label');
      const inputs = field.querySelectorAll('input');
      
      if (labels[0]) labels[0].textContent = `First Name ${passengerNumber > 1 ? `(Passenger ${passengerNumber})` : ''}`;
      if (labels[1]) labels[1].textContent = `Last Name ${passengerNumber > 1 ? `(Passenger ${passengerNumber})` : ''}`;
      if (labels[2]) labels[2].textContent = `Email ${passengerNumber > 1 ? `(Passenger ${passengerNumber})` : ''}`;
      if (labels[3]) labels[3].textContent = `Phone ${passengerNumber > 1 ? `(Passenger ${passengerNumber})` : ''}`;
      
      // Update input IDs and names
      inputs[0].id = `fName${passengerNumber}`;
      inputs[0].name = `fName${passengerNumber}`;
      inputs[1].id = `lName${passengerNumber}`;
      inputs[1].name = `lName${passengerNumber}`;
      inputs[2].id = `email${passengerNumber}`;
      inputs[2].name = `email${passengerNumber}`;
      inputs[3].id = `phone${passengerNumber}`;
      inputs[3].name = `phone${passengerNumber}`;
    });
    
    debugPassengerState();
    updateTotalPrice();
  };

  /* Fetch destinations */
  fetch('data/destinations.json').then(res => res.json())
    .then(data => {
      destinationsData = data.destinations;
      data.destinations.sort((a, b) => a.price - b.price);
      const optionsHTML = data.destinations.map(dest =>
        `<option value="${dest.id}">${dest.name} – $${dest.price.toLocaleString()} ${dest.currency} – ${dest.travelDuration}</option>`
      ).join('');
      destinationSelect.insertAdjacentHTML('beforeend', optionsHTML);
      
      // Load edit data after destinations are loaded
      if (isEditMode) {
        loadEditData();
      }
    })
    .catch(console.error);

  /* Fetch accommodations*/
  fetch('data/accommodations.json').then(res => res.json())
    .then(data => {
      accommodationsData = data.accommodations;
      renderAccommodationCards(); 
    })
    .catch(console.error);

  // Render accommodation cards
  const renderAccommodationCards = () => {
    selectionContainer.innerHTML = '';
    accommodationsData.sort((a, b) => a.pricePerDay - b.pricePerDay);
    accommodationsData.forEach(accom => {
      const card = document.createElement('div');
      card.id = accom.id;
      card.className = 'px-6 py-3 accommodation text-2xl';
      card.style.display = 'none'; 
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

  // Load edit data
  const loadEditData = () => {
    const editData = JSON.parse(localStorage.getItem('editBookingData'));
    if (!editData) return;

    // Update page title
    const heroTitle = document.querySelector('section h1');
    if (heroTitle) {
      heroTitle.textContent = 'Edit Your Space Journey';
    }

    // Update submit button text
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Booking';
    }

    // Set destination
    destinationSelect.value = editData.destination.id;
    destinationSelect.dispatchEvent(new Event('change'));

    // Set departure date
    departureDateInput.value = editData.departureDate;

    // Set passenger count
    const passengerValue = editData.passengers === 1 ? '1' : editData.passengers === 2 ? '2' : '3-6';
    const radioToCheck = document.querySelector(`input[name="passengers"][value="${passengerValue}"]`);
    if (radioToCheck) {
      radioToCheck.checked = true;
      radioToCheck.dispatchEvent(new Event('change'));
    }

    // Add additional passenger fields if needed
    setTimeout(() => {
      while (passengerCount < editData.passengers) {
        addPassengerBtn.click();
      }

      // Fill in traveler data
      editData.travelers.forEach((traveler, index) => {
        const num = index + 1;
        document.getElementById(`fName${num}`).value = traveler.firstName;
        document.getElementById(`lName${num}`).value = traveler.lastName;
        document.getElementById(`email${num}`).value = traveler.email;
        document.getElementById(`phone${num}`).value = traveler.phone;
      });

      // Set accommodation
      setTimeout(() => {
        const accomCard = document.getElementById(editData.accommodation.id);
        if (accomCard) {
          accomCard.click();
        }

        // Set special requirements
        message.value = editData.specialRequirements || '';
      }, 300);
    }, 500);
  };

  // Selected Destination
  destinationSelect.addEventListener('change', () => {
    const selectedId = destinationSelect.value; 

    if (!selectedId) {
      document.querySelectorAll('.accommodation').forEach(card => {
        card.style.display = 'none';
        card.classList.remove('selected');
      });
      localStorage.removeItem('selectedAccommodation');
      currentDestinationPrice = 0;
      currentDestinationDuration = 0;
      updateTotalPrice();
      return;
    }

    // Get the selected destination price and duration
    const selectedDestination = destinationsData.find(dest => dest.id === selectedId);
    if (selectedDestination) {
      currentDestinationPrice = selectedDestination.price;
      currentDestinationDuration = parseInt(selectedDestination.duration);
      console.log(`Destination: ${selectedDestination.name}, Duration: ${currentDestinationDuration} days, Price: $${currentDestinationPrice}`);
    }

    document.querySelectorAll('.accommodation').forEach(card => {
      const accomData = accommodationsData.find(a => a.id === card.id);
      if (!accomData) return;

      const isAvailable = accomData.availableOn.includes(selectedId);
      card.style.display = isAvailable ? 'block' : 'none';
    });

    // Deselect if hidden
    const selected = document.querySelector('.accommodation.selected');
    if (selected && selected.style.display === 'none') {
      selected.classList.remove('selected');
      localStorage.removeItem('selectedAccommodation');
      currentAccommodationPrice = 0;
    }

    updateTotalPrice();
  });

  // Passenger radio button handler
  passengerRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      console.log(`Radio changed to: ${value}`);
      
      // Set max passengers based on selection
      switch(value) {
        case '1':
          maxPassengers = 1;
          break;
        case '2':
          maxPassengers = 2;
          break;
        case '3-6':
          maxPassengers = 6;
          break;
        default:
          maxPassengers = 1;
      }
      
      console.log(`Max passengers set to: ${maxPassengers}`);
      updatePassengerFields();
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
      
      // Get the selected accommodation price
      const selectedAccommodation = accommodationsData.find(accom => accom.id === card.id);
      if (selectedAccommodation) {
        currentAccommodationPrice = selectedAccommodation.pricePerDay;
      }
      
      updateTotalPrice();
    });
    // Restore saved
    const saved = localStorage.getItem('selectedAccommodation');
    if (saved) {
      const savedAccommodation = accommodationsData.find(accom => accom.id === saved);
      if (savedAccommodation) {
        currentAccommodationPrice = savedAccommodation.pricePerDay;
      }
      document.getElementById(saved)?.classList.add('selected');
    }
  }

  // Add Passenger Button
  addPassengerBtn.addEventListener('click', () => {
    console.log(`Add passenger clicked. Current: ${passengerCount}, Max: ${maxPassengers}`);
    
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
    updatePassengerFields();
  });

  // Event listener to detect current passenger count
  const detectPassengerCount = () => {
    const visibleFields = document.querySelectorAll('.passenger-fields').length;
    passengerCount = visibleFields;
    console.log(`Detected ${passengerCount} passenger fields`);
    updatePassengerFields();
  };

  // Initialize passenger system
  const initializePassengerSystem = () => {
    // Set initial state
    passengerCount = 1;
    maxPassengers = 1;
    
    // Ensure solo is checked by default
    document.getElementById('solo').checked = true;
    
    // Hide add passenger button initially
    addPassengerBtn.style.display = 'none';
    
    // Add mutation observer to detect DOM changes
    const observer = new MutationObserver(detectPassengerCount);
    observer.observe(passengersContainer, { childList: true, subtree: false });
    
    console.log('Passenger system initialized');
    debugPassengerState();
  };

  // Set error
  const setError = (input, msg) => {
    const control = input.parentElement;
    const error = control.querySelector('.error');
    if (error) {
      error.textContent = msg;
    }
    control.classList.add('error');
    control.classList.remove('success');
  };

  // Set success
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

  // Validation
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

  // Submit Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      alert('You need to sign in to complete your booking. Please log in to continue.');
      checkLoginStatus();
      return;
    }
    
    if (!validateForm()) return;
    
    // Get destination details
    const selectedDestId = form.querySelector('#destination').value;
    const selectedDestination = destinationsData.find(dest => dest.id === selectedDestId);
    
    // Get accommodation details
    const selectedAccomId = document.querySelector('.accommodation.selected')?.id;
    const selectedAccommodation = accommodationsData.find(accom => accom.id === selectedAccomId);
    
    // Collect travelers data
    const travelers = [];
    for (let i = 1; i <= passengerCount; i++) {
      travelers.push({
        firstName: document.getElementById(`fName${i}`).value.trim(),
        lastName: document.getElementById(`lName${i}`).value.trim(),
        email: document.getElementById(`email${i}`).value.trim(),
        phone: document.getElementById(`phone${i}`).value.trim()
      });
    }
    
    // Calculate total price
    const totalPrice = currentDestinationPrice + (currentAccommodationPrice * currentDestinationDuration * passengerCount);
    
    // Get existing bookings
    const existingBookings = JSON.parse(localStorage.getItem('spaceVoyagerBookings')) || [];
    
    if (isEditMode && editBookingIndex !== null) {
      // Update existing booking
      const originalBooking = existingBookings[editBookingIndex];
      const updatedBooking = {
        ...originalBooking,
        destination: {
          id: selectedDestination.id,
          name: selectedDestination.name,
          price: selectedDestination.price,
          duration: selectedDestination.duration
        },
        departureDate: departureDateInput.value,
        passengers: passengerCount,
        accommodation: {
          id: selectedAccommodation.id,
          name: selectedAccommodation.name,
          pricePerDay: selectedAccommodation.pricePerDay
        },
        specialRequirements: message.value.trim(),
        travelers: travelers,
        totalPrice: totalPrice,
        lastModified: new Date().toISOString()
      };
      
      existingBookings[editBookingIndex] = updatedBooking;
      localStorage.setItem('spaceVoyagerBookings', JSON.stringify(existingBookings));
      
      // Clear edit data
      localStorage.removeItem('editBookingData');
      localStorage.removeItem('editBookingIndex');
      
      alert(`Booking updated successfully! Booking ID: ${updatedBooking.bookingId}`);
      
      // Redirect to My Bookings
      window.location.href = 'mybooking.html';
    } else {
      // Create new booking
      const booking = {
        bookingId: 'SV-' + Date.now().toString(36).toUpperCase(),
        bookingDate: new Date().toISOString(),
        destination: {
          id: selectedDestination.id,
          name: selectedDestination.name,
          price: selectedDestination.price,
          duration: selectedDestination.duration
        },
        departureDate: departureDateInput.value,
        passengers: passengerCount,
        accommodation: {
          id: selectedAccommodation.id,
          name: selectedAccommodation.name,
          pricePerDay: selectedAccommodation.pricePerDay
        },
        specialRequirements: message.value.trim(),
        travelers: travelers,
        totalPrice: totalPrice,
        status: 'confirmed'
      };
      
      console.log('Booking Created:', booking);
      
      // Save to localStorage
      existingBookings.push(booking);
      localStorage.setItem('spaceVoyagerBookings', JSON.stringify(existingBookings));
      
      // Show success message
      alert(`Booking confirmed! Your booking ID is: ${booking.bookingId}\n\nYou can view your booking details in "My Bookings" section.`);
      
      // Reset form
      form.reset();
      document.querySelectorAll('.input-control').forEach(c => {
        c.classList.remove('success', 'error');
        const errorDiv = c.querySelector('.error');
        if (errorDiv) errorDiv.textContent = '';
      });
      document.querySelectorAll('.accommodation').forEach(c => {
        c.classList.remove('selected');
        c.style.display = 'block'; 
      });
      localStorage.removeItem('selectedAccommodation');
      
      // Reset passenger system
      while (passengersContainer.children.length > 1) {
        passengersContainer.removeChild(passengersContainer.lastChild);
      }
      initializePassengerSystem();
      
      currentDestinationPrice = 0;
      currentAccommodationPrice = 0;
      currentDestinationDuration = 0;
      updateTotalPrice();
      
      // Optional: Redirect to My Bookings page after a short delay
      setTimeout(() => {
        if (confirm('Would you like to view your booking details now?')) {
          window.location.href = 'mybooking.html';
        }
      }, 500);
    }
  });

  // Initialize everything
  initializePassengerSystem();
  updateTotalPrice();
});