document.addEventListener('DOMContentLoaded', () => {
  // --- FUNÇÃO PADRONIZADA DO SWEETALERT2 TOAST ---
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

  function aplicarMascaraCPF(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/^(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
    return valor.substring(0, 14);
  }

  const dadosEmpresaString = sessionStorage.getItem('dadosEmpresa');

  if (!dadosEmpresaString) {
    const formElement = document.getElementById('cadastroForm');
    if (formElement) formElement.classList.add('hidden');
    exibirToast('error', 'Acesso negado. É necessário preencher os dados da empresa primeiro.');
    setTimeout(() => {
      window.location.href = './cadastro.html';
    }, 1500);
    return; // Para a execução de todo o script
  }

  const dadosEmpresa = JSON.parse(dadosEmpresaString);
  const form = document.getElementById('cadastroForm');
  const inputNome = document.getElementById('nome');
  const inputCpf = document.getElementById('cpf');
  const inputEmail = document.getElementById('email');
  const inputPassword = document.getElementById('password');
  const inputConfirmPassword = document.getElementById('confirmPassword');
  const togglePassword = document.getElementById('togglePassword');
  const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
  const botaoSubmit = form.querySelector('.login-btn');

  // --- 3. ANEXAÇÃO DOS "OUVINTES" DE EVENTOS (EVENT LISTENERS) ---
  togglePassword.addEventListener('click', () =>
    handleTogglePassword(inputPassword, togglePassword),
  );
  toggleConfirmPassword.addEventListener('click', () =>
    handleTogglePassword(inputConfirmPassword, toggleConfirmPassword),
  );
  inputCpf.addEventListener('input', (e) => {
    e.target.value = aplicarMascaraCPF(e.target.value);
  });

  // Listeners de validação em tempo real (on blur)
  inputNome.addEventListener('blur', handleNomeBlur);
  inputEmail.addEventListener('blur', handleEmailBlur);
  inputCpf.addEventListener('blur', handleCpfBlur);
  inputConfirmPassword.addEventListener('blur', handleConfirmPasswordBlur);

  // Listener principal de submissão do formulário
  form.addEventListener('submit', handleFormSubmit);

  // --- 4. FUNÇÕES DE CALLBACK DOS EVENTOS (EVENT HANDLERS) ---

  // Função principal que lida com a submissão do formulário
  async function handleFormSubmit(event) {
    event.preventDefault();

    const nome = inputNome.value.trim();
    const cpf = inputCpf.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputPassword.value;
    const confirmarSenha = inputConfirmPassword.value;

    if (!nome || !cpf || !email || !senha || !confirmarSenha)
      return exibirToast('error', 'Por favor, preencha todos os campos.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return exibirToast('error', 'O formato do e-mail é inválido.');
    if (!validarCPF(cpf)) return exibirToast('error', 'O CPF informado é inválido.');
    if (senha !== confirmarSenha) return exibirToast('error', 'As senhas não coincidem.');

    const erroSenhaForte = validarSenhaForte(senha);
    if (erroSenhaForte) return exibirToast('error', erroSenhaForte);

    // SUCESSO! ENVIO FINAL AO BACK-END
    const dadosCompletos = {
      empresa: dadosEmpresa,
      usuario: { nome, cpf: cpf.replace(/[^\d]/g, ''), email, senha },
    };

    botaoSubmit.disabled = true;
    botaoSubmit.textContent = 'FINALIZANDO...';

    try {
      const resposta = await fetch('/usuarios/finalizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosCompletos),
      });
      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.mensagem || 'Erro ao finalizar o cadastro.');
      }
      sessionStorage.setItem('nomeUsuarioSimples', nome);
      sessionStorage.removeItem('dadosEmpresa');

      exibirToast('success', 'Cadastro realizado! Redirecionando...');

      setTimeout(() => {
        window.location.href = './login.html';
      }, 2000);
    } catch (erro) {
      exibirToast('error', erro.message);
      restaurarBotao();
    }
  }

  function handleNomeBlur() {
    if (!inputNome.value.trim()) exibirToast('error', 'O campo Nome é obrigatório.');
  }
  function handleEmailBlur() {
    const email = inputEmail.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      exibirToast('error', 'O formato do e-mail é inválido.');
  }
  function handleCpfBlur() {
    const cpf = inputCpf.value.trim();
    if (cpf && !validarCPF(cpf)) exibirToast('error', 'O CPF informado é inválido.');
  }
  function handleConfirmPasswordBlur() {
    const senha = inputPassword.value;
    const confirmarSenha = inputConfirmPassword.value;
    if (confirmarSenha && senha !== confirmarSenha)
      exibirToast('error', 'As senhas não coincidem.');
  }


  function handleTogglePassword(input, button) {
    const img = button.querySelector('img');
    if (input.type === 'password') {
      input.type = 'text';
      img.src = '../assets/marca/hide.png';
      img.alt = 'Ocultar senha';
    } else {
      input.type = 'password';
      img.src = '../assets/marca/show.png';
      img.alt = 'Mostrar senha';
    }
  }


  function validarSenhaForte(senha) {
    if (senha.length < 8) return 'A senha deve ter no mínimo 8 caracteres.';
    if (!/[A-Z]/.test(senha)) return 'A senha deve conter ao menos uma letra maiúscula.';
    if (!/[a-z]/.test(senha)) return 'A senha deve conter ao menos uma letra minúscula.';
    if (!/[0-9]/.test(senha)) return 'A senha deve conter ao menos um número.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha))
      return 'A senha deve conter ao menos um caractere especial.';
    return null;
  }

  function validarCPF(cpf) {
    const cpfLimpo = String(cpf).replace(/[^\d]/g, '');
    if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) return false;
    let numeros = cpfLimpo.substring(0, 9).split('').map(Number);
    let digitosVerificadores = cpfLimpo.substring(9).split('').map(Number);
    let soma = numeros.reduce((acc, numero, index) => acc + numero * (10 - index), 0);
    let primeiroDigitoCalculado = (soma * 10) % 11;
    if (primeiroDigitoCalculado === 10) primeiroDigitoCalculado = 0;
    if (primeiroDigitoCalculado !== digitosVerificadores[0]) return false;
    numeros.push(primeiroDigitoCalculado);
    soma = numeros.reduce((acc, numero, index) => acc + numero * (11 - index), 0);
    let segundoDigitoCalculado = (soma * 10) % 11;
    if (segundoDigitoCalculado === 10) segundoDigitoCalculado = 0;
    if (segundoDigitoCalculado !== digitosVerificadores[1]) return false;
    return true;
  }

  function restaurarBotao() {
    botaoSubmit.disabled = false;
    botaoSubmit.textContent = 'FINALIZAR CADASTRO';
  }
});
