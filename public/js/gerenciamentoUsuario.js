
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

