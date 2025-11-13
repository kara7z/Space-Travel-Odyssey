document.addEventListener('DOMContentLoaded', () => {
    const bookingsContainer = document.getElementById('bookingsContainer');
    const loadingState = document.getElementById('loadingState');
    const noBookingsState = document.getElementById('noBookingsState');
    const notLoggedInState = document.getElementById('notLoggedInState');

    // Check if user is logged in
    const isUserLoggedIn = () => {
        return localStorage.getItem('loggedIn') === 'true';
    };

    // Get username
    const getUsername = () => {
        return localStorage.getItem('username') || 'Space Traveler';
    };

    const initPage = () => {
        loadingState.classList.remove('hidden');
        noBookingsState.classList.add('hidden');
        notLoggedInState.classList.add('hidden');
        bookingsContainer.innerHTML = '';

        // Check authentication
        if (!isUserLoggedIn()) {
            showNotLoggedInState();
            return;
        }

        loadBookings();
    };

    const showNotLoggedInState = () => {
        loadingState.classList.add('hidden');
        notLoggedInState.classList.remove('hidden');
    };

    const showNoBookingsState = () => {
        loadingState.classList.add('hidden');
        noBookingsState.classList.remove('hidden');
    };

    const loadBookings = () => {
        // Simulate loading delay
        setTimeout(() => {
            const bookings = JSON.parse(localStorage.getItem('spaceVoyagerBookings')) || [];
            
            if (bookings.length === 0) {
                showNoBookingsState();
                return;
            }

            displayBookings(bookings);
        }, 1000);
    };

    const displayBookings = (bookings) => {
        loadingState.classList.add('hidden');
        
        // Sort bookings by date 
        bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

        const username = getUsername();
        
        bookingsContainer.innerHTML = `
            <div class="mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h2 class="font-orbitron text-2xl md:text-3xl text-glow">
                            Welcome back, ${username}!
                        </h2>
                        <p class="text-gray-300 mt-2">
                            You have ${bookings.length} space journey${bookings.length !== 1 ? 's' : ''} booked
                        </p>
                    </div>
                    <a href="booking.html" class="btn-primary text-white px-6 py-3 rounded-lg font-bold mt-4 md:mt-0 inline-block">
                        <i class="fas fa-plus mr-2"></i>New Booking
                    </a>
                </div>
            </div>
            <div class="space-y-6">
                ${bookings.map((booking, index) => generateBookingCard(booking, index)).join('')}
            </div>
        `;
    };

    const generateBookingCard = (booking, index) => {
        const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const departureDate = new Date(booking.departureDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Calculate days until departure
        const today = new Date();
        const departure = new Date(booking.departureDate);
        const daysUntilDeparture = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));
        
        let status = 'Upcoming';
        let statusColor = 'text-neon-cyan';
        
        if (daysUntilDeparture < 0) {
            status = 'Completed';
            statusColor = 'text-gray-400';
        } else if (daysUntilDeparture <= 7) {
            status = 'Departing Soon';
            statusColor = 'text-yellow-400';
        }

        return `
            <div class="booking-card p-6 relative overflow-hidden">
                <!-- Status Badge -->
                <div class="absolute top-4 right-4 ${statusColor} font-semibold text-sm">
                    ${status}
                </div>

                <!-- Booking Header -->
                <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                    <div class="mb-4 md:mb-0">
                        <h3 class="font-orbitron text-2xl text-neon-blue mb-2">
                            ${booking.destination.name}
                        </h3>
                        <p class="text-gray-400">
                            Booking ID: <span class="text-neon-cyan font-mono">${booking.bookingId}</span>
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-neon-cyan font-bold text-2xl">
                            $${booking.totalPrice.toLocaleString()}
                        </p>
                        <p class="text-gray-400 text-sm">Total</p>
                    </div>
                </div>

                <!-- Booking Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div class="space-y-2">
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-calendar-alt mr-2"></i>Departure
                        </p>
                        <p class="text-white font-semibold">${departureDate}</p>
                        ${daysUntilDeparture > 0 ? `
                            <p class="text-sm ${daysUntilDeparture <= 7 ? 'text-yellow-400' : 'text-gray-400'}">
                                ${daysUntilDeparture} day${daysUntilDeparture !== 1 ? 's' : ''} until launch
                            </p>
                        ` : ''}
                    </div>
                    
                    <div class="space-y-2">
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-users mr-2"></i>Passengers
                        </p>
                        <p class="text-white font-semibold">${booking.passengers} traveler${booking.passengers !== 1 ? 's' : ''}</p>
                    </div>
                    
                    <div class="space-y-2">
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-hotel mr-2"></i>Accommodation
                        </p>
                        <p class="text-white font-semibold">${booking.accommodation.name}</p>
                    </div>
                    
                    <div class="space-y-2">
                        <p class="text-gray-400 flex items-center">
                            <i class="fas fa-clock mr-2"></i>Booked On
                        </p>
                        <p class="text-white font-semibold">${bookingDate}</p>
                    </div>
                </div>

                <!-- Special Requirements -->
                ${booking.specialRequirements ? `
                    <div class="mb-6">
                        <p class="text-gray-400 mb-2 flex items-center">
                            <i class="fas fa-clipboard-list mr-2"></i>Special Requirements
                        </p>
                        <div class="bg-space-blue/50 rounded-lg p-4">
                            <p class="text-white">${booking.specialRequirements}</p>
                        </div>
                    </div>
                ` : ''}

                <!-- Travelers Section -->
                <div class="mb-6">
                    <p class="text-gray-400 mb-3 flex items-center">
                        <i class="fas fa-user-astronaut mr-2"></i>Travelers
                    </p>
                    <div class="space-y-3">
                        ${booking.travelers.map(traveler => `
                            <div class="flex items-center justify-between p-3 bg-space-blue/30 rounded-lg">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-neon-blue/20 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-neon-blue"></i>
                                    </div>
                                    <div>
                                        <p class="text-white font-semibold">${traveler.firstName} ${traveler.lastName}</p>
                                        <p class="text-gray-400 text-sm">${traveler.email}</p>
                                    </div>
                                </div>
                                <p class="text-gray-400 text-sm">${traveler.phone}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-700 space-y-3 sm:space-y-0">
                    <p class="text-gray-400 text-sm">
                        Need help with your booking? <a href="#" class="text-neon-blue hover:underline">Contact support</a>
                    </p>
                    <div class="flex space-x-2">
                        <button onclick="modifyBooking(${index})" class="bg-neon-blue/20 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-colors flex items-center">
                            <i class="fas fa-edit mr-2"></i>Edit
                        </button>
                        <button onclick="cancelBooking(${index})" class="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex items-center">
                            <i class="fas fa-times mr-2"></i>Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
    };

    initPage();
});

function cancelBooking(index) {
    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        const bookings = JSON.parse(localStorage.getItem('spaceVoyagerBookings')) || [];
        const cancelledBooking = bookings.splice(index, 1)[0];
        
        // Save cancelled booking to different storage if you want to keep history
        const cancelledBookings = JSON.parse(localStorage.getItem('spaceVoyagerCancelledBookings')) || [];
        cancelledBookings.push({
            ...cancelledBooking,
            cancelledDate: new Date().toISOString()
        });
        localStorage.setItem('spaceVoyagerCancelledBookings', JSON.stringify(cancelledBookings));
        
        // Update active bookings
        localStorage.setItem('spaceVoyagerBookings', JSON.stringify(bookings));
        
        // Show success message
        alert('Booking cancelled successfully!');
        
        // Reload the page to show updated list
        location.reload();
    }
}

function modifyBooking(index) {
    const bookings = JSON.parse(localStorage.getItem('spaceVoyagerBookings')) || [];
    const bookingToModify = bookings[index];
    
    localStorage.setItem('editBookingData', JSON.stringify(bookingToModify));
    localStorage.setItem('editBookingIndex', index);
    
    window.location.href = 'booking.html?edit=true';
}