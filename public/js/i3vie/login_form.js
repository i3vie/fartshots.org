// Yes, I know HTML supports native forms
// This is more of an SPA type thing
const usernameField = document.querySelector('#lr-form #username');
const passwordField = document.querySelector('#lr-form #password');
const loginButton = document.querySelector('#lr-form #login-btn');
const registerButton = document.querySelector('#lr-form #register-btn');
const statusBox = document.getElementById('status');

const setStatus = (message, classList) => {
    if (!statusBox) return;
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.className = classList;
};

const authRequest = async (url, successText) => {
    const username = usernameField.value.trim();
    const password = passwordField.value;

    if (!username || !password) {
        setStatus('Username and password are required.', 'alert fatal');
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
            setStatus(responseData.error || 'Authentication failed.', 'alert fatal');
            return;
        }

        if (responseData.success) {
            setStatus(successText || 'Operation completed successfully.', 'alert success');
            if (url.endsWith('/login')) {
                setTimeout(() => {
                    window.location.href = '/i3vie/';
                }, 1000);
            }
        } else {
            setStatus('Operation completed successfully.', 'alert success');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        setStatus('Network or server error. Please try again.', 'alert fatal');
    }
};

loginButton.addEventListener('click', async () => {
    await authRequest('/i3vie/api/v1/login', 'Logged in successfully.');
});

registerButton.addEventListener('click', async () => {
    await authRequest('/i3vie/api/v1/register', 'Registered successfully. Please log in.');
});
