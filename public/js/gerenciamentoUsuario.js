
function cadastrar() {
    var ID_FUNCIONARIO_LOGADO = 5; 
    
    var nome = document.getElementById('nome_input').value;
    var email = document.getElementById('email_input').value;
    var cpf = document.getElementById('cpf_input').value; 
    var senha = document.getElementById('senha_input').value;

    var fkTipoUsuario = 1001; 

    var idFuncionario = ID_FUNCIONARIO_LOGADO; 


    if (!nome || !email || !cpf || !senha) {
      alert("OS dados que voce forneceu estao errados....")
    }

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
            alert("Cadastro realizado com sucesso!");
        } else if (resposta.status === 204) {
             alert("Erro no cadastro: Funcionário logado não tem vínculo de empresa.");             
        } else {
            resposta.json().then(json => {
                const erroMsg = json.message || resposta.statusText;
                alert(`Houve um erro ao tentar realizar o cadastro! ${erroMsg}`);
            }).catch(() => {
                alert(`Erro desconhecido! Status: ${resposta.status}`);
            });
        }
    })
    .catch(function (erro) {
        console.log(`#ERRO: ${erro}`);
        alert("Erro de rede ao conectar com o servidor.");
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

            document.getElementById("nome_atual").innerText = usuario.nome;
            document.getElementById("email_atual").innerText = usuario.email;
            // document.getElementById("telefone_atual").innerText = usuario.telefone || "Não informado";
            // document.getElementById("cargo_atual").innerText = usuario.cargo || "Não informado";
            document.getElementById("tipoUsuario_atual").innerText = usuario.tipoUsuario;

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




