// Yes, I know HTML supports native forms
// This is more of an SPA type thing
const usernameField = document.querySelector('#lr-form #username');
const passwordField = document.querySelector('#lr-form #password');
const loginButton = document.querySelector('#lr-form #login-btn');
const registerButton = document.querySelector('#lr-form #register-btn');
const statusBox = document.getElementById('status');

const setStatus = (message, isError = false) => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.style.color = isError ? '#b00' : '#080';
};

const authRequest = async (url, successText) => {
    const username = usernameField.value.trim();
    const password = passwordField.value;

    if (!username || !password) {
        setStatus('Username and password are required.', true);
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const responseData = await response.json().catch(() => ({ error: 'Unexpected response' }));

        if (!response.ok) {
            setStatus(responseData.error || 'Authentication failed.', true);
            return;
        }

        if (responseData.success) {
            setStatus(successText || 'Operation completed successfully.');
        } else if (responseData.token) {
            setStatus('Login successful.');
            localStorage.setItem("token", responseData.token);
            setTimeout(() => {
                window.location.href = '/i3vie/';
            }, 1000);
        } else {
            setStatus('Operation completed successfully.');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        setStatus('Network or server error. Please try again.', true);
    }
};

loginButton.addEventListener('click', async () => {
    await authRequest('/i3vie/api/v1/login', 'Logged in successfully.');
});

registerButton.addEventListener('click', async () => {
    await authRequest('/i3vie/api/v1/register', 'Registered successfully. Please log in.');
});
