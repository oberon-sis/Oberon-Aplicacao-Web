// const URL_BASE = "http://localhost:3333"; // endereço do backend
// const tbody = document.getElementById("Conteudo_real");
// const pagination = document.querySelector(".pagination");
// const skeleton = document.getElementById("Estrutura_esqueleto_carregamento");

// let paginaAtual = 1;

document.addEventListener("DOMContentLoaded", function () {
    buscarUsuarios(1);
});

function buscarUsuarios(pagina = 1) {
    const tabela = document.getElementById("Conteudo_real");
    const paginacao = document.querySelector(".pagination");

    tabela.innerHTML = `
        ${Array.from({ length: 5 }).map(() => `
            <tr>
                <td colspan="6">
                    <div class="placeholder-glow">
                        <span class="placeholder col-12"></span>
                    </div>
                </td>
            </tr>
        `).join("")}
    `;

    fetch(`/gerenciamentoUsuario/listarFuncionarios?page=${pagina}`)
        .then(res => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
        })
        .then(dados => {
            if (!dados || dados.length === 0) {
                tabela.innerHTML = `<tr><td colspan="6" class="text-center">Nenhum usuário encontrado.</td></tr>`;
                paginacao.innerHTML = "";
                return;
            }

        
            tabela.innerHTML = "";
            dados.forEach(u => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                       <td>${u.id}</td>
                     <td>${u.nome}</td>
                     <td>${u.cpf}</td>
                     <td>${u.email}</td>
                     <td>${u.funcao}</td>
            <td>
                <span class="opcao_crud text-primary" data-bs-toggle="modal" onclick="getUsuariobyID(${u.id})"
                    data-bs-target="#modalAtualizarMaquina">
                    <img src="../assets/svg/atualizar_blue.svg" alt="">
                    Atualizar<i class="bi bi-arrow-clockwise"></i>
                </span>
            </td>
            <td>
                <span class="opcao_crud text-danger" onclick="ExcluirUsuario(${u.id})"> 
                <img src="../assets/svg/excluir_red.svg" alt="">
                Excluir<i class="bi bi-trash"></i>
                </span>
            </td>
                `;
                tabela.appendChild(tr);
            });

            paginacao.innerHTML = `
                <li class="page-item ${pagina === 1 ? "disabled" : ""}">
                    <a class="page-link" href="#" onclick="buscarUsuarios(${pagina - 1})">Anterior</a>
                </li>
                <li class="page-item active"><a class="page-link" href="#">${pagina}</a></li>
                <li class="page-item">
                    <a class="page-link" href="#" onclick="buscarUsuarios(${pagina + 1})">Próxima</a>
                </li>
            `;
        })
        .catch(err => {
            console.error("Erro ao carregar usuários:", err);
            tabela.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Erro ao carregar usuários (${err.message})</td></tr>`;
        });
}





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
    // getUsuariobyID();
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


