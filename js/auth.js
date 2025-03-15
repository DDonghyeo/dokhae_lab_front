function addAuthHeader(headers = {}) {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return headers;
}

function handleAuthError(response) {
  if (response.status === 403) {
    window.location.href = 'login.html';
  }
}

function isLoggedIn() {
  const token = localStorage.getItem('token');
  return !!token;
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

function updateNavBarLoginStatus() {
  const loginButton = document.getElementById('nav-login-btn');
  if (!loginButton) return;

  if (isLoggedIn()) {
    loginButton.textContent = 'Log out';
    loginButton.onclick = logout;
  } else {
    loginButton.textContent = 'Log in';
    loginButton.onclick = () => {
      window.location.href = 'login.html';
    };
  }
}