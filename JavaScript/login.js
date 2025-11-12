/* -------------------------------------------------
   LOGIN PAGE ONLY – form validation + stars
   ------------------------------------------------- */
let userData = [];

fetch('data/user.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load user data');
    return res.json();
  })
  .then(data => {
    userData = data;
    startLiveChecks();
  })
  .catch(err => console.error('Error fetching user data:', err));

/* -------------------------------------------------
   Form elements
   ------------------------------------------------- */
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const form = loginBtn?.closest('form');

let isEmailCorrect = false;
let isPasswordCorrect = false;

function LiveEventListener(el, fn) {
  el?.addEventListener('input', fn);
}

function checkInput(input, correctValue, feedbackId, flag) {
  const feedback = document.getElementById(feedbackId);
  return () => {
    const typed = input.value.trim();
    const correct = typed === correctValue;

    if (flag === 'email') isEmailCorrect = correct;
    if (flag === 'password') isPasswordCorrect = correct;

    if (typed === '') {
      feedback.textContent = '';
      feedback.style.color = '';
    } else if (correct) {
      feedback.textContent = 'Correct';
      feedback.style.color = '#65FF54';
    } else {
      feedback.textContent = 'You entered wrong information';
      feedback.style.color = '#FF7154';
    }

    loginBtn.disabled = !(isEmailCorrect && isPasswordCorrect);
  };
}

function startLiveChecks() {
  if (!userData.length || !emailInput || !passwordInput) return;
  const { email: correctEmail, password: correctPassword } = userData[0];

  LiveEventListener(emailInput, checkInput(emailInput, correctEmail, 'email-feedback', 'email'));
  LiveEventListener(passwordInput, checkInput(passwordInput, correctPassword, 'password-feedback', 'password'));
}

/* -------------------------------------------------
   Login submit
   ------------------------------------------------- */
form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!loginBtn.disabled) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', userData[0].username || 'KARA');
    alert('Login successful!');
    window.location.href = 'index.html';
  }
});

