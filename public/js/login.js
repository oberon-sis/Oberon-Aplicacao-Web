document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordButton = document.querySelector('.password-toggle');

  function exibirToast(icone, texto) {
    const COR_DE_FUNDO = '#1a1a1a';
    const COR_DO_ICONE = 'white';
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: COR_DE_FUNDO,
      iconColor: COR_DO_ICONE,
      color: COR_DO_ICONE,

      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
    Toast.fire({
      icon: icone,
      title: texto,
    });
  }

  togglePasswordButton.addEventListener('click', () => {
    const img = togglePasswordButton.querySelector('img');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      img.src = '../assets/marca/hide.png';
      img.alt = 'Ocultar senha';
    } else {
      passwordInput.type = 'password';
      img.src = '../assets/marca/show.png';
      img.alt = 'Mostrar senha';
    }
  });

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value;
    const senha = passwordInput.value;
    const botaoSubmit = loginForm.querySelector('.login-btn');

    botaoSubmit.disabled = true;
    botaoSubmit.textContent = 'ENTRANDO...';

    try {
      const resposta = await fetch('/usuarios/autenticar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailServer: email,
          senhaServer: senha,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        // Corrigi um erro de sintaxe que tinha aqui (tinha dois "new")
        throw new Error(erro.mensagem || 'Falha no login.');
      }

      const dadosUsuario = await resposta.json();

      sessionStorage.ID_USUARIO = dadosUsuario.idFuncionario || dadosUsuario.id;
      console.log("ID SALVO NA SESSÃO:", sessionStorage.ID_USUARIO);
      sessionStorage.NOME_USUARIO = dadosUsuario.nome;
      sessionStorage.EMAIL_USUARIO = dadosUsuario.email;
   
      sessionStorage.setItem('usuario', JSON.stringify(dadosUsuario));
 

      exibirToast('success', 'Login realizado com sucesso! Redirecionando...');
      
      setTimeout(() => {
        window.location.href = './home.html';
      }, 1500);

    } catch (erro) {
      console.error(erro);
      exibirToast('error', erro.message || 'Credenciais inválidas');
      botaoSubmit.disabled = false;
      botaoSubmit.textContent = 'ENTRAR';
    }
  });
});