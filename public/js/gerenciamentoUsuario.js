
function cadastrar() {
    var nome = "Jhoe1l";
    var cpf = "12345678940"
    var email = "jhoel.maman1i@gmail.com"
    var fkTipoUsuario = 1000
    var senha = "123456789"
    // var idFuncionario = sessionStorage.ID_USUARIO
    var idFuncionario = 1

    fetch("/gerenciamentoUsuario/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nomeServer: nome,
            cpfServer: cpf,
            emailServer: email,
            fkTipoUsuarioServer: fkTipoUsuario,
            senhaServer: senha,
            idFuncionarioServer: idFuncionario,
        }),
    })
        .then(function (resposta) {
            console.log("resposta: ", resposta);

            if (resposta.ok) {

                alert(
                    "Cadastro realizado com sucesso! Redirecionando para tela de Login...");

                setTimeout(() => {
                    alert("deu")
                }, "2000");

            } else {
                throw "Houve um erro ao tentar realizar o cadastro!";
            }
        })
        .catch(function (resposta) {
            console.log(`#ERRO: ${resposta}`);
        });

    return false;
}


function getUsuariobyID() {
        var idFuncionario = 2;
      fetch(`/gerenciamentoUsuario/getUsuariobyID/${idFuncionario}`)
        .then(res => {
          if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
          return res.json();
        })
        .then(dados => {
          if (dados.length > 0) {
            let usuario = dados[0];

            // Exibir dados atuais (fixos)
            document.getElementById("nome_atual").innerText = usuario.nome;
            document.getElementById("email_atual").innerText = usuario.email;
            // document.getElementById("telefone_atual").innerText = usuario.telefone || "Não informado";
            // document.getElementById("cargo_atual").innerText = usuario.cargo || "Não informado";
            document.getElementById("tipoUsuario_atual").innerText = usuario.tipoUsuario;

            // Preencher inputs com valores atuais
            document.getElementById("ipt_nome").value = usuario.nome;
            document.getElementById("ipt_email").value = usuario.email;
            // document.getElementById("ipt_telefone").value = usuario.telefone || "";
            document.getElementById("ipt_cargo").value = usuario.cargo || "";
            document.getElementById("ipt_tipoUsuario").value = usuario.tipoUsuario;
            document.getElementById("ipt_senha").value = usuario.senha || "";
          } else {
            alert("Usuário não encontrado!");
          }
        })
        .catch(error => console.error("Erro:", error));
    }




