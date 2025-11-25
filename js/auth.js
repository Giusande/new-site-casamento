// auth.js
// Registro e login simples em localStorage
(function () {
  const store = {
    get(k, d) {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(d || null));
    },
    set(k, v) {
      localStorage.setItem(k, JSON.stringify(v));
    },
  };

  function makeId() {
    return (
      Date.now().toString(36) +
      Math.floor(Math.random() * 9000 + 1000).toString(36)
    );
  }

  function hash(p) {
    return btoa(p);
  }

  // =============================
  //   REGISTRO
  // =============================
  const regBtn = document.getElementById("btnRegister");
  if (regBtn) {
    regBtn.addEventListener("click", () => {
      const name = (document.getElementById("reg_name") || {}).value || "";
      const email = (document.getElementById("reg_email") || {}).value || "";
      const pass = (document.getElementById("reg_pass") || {}).value || "";
      const pass2 = (document.getElementById("reg_pass2") || {}).value || "";

      if (!name || !email || !pass || !pass2)
        return alert("Preencha todos os campos.");
      if (pass !== pass2) return alert("As senhas não coincidem.");

      const users = store.get("users", []);
      if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return alert("Já existe uma conta com esse email.");
      }

      const uid = makeId();
      const user = {
        id: uid,
        name,
        email: email.toLowerCase(),
        pass: hash(pass),
        createdAt: new Date().toISOString(),
      };

      users.push(user);
      store.set("users", users);

      // criar estruturas padrão para este user
      store.set(`info_${uid}`, {
        casal: name,
        data: "",
        local: "",
        mensagem: "",
        cor: "#b78b2b",
      });
      store.set(`convidados_${uid}`, []);
      store.set(`presentes_${uid}`, []);

      alert("Conta criada com sucesso!");
      location.href = `../login/`;
    });
  }

  // =============================
  //   LOGIN
  // =============================
  const loginBtn = document.getElementById("btnLogin");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = (document.getElementById("login_email") || {}).value || "";
      const pass = (document.getElementById("login_pass") || {}).value || "";

      if (!email || !pass) return alert("Preencha email e senha.");

      const users = store.get("users", []);
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) return alert("Usuário não encontrado.");
      if (user.pass !== hash(pass)) return alert("Senha inválida.");

      // =============================
      // SALVAR LOGIN ATIVO
      // =============================
      store.set("user_logged", {
        uid: user.id,
        nome: user.name,
        email: user.email,
      });

      // redirect para painel do noivo
      location.href = `../../`;
    });
  }
})();
