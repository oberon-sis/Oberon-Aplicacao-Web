// Função que roda ao carregar a página (onload)
function carregarDadosPerfil() {
    var idUsuario = sessionStorage.ID_USUARIO;

    // Se não tiver ID, chuta pro login
    if (!idUsuario || idUsuario == "undefined") {
        window.location.href = "../index.html"; 
        return;
    }

    // Busca os dados do usuário logado
    fetch(`/gerenciamentoUsuario/getUsuariobyID/${idUsuario}`)
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Erro ao buscar dados");
        })
        .then(dados => {
            var usuario = dados[0];

            // 1. Preenche o Banner
            document.getElementById('banner_nome').innerText = usuario.nome;
            document.getElementById('banner_cargo').innerText = usuario.nomeTipoUsuario || usuario.tipoUsuario;

            // 2. Preenche "Dados Atuais" (Visualização)
            document.getElementById('span_nome_atual').innerText = usuario.nome;
            document.getElementById('span_email_atual').innerText = usuario.email;
            document.getElementById('span_cpf_atual').innerText = usuario.cpf;
            document.getElementById('span_cargo_atual').innerText = usuario.nomeTipoUsuario || usuario.tipoUsuario;

            // Guarda o ID do Cargo num campo invisível (necessário pro Backend não quebrar)
            document.getElementById('hdn_id_tipo_usuario').value = usuario.fkTipoUsuario;

            // 3. Preenche os Inputs de Edição
            document.getElementById('input_novo_nome').value = usuario.nome;
            document.getElementById('input_novo_email').value = usuario.email;
            document.getElementById('input_novo_cpf').value = usuario.cpf;
        })
        .catch(erro => {
            console.error(erro);
            Swal.fire("Erro", "Falha ao carregar dados do usuário.", "error");
        });
}

// Função do Botão "Editar"
function AtualizarUsuario() {
    var idUsuario = sessionStorage.ID_USUARIO;
    
    // Pega valores dos inputs
    var nome = document.getElementById('input_novo_nome').value;
    var email = document.getElementById('input_novo_email').value;
    var senha = document.getElementById('input_nova_senha').value;
    var fkTipoUsuario = document.getElementById('hdn_id_tipo_usuario').value;

    // Validação
    if (nome == "" || email == "" || senha == "") {
        Swal.fire("Atenção", "Preencha todos os campos (incluindo a senha) para salvar.", "warning");
        return;
    }

    // Monta o JSON igual ao que usamos na tela de Gestão
    var corpo = {
        idFuncionarioServer: idUsuario,
        nomeServer: nome,
        emailServer: email,
        senhaServer: senha, 
        fkTipoUsuarioServer: fkTipoUsuario
    };

    // Envia pro Backend
    fetch("/gerenciamentoUsuario/salvarEdicao", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(corpo)
    }).then(function (resposta) {
        if (resposta.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Seus dados foram atualizados.',
                confirmButtonColor: '#0C8186'
            }).then(() => {
                // Atualiza a sessão para o nome novo aparecer no menu sem relogar
                sessionStorage.NOME_USUARIO = nome;
                sessionStorage.EMAIL_USUARIO = email;
                
                window.location.reload(); // Recarrega a página
            });
        } else {
            resposta.text().then(texto => {
                Swal.fire("Erro", texto, "error");
            });
        }
    }).catch(function (erro) {
        console.log(erro);
        Swal.fire("Erro", "Erro na conexão com o servidor.", "error");
    });
}