function getUsuariobyID(idFuncionario) {
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
    console.log(bodyData)

    fetch("/gerenciamentoUsuario/salvarEdicao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    }) 
    .then(res => {
            if (res.ok) {
                alert("Alterações salvas com sucesso!");
            } else {
                res.json().then(json => alert(`Erro ao salvar: ${json}`));
            }
        })
        .catch(err => alert("Erro de rede: " + err));
}


// VARIÁVEL FIXA (MOCKADA) MANTIDA CONFORME SOLICITADO
const ID_FUNCIONARIO_GERENTE_MOCK = 6; 

function ExcluirUsuario(idFuncionario) {
    Swal.fire({
        title: 'Excluir Máquina',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme com sua senha:</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha do Gerente</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="********">
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

            // O ideal aqui é que a senha seja a do gerente autenticado na sessão, 
            // mas mantive a validação de confirmação que você criou.
            if (senha !== confirmarSenha) {
                Swal.showValidationMessage('As senhas digitadas não são iguais.');
                return false;
            }

            return { senha: senha };
        }
    })
    // Primeiro .then: Lida com o resultado do Swal (se foi confirmado ou cancelado)
    .then((resultadoSwal) => { 
        
        // Verifica se o usuário clicou em 'Excluir'
        if (resultadoSwal.isConfirmed) {
            
            // Variáveis Mockadas (FIXAS)
            const idFuncionarioGerente = ID_FUNCIONARIO_GERENTE_MOCK; 
            const senhaGerente = resultadoSwal.value.senha; // Pega a senha digitada

            // CHAMADA FETCH
            return fetch(`/gerenciamentoUsuario/ExcluirUsuario/${idFuncionario}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idGerente: idFuncionarioGerente,
                    senha: senhaGerente
                })
            })
            // Segundo .then: Lida com a RESPOSTA do servidor (res)
            .then(res => {
                console.log("=====================")
                console.log(res)
                console.log("=====================")
                // Se a resposta for OK (status 200, 204 etc.)
                if (res.ok) {
                    exibirSucesso('Exclusão Concluída', 'A Máquina foi excluída com sucesso.');
                    // Aqui você deve chamar a função para atualizar sua tabela/lista
                    // Por exemplo: atualizarListaMaquinas(); 
                } else {
                    // Se houver erro no servidor (400, 403, 404, 500)
                    // Tenta ler a mensagem de erro que o backend enviou
                    res.text().then(mensagemErro => {
                         // O controller que fizemos no exemplo anterior envia status 403, 404, etc.
                        exibirErro('Erro na Exclusão', mensagemErro || 'Erro desconhecido ao tentar excluir.');
                    });
                }
            })
            .catch(err => {
                // Erro de rede (fetch falhou)
                exibirErro('Erro de Rede', 'Não foi possível conectar ao servidor: ' + err);
            });
            
        } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
            // Se o usuário clicou em 'Cancelar'
            exibirErro('Exclusão Cancelada', 'A exclusão da Máquina foi cancelada pelo usuário.');
        }

    });
}


// Funções auxiliares para SweetAlert (melhora a organização)
function exibirSucesso(titulo, texto) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'success',
        confirmButtonColor: '#0C8186',
        confirmButtonText: 'OK'
    });
}

function exibirErro(titulo, texto) {
    Swal.fire({
        title: titulo,
        text: texto,
        icon: 'error',
        confirmButtonColor: '#0C8186',
        confirmButtonText: 'OK'
    });
}

// function a(afdsa) {
//     Conteudo_real.innerHTML += `
//                         <tr>
//                         <td>001</td>
//                         <td><i class="bi bi-person-circle me-2"></i>Exemplo</td>
//                         <td>{}gygjhg} Text</td>
//                         <td>Exemplo Text</td>
//                         <td>Exemplo Text</td>
//                         <td>Exemplo Text</td>
//                         <td>Exemplo Text</td>
//                         <td>Exemplo Text</td>
//                         <td><span class="opcao_crud text-primary" data-bs-toggle="modal"
//                                 data-bs-target="#modalAtualizarMaquina"
//                                 onclick="getUsuariobyID(${afdsa})"
                                
//                                 >
//                                 <img src="../assets/svg/atualizar_blue.svg" alt="">
//                                 Atualizar<i class="bi bi-arrow-clockwise"
//                                 ></i></span>
//                         </td>
//                         <td><span class="opcao_crud text-danger" onclick="excluir_maquina()">
//                                 <img src="../assets/svg/excluir_red.svg" alt="">
//                                 Excluir<i class="bi bi-trash"></i></span>
//                         </td>
//                         <!-- <td><span class="opcao_crud detalhes">
//                                 <img src="../assets/svg/eye_black.svg" alt="">
//                                 Detalhes<i class="bi bi-trash"></i></span>
//                         </td> -->
//                     </tr>
    
//     `
// }
// setTimeout(() => {
//     Estrutura_esqueleto_carregamento.style.display = "none"
// }, 2000);

// Conteudo_real.innerHTML = ""
// a(1)
// a(2)
// a(3)
// a(4)
// a(5)
// a(6)