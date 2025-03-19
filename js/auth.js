// ===== config.js =====

const API_BASE_URL = "https://byuldajul.shop";

function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  }).then(async (response) => {
    if (!response.ok) throw await response.json();

    const text = await response.text();

    // ✅ JSON 파싱 시도, 실패하면 raw text 반환
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  });
}

// ===== auth.js =====
function setToken(token, remember) {
    if (remember) {
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30일
      localStorage.setItem('autoLogin', 'true');
  
      // ✅ ID, PW 저장
      const email = document.querySelector('#login-panel input[type="text"]').value;
      const password = document.querySelector('#login-panel input[type="password"]').value;
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', password);
    } else {
      document.cookie = `token=${token}; path=/`;
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('savedPassword');
    }
  }

function getToken() {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    if (cookie.startsWith('token=')) {
      return cookie.split('=')[1];
    }
  }
  return null;
}

function deleteToken() {
  document.cookie = 'token=; path=/; max-age=0';
}

function logout() {
    deleteToken();
    checkUser(); // ✅ 상태 즉시 반영
    alert("로그아웃 되었습니다.")
    location.reload();
  }

function handleLoginSuccess(token) {
    const remember = document.querySelector('#auto-login input').checked;
    setToken(token, remember);
    checkUser(); // ✅ 상태 즉시 반영
    location.href = 'index.html';
  }

function login() {
  deleteToken()
  const email = document.querySelector('#login-panel input[type="text"]').value;
  const password = document.querySelector('#login-panel input[type="password"]').value;

  apiRequest('/api/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
    .then((data) => handleLoginSuccess(data.accessToken))
    .catch((err) => alert('로그인 실패: ' + (err.message || '서버 오류')));
}

function checkUser() {
    const token = getToken();
    const loginBtn = document.getElementById('nav-login-btn');
  
    if (token) {
      loginBtn.textContent = 'Log out';
      loginBtn.onclick = logout;
    } else {
      loginBtn.textContent = 'Log in';
      loginBtn.onclick = open_login;
    }
  }

// ===== login.js =====

document.getElementById('login-panel button').addEventListener('click', login);
document.querySelector('#login-panel input[type="password"]').addEventListener('keyup', (e) => {
  if (e.key === 'Enter') login();
});

window.addEventListener('load', () => {
    checkUser();
  
    if (localStorage.getItem('autoLogin') === 'true') {
      document.querySelector('#auto-login input').checked = true;
  
      const savedEmail = localStorage.getItem('savedEmail');
      const savedPassword = localStorage.getItem('savedPassword');
      if (savedEmail && savedPassword) {
        document.querySelector('#login-panel input[type="text"]').value = savedEmail;
        document.querySelector('#login-panel input[type="password"]').value = savedPassword;
      }
    }
  });

// ===== open_login(), close_login() 는 기존에 작성한 것과 동일 =====

function open_login() {
    document.getElementById('login-overlay').classList.remove('hidden');
    document.getElementById('login-overlay').classList.add('show-overlay');
  
    document.getElementById('login-panel').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('login-panel').classList.add('slide-in');
    }, 50);
  }
  
  function close_login() {
    document.getElementById('login-overlay').classList.remove('show-overlay');
    document.getElementById('login-panel').classList.remove('slide-in');
  
    setTimeout(() => {
      document.getElementById('login-overlay').classList.add('hidden');
      document.getElementById('login-panel').classList.add('hidden');
    }, 400);
  }
  
  // 배경 클릭시 닫기
  document.getElementById('login-overlay').addEventListener('click', close_login);