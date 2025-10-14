document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CONFIGURAÇÃO INICIAL E BARREIRA DE SEGURANÇA ---
    const dadosEmpresaString = sessionStorage.getItem('dadosEmpresa');

    if (!dadosEmpresaString) {
        const formElement = document.getElementById('cadastroForm');
        const divMensagemElement = document.getElementById('mensagem-validacao');
        if (formElement) formElement.classList.add('hidden');
        if (divMensagemElement) {
            divMensagemElement.textContent = 'Acesso negado. É necessário preencher os dados da empresa primeiro.';
            divMensagemElement.className = 'mensagem mensagem-erro';
        }
        setTimeout(() => { window.location.href = './cadastro.html'; }, 1500);
        return; // Para a execução de todo o script
    }

    // --- 2. SELEÇÃO DOS ELEMENTOS DO DOM (VARIÁVEIS GLOBAIS DO SCRIPT) ---
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
    const divMensagem = document.getElementById('mensagem-validacao');
    let mensagemTimeout;

    // --- 3. ANEXAÇÃO DOS "OUVINTES" DE EVENTOS (EVENT LISTENERS) ---
    togglePassword.addEventListener('click', () => handleTogglePassword(inputPassword, togglePassword));
    toggleConfirmPassword.addEventListener('click', () => handleTogglePassword(inputConfirmPassword, toggleConfirmPassword));

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
        divMensagem.textContent = '';
        divMensagem.classList.remove('mensagem-erro', 'mensagem-sucesso');
        
        const nome = inputNome.value.trim();
        const cpf = inputCpf.value.trim();
        const email = inputEmail.value.trim();
        const senha = inputPassword.value;
        const confirmarSenha = inputConfirmPassword.value;

        // VALIDAÇÕES FINAIS EM ORDEM
        if (!nome || !cpf || !email || !senha || !confirmarSenha) return exibirMensagem('erro', 'Por favor, preencha todos os campos.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return exibirMensagem('erro', 'O formato do e-mail é inválido.');
        if (!validarCPF(cpf)) return exibirMensagem('erro', 'O CPF informado é inválido.');
        if (senha !== confirmarSenha) return exibirMensagem('erro', 'As senhas não coincidem.');
        
        const erroSenhaForte = validarSenhaForte(senha);
        if (erroSenhaForte) return exibirMensagem('erro', erroSenhaForte);

        // SUCESSO! ENVIO FINAL AO BACK-END
        const dadosCompletos = { empresa: dadosEmpresa, usuario: { nome, cpf: cpf.replace(/[^\d]/g, ''), email, senha } };
        
        botaoSubmit.disabled = true;
        botaoSubmit.textContent = 'FINALIZANDO...';

        try {
            const resposta = await fetch('http://localhost:3333/usuarios/finalizar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCompletos) });
            if (!resposta.ok) {
                const erro = await resposta.json();
                throw new Error(erro.mensagem || 'Erro ao finalizar o cadastro.');
            }
            sessionStorage.setItem('nomeUsuarioSimples', nome);
            sessionStorage.removeItem('dadosEmpresa');
            exibirMensagem('sucesso', 'Cadastro realizado! Redirecionando...');
            setTimeout(() => { window.location.href = './login.html'; }, 2000);
        } catch (erro) {
            exibirMensagem('erro', erro.message);
            restaurarBotao();
        }
    }

    // Funções para validação em tempo real
    function handleNomeBlur() { if (!inputNome.value.trim()) exibirMensagem('erro', 'O campo Nome é obrigatório.'); }
    function handleEmailBlur() { const email = inputEmail.value.trim(); if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) exibirMensagem('erro', 'O formato do e-mail é inválido.'); }
    function handleCpfBlur() { const cpf = inputCpf.value.trim(); if (cpf && !validarCPF(cpf)) exibirMensagem('erro', 'O CPF informado é inválido.'); }
    function handleConfirmPasswordBlur() { const senha = inputPassword.value; const confirmarSenha = inputConfirmPassword.value; if (confirmarSenha && senha !== confirmarSenha) exibirMensagem('erro', 'As senhas não coincidem.'); }  

    // --- 5. FUNÇÕES AUXILIARES (VALIDAÇÃO, FEEDBACK, ETC.) ---

    function handleTogglePassword(input, button) {
        const img = button.querySelector("img");
        if (input.type === "password") {
            input.type = "text";
            img.src = "../assets/marca/hide.png";
            img.alt = "Ocultar senha";
        } else {
            input.type = "password";
            img.src = "../assets/marca/show.png";
            img.alt = "Mostrar senha";
        }
    }
    
    function exibirMensagem(tipo, texto) {
        clearTimeout(mensagemTimeout);
        divMensagem.textContent = texto;
        divMensagem.classList.add(`mensagem-${tipo}`);
        mensagemTimeout = setTimeout(() => {
            divMensagem.textContent = '';
            divMensagem.classList.remove('mensagem-erro', 'mensagem-sucesso');
        }, 1000);
    }

    function validarSenhaForte(senha) {
        if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres.";
        if (!/[A-Z]/.test(senha)) return "A senha deve conter ao menos uma letra maiúscula.";
        if (!/[a-z]/.test(senha)) return "A senha deve conter ao menos uma letra minúscula.";
        if (!/[0-9]/.test(senha)) return "A senha deve conter ao menos um número.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) return "A senha deve conter ao menos um caractere especial.";
        return null;
    }

    function validarCPF(cpf) {
        const cpfLimpo = String(cpf).replace(/[^\d]/g, '');
        if (cpfLimpo.length !== 11 || /^(\d)\1+$/.test(cpfLimpo)) return false;
        let numeros = cpfLimpo.substring(0, 9).split('').map(Number);
        let digitosVerificadores = cpfLimpo.substring(9).split('').map(Number);
        let soma = numeros.reduce((acc, numero, index) => acc + (numero * (10 - index)), 0);
        let primeiroDigitoCalculado = (soma * 10) % 11;
        if (primeiroDigitoCalculado === 10) primeiroDigitoCalculado = 0;
        if (primeiroDigitoCalculado !== digitosVerificadores[0]) return false;
        numeros.push(primeiroDigitoCalculado);
        soma = numeros.reduce((acc, numero, index) => acc + (numero * (11 - index)), 0);
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