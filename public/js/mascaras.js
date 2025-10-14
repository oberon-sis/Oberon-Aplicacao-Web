function aplicarMascara(input, mascara) {
  input.addEventListener("input", () => {
    let valor = input.value.replace(/\D/g, ""); // remove tudo que não é número
    let novoValor = "";
    let i = 0;

    for (let m of mascara) {
      if (m === "#") {
        if (valor[i]) {
          novoValor += valor[i];
          i++;
        } else {
          break;
        }
      } else {
        if (valor[i]) {
          novoValor += m;
        }
      }
    }

    input.value = novoValor;
  });
}

function limparMascara(valor) {
  return valor.replace(/\D/g, "");
}

const cpfInput = document.getElementById("cpf");
const cnpjInput = document.getElementById("CNPJ");
const telefoneInput = document.getElementById("telefone"); // caso tenha

if (cpfInput) aplicarMascara(cpfInput, "###.###.###-##");
if (cnpjInput) aplicarMascara(cnpjInput, "##.###.###/####-##");
if (telefoneInput) aplicarMascara(telefoneInput, "(##) #####-####");

const cadastroForm = document.getElementById("cadastroForm");
if (cadastroForm) {
  cadastroForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const cpf = limparMascara(document.getElementById("cpf").value);
    const email = document.getElementById("email").value;
    const senha = document.getElementById("password").value;


    fetch("http://localhost:3000/usuario/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cpf, email, senha })
    })
      .then(resp => resp.json())
      .then(data => alert(data.msg))
      .catch(err => console.error(err));
  });
}


const empresaForm = document.getElementById("loginForm"); 
if (empresaForm) {
  empresaForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const razao = document.getElementById("razao").value;
    const cnpj = limparMascara(document.getElementById("CNPJ").value);

    fetch("http://localhost:3000/empresa/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razao, cnpj })
    })
      .then(resp => resp.json())
      .then(data => alert(data.msg))
      .catch(err => console.error(err));
  });
}

function aplicarMascaraMacAddress(input, separador = ":") {
    let valorLimpo = input.value.replace(/[^a-fA-F0-9]/g, '');
    valorLimpo = valorLimpo.substring(0, 12);
    let macFormatado = '';
    for (let i = 0; i < valorLimpo.length; i++) {
        macFormatado += valorLimpo[i];
        if ((i + 1) % 2 === 0 && i !== valorLimpo.length - 1) {
            macFormatado += separador;
        }
    }
    input.value = macFormatado.toUpperCase();
}

function aplicarMascaraPorcentagem(input) {
    let valor = input.value;
    const unidade = ' %'; 
    const cursorPosition = input.selectionStart;
    let valorLimpo = valor.replace(unidade, '').replace(/[^0-9.]/g, '');
    let numValor = parseFloat(valorLimpo);
    
    if (isNaN(numValor) || numValor < 0) {
        input.value = '';
        return;
    }

    if (numValor > 100) {
        valorLimpo = '100';
    } else {
        valorLimpo = valorLimpo.replace(/^0+(?=\d)/, '');
    }

    const valorFormatado = valorLimpo + unidade;

    input.value = valorFormatado;
    const newCursorPosition = valorFormatado.length - unidade.length;
    if (cursorPosition < valor.length - unidade.length) {
        input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }

}
function aplicarMascaraMbps(input) {
    let valor = input.value;
    const unidade = ' Mbps';

    const cursorPosition = input.selectionStart;

    let valorLimpo = valor.replace(unidade, '').replace(/[^0-9]/g, '');

    if (valorLimpo.length > 1 && valorLimpo.startsWith('0')) {
        valorLimpo = parseInt(valorLimpo, 10).toString();
    }
    if (valorLimpo === "NaN" || valorLimpo === "") {
        input.value = "";
        return;
    }
    const valorFormatado = valorLimpo + unidade;
    input.value = valorFormatado;
    const newCursorPosition = valorFormatado.length - unidade.length;
    if (cursorPosition < valor.length - unidade.length) {
        input.setSelectionRange(cursorPosition, cursorPosition);
    } else {
        input.setSelectionRange(newCursorPosition, newCursorPosition);
    }
}