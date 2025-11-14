
document.addEventListener('DOMContentLoaded', () => {
  
  const desktopLoginLink   = document.getElementById('desktopLoginLink');
  const userBtnWrapper     = document.getElementById('userBtnWrapper');
  const mobileLoginLink    = document.getElementById('mobileLoginLink');
  const mobileLogoutLink   = document.getElementById('mobileLogoutLink');
  const desktopUsername    = document.getElementById('desktopUsername');

  function updateUI() {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const username = localStorage.getItem('username') || 'User';

    // Desktop
    userBtnWrapper?.classList.toggle('hidden', !loggedIn);
    desktopLoginLink?.classList.toggle('hidden', loggedIn);
    if (desktopUsername) desktopUsername.textContent = username;

    // Mobile 
    mobileLoginLink?.classList.toggle('hidden', loggedIn);
    mobileLogoutLink?.classList.toggle('hidden', !loggedIn);
  }

  updateUI(); 

  // Desktop Dropdown
  const userBtn = document.getElementById('userBtn');
  const userDropdown = document.getElementById('userDropdown');

  const toggleDesktop = (open) => {
    userDropdown?.classList.toggle('opacity-100', open);
    userDropdown?.classList.toggle('opacity-0', !open);
    userDropdown?.classList.toggle('pointer-events-auto', open);
    userDropdown?.classList.toggle('pointer-events-none', !open);
  };

  userBtn?.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = userDropdown?.classList.contains('opacity-100');
    toggleDesktop(!isOpen);
  });

  // Mobile Menu Toggle
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburgerBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

 
  document.addEventListener('click', e => {
    if (userBtn && !userBtn.contains(e.target) && userDropdown && !userDropdown.contains(e.target)) {
      toggleDesktop(false);
    }
  });

  // Logout 
  function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    updateUI();
    alert('Logged out!');
    window.location.href = 'login.html';
  }

  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('mobileLogoutLink')?.addEventListener('click', (e) => {
    e.preventDefault(); 
    logout();
  });
});
/* Stars background */
function createStars() {
  const container = document.getElementById('stars-container');
  if (!container) return;
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    const size = Math.random() * 2 + 1;
    star.style.width = star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    container.appendChild(star);
  }
}
createStars();