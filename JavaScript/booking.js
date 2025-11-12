document.addEventListener('DOMContentLoaded', () => {
    const selectionContainer = document.querySelector('.Selection');

    if (!selectionContainer) {
        console.warn('Selection container not found');
        return;
    }

    selectionContainer.addEventListener('click', (e) => {
        const clickedCard = e.target.closest('.accommodation');
        if (!clickedCard) return; 

        document.querySelectorAll('.accommodation').forEach(card => {
            card.classList.remove('selected');
        });

        clickedCard.classList.add('selected');

        localStorage.setItem('selectedAccommodation', clickedCard.id);
    });

    const savedAccommodation = localStorage.getItem('selectedAccommodation');
    if (savedAccommodation) {
        const savedCard = document.getElementById(savedAccommodation);
        if (savedCard) {
            savedCard.classList.add('selected');
        }
    }
});