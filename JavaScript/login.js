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
    .catch(error => console.error('Error fetching user data:', error));


const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const Hidden = (e) => e.style.display = 'none';

function LiveEventListener(Element, Func) {
  Element.addEventListener('input', Func);
}

function checkInput(input, correctValue, feedbackId,isCorrectFlag) {

    const feedback = document.getElementById(feedbackId);

    return () => {
        const typed = input.value.trim();
        const correct = typed === correctValue;


        if (isCorrectFlag === 'email') isEmailCorrect = correct;
        if (isCorrectFlag === 'password') isPasswordCorrect = correct;

        if (typed === "") {
            feedback.textContent = "";
            feedback.style.color = "";
        }
        else if (typed === correctValue) {
            feedback.textContent = "Correct";
            feedback.style.color = "#65FF54";
        }
        else {
            feedback.textContent = "You enter wrong information";
            feedback.style.color = "#FF7154";
        }
        loginBtn.disabled = !(isEmailCorrect && isPasswordCorrect);
    };
}


function startLiveChecks() {
    if (userData.length === 0) return;

    const correctEmail = userData[0].email;
    const correctPassword = userData[0].password;

    LiveEventListener(email, checkInput(email, correctEmail, 'email-feedback','email'));
    LiveEventListener(password, checkInput(password, correctPassword, 'password-feedback','password'));
}