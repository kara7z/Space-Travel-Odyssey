document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookingIndex = urlParams.get('booking');
    if (bookingIndex === null) {
        showError('No booking specified!');
        return;
    }
    const bookings = JSON.parse(localStorage.getItem('spaceVoyagerBookings')) || [];
    const booking = bookings[parseInt(bookingIndex)];
    if (!booking) {
        showError('Booking not found!');
        return;
    }
    generateTicket(booking);
});

function showError(message) {
    const container = document.getElementById('ticketContainer');
    container.innerHTML = `
        <div class="planet-card p-8 text-center">
            <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 class="text-2xl font-bold text-red-600 mb-4">${message}</h2>
            <a href="mybooking.html" class="inline-block bg-gradient-to-r from-neon-blue to-neon-purple text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all">
                ← Back to My Bookings
            </a>
        </div>
    `;
}

function generateTicket(booking) {
    // Format dates
    const bookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const departureDate = new Date(booking.departureDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    // Calculate days until departure
    const today = new Date();
    const departure = new Date(booking.departureDate);
    const daysUntilDeparture = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));
    let status = 'Upcoming Journey';
    let statusColor = 'text-neon-cyan';
    let statusBg = 'bg-cyan-100';
    if (daysUntilDeparture < 0) {
        status = 'Journey Completed';
        statusColor = 'text-gray-600';
        statusBg = 'bg-gray-100';
    } else if (daysUntilDeparture <= 7) {
        status = 'Departing Soon!';
        statusColor = 'text-yellow-600';
        statusBg = 'bg-yellow-100';
    }
    // ticket HTML
    const ticketHTML = `
        <div class="planet-card" id="invoice">
            <!-- Ticket Header with Gradient -->
            <div class="bg-gradient-to-r from-neon-blue to-neon-purple p-6 text-white">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="text-3xl font-orbitron font-bold mb-2">
                            ${booking.destination.name}
                        </div>
                        <div class="text-sm opacity-90">
                            Booking Reference: <span class="font-mono font-bold">${booking.bookingId}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-3xl font-orbitron font-bold">
                            $${booking.totalPrice.toLocaleString()}
                        </div>
                        <div class="text-sm opacity-90">Total Amount</div>
                    </div>
                </div>
            </div>
            <div class="p-8">
                <!-- Status Badge -->
                <div class="text-center mb-6">
                    <span class="inline-block ${statusBg} ${statusColor} px-6 py-2 rounded-full font-semibold text-lg">
                        ${status}
                    </span>
                </div>
                <!-- Departure Information -->
                <div class="text-center mb-8 bg-blue-50 p-6 rounded-lg">
                    <div class="text-gray-600 text-sm mb-2">DEPARTURE DATE</div>
                    <div class="text-3xl font-bold text-gray-800 font-orbitron mb-2">
                         ${departureDate}
                    </div>
                    ${daysUntilDeparture > 0 ? `
                        <div class="text-lg ${daysUntilDeparture <= 7 ? 'text-yellow-600 font-bold' : 'text-gray-600'}">
                            ${daysUntilDeparture} day${daysUntilDeparture !== 1 ? 's' : ''} until launch
                        </div>
                    ` : ''}
                </div>
                <!-- Booking Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-neon-blue">
                        <div class="text-gray-600 text-sm mb-1 flex items-center">
                            <i class="fas fa-users mr-2"></i>Passengers
                        </div>
                        <div class="text-xl font-bold text-gray-800">
                            ${booking.passengers} Traveler${booking.passengers !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-neon-purple">
                        <div class="text-gray-600 text-sm mb-1 flex items-center">
                            <i class="fas fa-hotel mr-2"></i>Accommodation
                        </div>
                        <div class="text-xl font-bold text-gray-800">
                            ${booking.accommodation.name}
                        </div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-neon-cyan">
                        <div class="text-gray-600 text-sm mb-1 flex items-center">
                            <i class="fas fa-hourglass-half mr-2"></i>Duration
                        </div>
                        <div class="text-xl font-bold text-gray-800">
                            ${booking.destination.duration} Days
                        </div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div class="text-gray-600 text-sm mb-1 flex items-center">
                            <i class="fas fa-clock mr-2"></i>Booked On
                        </div>
                        <div class="text-sm font-bold text-gray-800">
                            ${bookingDate}
                        </div>
                    </div>
                </div>
                <!-- Special Requirements -->
                ${booking.specialRequirements ? `
                    <div class="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                        <div class="flex items-start">
                            <i class="fas fa-clipboard-list text-yellow-600 mr-3 mt-1"></i>
                            <div>
                                <div class="font-semibold text-yellow-800 mb-1">Special Requirements</div>
                                <div class="text-yellow-700">${booking.specialRequirements}</div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                <!-- Travelers Section -->
                <div class="mb-8">
                    <div class="text-xl font-orbitron font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
                        Passenger Information
                    </div>
                    <div class="space-y-3">
                        ${booking.travelers.map((traveler, idx) => `
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div class="flex items-center space-x-4">
                                    <div class="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        ${idx + 1}
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-800">${traveler.firstName} ${traveler.lastName}</div>
                                        <div class="text-sm text-gray-600">${traveler.email}</div>
                                    </div>
                                </div>
                                <div class="text-sm text-gray-600 font-mono">${traveler.phone}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <!-- Contact Information -->
                <div class="text-center bg-gray-50 p-6 rounded-lg mb-8">
                    <div class="text-sm text-gray-600 mb-2">Need Assistance?</div>
                    <div class="text-gray-800 font-semibold">
                        📧 support@spacevoyager.com
                    </div>
                    <div class="text-gray-800 font-semibold">
                        📞 +1 (800) SPACE-TRIP
                    </div>
                </div>
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="window.print()" class="bg-gradient-to-r from-neon-blue to-neon-purple text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center">
                        <i class="fas fa-print mr-2"></i>
                        Print Ticket
                    </button>
                    <a href="mybooking.html" class="bg-gray-200 text-gray-700 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-300 transition-all flex items-center justify-center no-underline">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Bookings
                    </a>
                </div>
                <!-- Footer -->
                <div class="text-center mt-8 pt-6 border-t border-gray-200">
                    <div class="text-sm text-gray-500 italic">
                        Thank you for choosing SpaceVoyager. Safe travels among the stars!
                    </div>
                </div>
            </div>
        </div>
    `;
    const container = document.getElementById('ticketContainer');
    if (container) {
        container.innerHTML = ticketHTML;
    }
}