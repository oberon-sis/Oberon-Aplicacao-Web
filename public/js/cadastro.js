document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const inputRazaoSocial = document.getElementById('razao');
  const inputCnpj = document.getElementById('CNPJ');
  // FUNÇÃO PADRONIZADA DO SWEETALERT2 TOAST
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

  function aplicarMascaraCNPJ(valor) {
    valor = valor.replace(/\D/g, '');
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    return valor.substring(0, 18);
  }

  inputCnpj.addEventListener('input', (e) => {
    e.target.value = aplicarMascaraCNPJ(e.target.value);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const botaoSubmit = form.querySelector('.login-btn');
    const razaoSocial = inputRazaoSocial.value.trim();
    const cnpj = inputCnpj.value.trim();
    if (!razaoSocial || !cnpj) {
      return exibirToast('error', 'Por favor, preencha todos os campos.');
    }
    if (!validarCNPJ(cnpj)) {
      return exibirToast('error', 'O formato do CNPJ é inválido.');
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

      exibirToast('success', 'Dados validados! Redirecionando...');

      const dadosEmpresa = { razaoSocial, cnpj: cnpj.replace(/[^\d]/g, '') };
      sessionStorage.setItem('dadosEmpresa', JSON.stringify(dadosEmpresa));

      setTimeout(() => {
        window.location.href = './cadastroUsuario.html';
      }, 1500);
    } catch (erro) {
      exibirToast('error', erro.message); 
      restaurarBotao(botaoSubmit);
      sessionStorage.removeItem('dadosEmpresa');
      return;
    }
  });
  /**
   * Valida um CNPJ verificando sua estrutura e os dígitos verificadores.
   * @param {string} cnpj - O CNPJ a ser validado.
   * @returns {boolean} - Retorna 'true' se o CNPJ for válido, e 'false' caso contrário.
   */
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
  function restaurarBotao(botao) {
    botao.disabled = false;
    botao.textContent = 'AVANÇAR';
  }
});
