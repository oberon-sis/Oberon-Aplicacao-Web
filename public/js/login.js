document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.querySelector('.password-toggle');
    const divMensagem = document.getElementById('mensagem-validacao'); 
    let mensagemTimeout;
    togglePasswordButton.addEventListener('click', () => {
        const img = togglePasswordButton.querySelector("img");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            img.src = "../assets/marca/hide.png";
            img.alt = "Ocultar senha";
        } else {
            passwordInput.type = "password";
            img.src = "../assets/marca/show.png";
            img.alt = "Mostrar senha";
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
                    senhaServer: senha
                })
            });

            if (!resposta.ok) {

                const erro = await resposta.json();
                throw new Error(erro.mensagem || 'Falha no login.');
            }
            const dadosUsuario = await resposta.json();
            exibirMensagem('sucesso', 'Login realizado com sucesso! Redirecionando...');
            sessionStorage.setItem('usuario', JSON.stringify(dadosUsuario));
            setTimeout(() => {
                window.location.href = './home.html';
            }, 1500);
        } catch (erro) {
            exibirMensagem('erro', erro.message);
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = 'ENTRAR';
        }
    });

    function exibirMensagem(tipo, texto) {
        clearTimeout(mensagemTimeout);
        divMensagem.textContent = texto;
        divMensagem.classList.add(`mensagem-${tipo}`);
        mensagemTimeout = setTimeout(() => {
            divMensagem.textContent = '';
            divMensagem.classList.remove('mensagem-erro', 'mensagem-sucesso');
        }, 1500);
    }
});