document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");

  function login() {
      const userId = userIdInput.value.trim();
      const password = passwordInput.value.trim();

      if (!userId || !password) {
          alert("아이디와 비밀번호를 입력하세요.");
          return;
      }

      // 로그인 로직 (서버 연동 가능)
      alert(`로그인 시도: ${userId}`);
      window.location.href = "index.html"; // 로그인 성공 시 메인 페이지 이동
  }

  // 로그인 버튼 클릭 이벤트
  loginBtn.addEventListener("click", login);

  // Enter 키 입력 시 로그인 실행
  userIdInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          login();
      }
  });

  passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
          login();
      }
  });
});