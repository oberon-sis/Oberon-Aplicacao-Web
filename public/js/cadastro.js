document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const inputRazaoSocial = document.getElementById('razao');
  const inputCnpj = document.getElementById('CNPJ');
  const divMensagem = document.getElementById('mensagem-validacao');
  let mensagemTimeout;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const botaoSubmit = form.querySelector('.login-btn');
    exibirMensagem('', '');
    const razaoSocial = inputRazaoSocial.value.trim();
    const cnpj = inputCnpj.value.trim();
    if (!razaoSocial || !cnpj) {
      return exibirMensagem('erro', 'Por favor, preencha todos os campos.');
    }
    if (!validarCNPJ(cnpj)) {
      return exibirMensagem('erro', 'O formato do CNPJ é inválido.');
    }
    botaoSubmit.disabled = true;
    botaoSubmit.textContent = 'VERIFICANDO...';
    try {
      const resposta = await fetch('/empresas/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ razaoSocial, cnpj }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();
        throw new Error(erro.mensagem);
      }

      exibirMensagem('sucesso', 'Dados validados! Redirecionando...');

      const dadosEmpresa = { razaoSocial, cnpj: cnpj.replace(/[^\d]/g, '') };
      sessionStorage.setItem('dadosEmpresa', JSON.stringify(dadosEmpresa));

      setTimeout(() => {
        window.location.href = './cadastroUsuario.html';
      }, 1500);
    } catch (erro) {
      exibirMensagem('erro', erro.message);
      restaurarBotao(botaoSubmit);
      sessionStorage.removeItem('dadosEmpresa');
      return;
    }
  });
  /**
   * Função auxiliar para exibir mensagens de feedback na tela.
   * @param {'erro' | 'sucesso'} tipo - O tipo de mensagem.
   * @param {string} texto - O texto a ser exibido.
   */
  function exibirMensagem(tipo, texto) {
    clearTimeout(mensagemTimeout);
    divMensagem.textContent = texto;
    divMensagem.classList.add(`mensagem-${tipo}`);
    if (tipo === 'erro') {
      mensagemTimeout = setTimeout(() => {
        divMensagem.textContent = '';
        divMensagem.classList.remove('mensagem-erro', 'mensagem-sucesso');
      }, 3000);
    } else {
    }
  }
  /**
   * Valida um CNPJ verificando sua estrutura e os dígitos verificadores.
   * @param {string} cnpj - O CNPJ a ser validado.
   * @returns {boolean} - Retorna 'true' se o CNPJ for válido, e 'false' caso contrário.
   */

  // Oi meus amigos, tudo bem ? miguelzinho aqui para explicar como funciona o validarCNPJ. A primeira linha limpa o CNPJ, significa que nosso usuari pode coloca-lo com pontos, traços e mesmo assim serão lidos so os numeros. Utilizamos o regex tanto para retirar os caracteres quanto para conferir se os numeros estão se repetindo, Regex nesse caso é uma serie de funções que passamos pelos caracteres, um exemplo é que /g separa os caracteres em grupos.
  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj === '') return false;
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
  }
  //
  function restaurarBotao(botao) {
    botao.disabled = false;
    botao.textContent = 'AVANÇAR';
  }
});
