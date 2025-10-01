
function cadastrar() {
    var nome = document.getElementById('nome_input').value;
    var email = document.getElementById('email_input').value;
    var cpf = document.getElementById('cpf_input').value;
    var senha = document.getElementById('senha_input').value;
    var fkTipoUsuario = document.getElementById('tipo_usuario_select').value;
    var idFuncionario = 5; // administrador logado

    if (!nome || !email || !cpf || !senha || !fkTipoUsuario) {
        alert("Preencha todos os campos corretamente!");
        return;
    }

    fetch("/gerenciamentoUsuario/cadastrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nomeServer: nome,
            cpfServer: cpf,
            emailServer: email,
            fkTipoUsuarioServer: fkTipoUsuario,
            senhaServer: senha,
            idFuncionarioServer: idFuncionario
        }),
    })
        .then(res => {
            if (res.ok) alert("Cadastro realizado com sucesso!");
            else res.json().then(json => alert(`Erro: ${json}`));
        })
        .catch(err => alert("Erro de rede: " + err));
}




document.addEventListener("DOMContentLoaded", function () {
    getTipoUsuario();
    getUsuariobyID();
});





function getTipoUsuario() {
    var select = document.getElementById('tipo_usuario_select');

    fetch("/gerenciamentoUsuario/getTipoUsuario")
        .then(res => {
            if (res.status === 204) {
                select.innerHTML = '<option value="" disabled selected>Nenhum tipo cadastrado</option>';
                throw new Error("Nenhum tipo de usuário encontrado.");
            }
            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
            return res.json();
        })
        .then(tipos => {
            select.innerHTML = '<option value="" disabled selected>Selecione o tipo de usuário</option>';
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipoUsuario;
                option.text = tipo.nomeTipo;
                select.appendChild(option);
            });
        })
        .catch(erro => {
            console.error("Falha ao carregar tipos de usuário:", erro);
            select.innerHTML = '<option value="" disabled selected>Erro ao carregar</option>';
        });
}


function getUsuariobyID() {
    var idFuncionario = 17;

    fetch(`/gerenciamentoUsuario/getUsuariobyID/${idFuncionario}`)
        .then(res => {
            if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
            return res.json();
        })
        .then(dados => {
            if (dados.length === 0) {
                alert("Usuário não encontrado!");
                return;
            }

            var usuario = dados[0];

            document.getElementById("nome_atual").innerText = usuario.nome;
            document.getElementById("email_atual").innerText = usuario.email;
            document.getElementById("tipoUsuario_atual").innerText = usuario.tipoUsuario;

            document.getElementById("ipt_nome").value = usuario.nome;
            document.getElementById("ipt_email").value = usuario.email;
            document.getElementById("ipt_senha").value = usuario.senha || "";

            var selectTipo = document.getElementById("tipo_usuario_select");
            if (selectTipo) {
                const intervalo = setInterval(() => {
                    if (selectTipo.options.length > 1) {
                        selectTipo.value = usuario.fkTipoUsuario;
                        clearInterval(intervalo);
                    }
                }, 100);
            }
        })
        .catch(error => console.error("Erro:", error));
}


function salvarEdicao(idFuncionario) {

    var nome = document.getElementById("ipt_nome").value;
    var email = document.getElementById("ipt_email").value;
    var senha = document.getElementById("ipt_senha").value;
    var fkTipoUsuario = document.getElementById("tipo_usuario_select").value;

    if (!nome || !email || !fkTipoUsuario) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }


    var bodyData = {
        idFuncionarioServer: idFuncionario,
        nomeServer: nome,
        emailServer: email,
        senhaServer: senha,
        fkTipoUsuarioServer: fkTipoUsuario
    };

    fetch("/gerenciamentoUsuario/salvarEdicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    })
        .then(res => {
            if (res.ok) {
                alert("Alterações salvas com sucesso!");
                getUsuariobyID();
            } else {
                res.json().then(json => alert(`Erro ao salvar: ${json}`));
            }
        })
        .catch(err => alert("Erro de rede: " + err));
}



function excluir_maquina() {
    Swal.fire({
        title: 'Excluir Máquina',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme abaixo</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
    `,
        icon: 'warning',
        iconColor: '#ffc107',

        showCancelButton: true,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',

        focusConfirm: false,

        buttonsStyling: false,
        customClass: {
            confirmButton: 'btn btn-danger btn-lg mx-2',
            cancelButton: 'btn btn-secondary btn-lg mx-2',
            popup: 'shadow-lg',
            input: 'form-control'
        },
        preConfirm: () => {
            const senha = Swal.getPopup().querySelector('#swal-input-senha').value;
            const confirmarSenha = Swal.getPopup().querySelector('#swal-input-confirmar-senha').value;

            if (!senha || !confirmarSenha) {
                Swal.showValidationMessage('Por favor, preencha ambos os campos de senha.');
                return false;
            }

            if (senha !== confirmarSenha) {
                Swal.showValidationMessage('As senhas digitadas não são iguais.');
                return false;
            }

            return { senha: senha };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Máquina Excluída!',
                text: 'A máquina foi excluída com sucesso.',
                icon: 'success',
                confirmButtonColor: '#0C8186',
                confirmButtonText: 'OK'
            });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Exclusão Cancelada',
                text: 'A exclusão da máquina foi cancelada.',
                icon: 'error',
                confirmButtonColor: '#0C8186',
                confirmButtonText: 'OK'
            });
        }
    });
}