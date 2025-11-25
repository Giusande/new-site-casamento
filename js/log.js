function getUser() {
  return JSON.parse(localStorage.getItem("user_logged") || "null");
}

function logout() {
  localStorage.removeItem("user_logged");
  location.reload();
}

function renderHeaderLogin() {
  const area = document.getElementById("loginArea");
  const user = getUser();

  if (!area) return;

  // ----- Usuário NÃO está logado -----
  if (!user) {
    area.innerHTML = `
      <button class="logar" onclick="window.location.href='./register/login/'">
        Entrar
      </button>
      <button class="cadastro" onclick="window.location.href='./register/cadastro/'">
        Cadastrar
      </button>
    `;
    return;
  }

  // ----- Usuário ESTÁ logado -----
  area.innerHTML = `
    <div class="user-info">
      <span class="username">Olá, <strong>${user.nome}</strong></span>
      <button class="logout-btn" onclick="logout()">Sair</button>
    </div>
  `;
}

// atualizar automaticamente ao carregar a página
renderHeaderLogin();
