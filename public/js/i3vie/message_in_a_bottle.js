const tokenField = document.getElementById("token");

const storedToken = localStorage.getItem("token");
if (storedToken && tokenField) {
    tokenField.value = storedToken;
} else {
    document.location.href = '/i3vie/login';
}