function getDadosEmpresaBd() {
    // 1. Pega o ID do usuário logado na sessão
    var idUsuario = sessionStorage.ID_USUARIO;
    var nomeUsuario = sessionStorage.NOME_USUARIO;

    // Se não tiver usuário logado, manda pro login
    if (!idUsuario || idUsuario == "undefined") {
        window.location = "../index.html";
        return;
    }

    // Preenche o "Olá Fulano"
    if (document.getElementById('nome_funcionario_logado')) {
        document.getElementById('nome_funcionario_logado').innerText = nomeUsuario;
    }

    // 2. Busca os dados do USUÁRIO para descobrir a EMPRESA
    fetch(`/gerenciamentoUsuario/getUsuariobyID/${idUsuario}`)
        .then(resposta => {
            if (resposta.ok) return resposta.json();
            throw new Error("Erro ao buscar dados do usuário");
        })
        .then(dadosUsuario => {
            // --- DEBUG IMPORTANTE: OLHE O CONSOLE (F12) ---
            console.log("Dados do Usuário recebidos:", dadosUsuario);
            
            // Tenta pegar fkEmpresa (camelCase) ou fk_empresa (snake_case)
            var fkEmpresa = dadosUsuario[0].fkEmpresa || dadosUsuario[0].fk_empresa;

            console.log("ID da Empresa encontrado:", fkEmpresa);

            // TRAVA DE SEGURANÇA: Se não achou a empresa, para aqui.
            if (!fkEmpresa) {
                Swal.fire("Aviso", "Este usuário não está vinculado a nenhuma empresa!", "warning");
                document.getElementById('nome_banco').innerText = "Sem Empresa";
                document.getElementById('razao_social_atual').innerText = "Não vinculado";
                document.getElementById('cnpj_atual').innerText = "-";
                return; // Encerra a função para não dar erro no SQL
            }

            // Salva o ID da empresa no input oculto
            if(document.getElementById('hdn_id_empresa')) {
                document.getElementById('hdn_id_empresa').value = fkEmpresa;
            }

            // 3. Agora buscamos os dados da EMPRESA com segurança
            return fetch(`/empresas/buscarPorId/${fkEmpresa}`);
        })
        .then(resposta => {
            // Se caiu no return anterior (sem empresa), resposta será undefined
            if (!resposta) return; 
            
            if (resposta.ok) return resposta.json();
            throw new Error("Erro ao buscar dados da empresa");
        })
        .then(dadosEmpresa => {
            if (!dadosEmpresa) return;

            var empresa = dadosEmpresa[0];

            // 4. Preenche os dados na tela
            document.getElementById('nome_banco').innerText = empresa.razaoSocial || "Empresa";
            document.getElementById('razao_social_atual').innerText = empresa.razaoSocial;
            document.getElementById('cnpj_atual').innerText = empresa.cnpj;

            // 5. Preenche os inputs de edição
            document.getElementById('ipt_razao_social').value = empresa.razaoSocial;
            document.getElementById('ipt_cnpj').value = empresa.cnpj;
        })
        .catch(erro => {
            console.error("Erro no fluxo:", erro);
        });
}

function atualizarEmpresa() {
    var idEmpresa = document.getElementById('hdn_id_empresa').value;
    var razaoSocial = document.getElementById('ipt_razao_social').value;
    var cnpj = document.getElementById('ipt_cnpj').value;

    if (!idEmpresa) {
        Swal.fire("Erro", "Não foi possível identificar a empresa para editar.", "error");
        return;
    }

    if (razaoSocial == "" || cnpj == "") {
        Swal.fire("Atenção", "Preencha todos os campos.", "warning");
        return;
    }

    fetch("/empresas/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            idEmpresaServer: idEmpresa,
            razaoSocialServer: razaoSocial,
            cnpjServer: cnpj
        })
    }).then(res => {
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Sucesso!',
                text: 'Dados da empresa atualizados.',
                confirmButtonColor: '#0C8186'
            }).then(() => {
                window.location.reload();
            });
        } else {
            res.text().then(texto => Swal.fire("Erro", texto, "error"));
        }
    }).catch(err => Swal.fire("Erro", "Falha na conexão.", "error"));
}

function deleteEmpresa() {
    var idEmpresa = document.getElementById('hdn_id_empresa').value;

    if (!idEmpresa) {
        Swal.fire("Erro", "Empresa não identificada.", "error");
        return;
    }

    Swal.fire({
        title: 'Tem certeza?',
        text: "Isso apagará a empresa e TODOS os funcionários vinculados!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir tudo!'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/empresas/excluir/${idEmpresa}`, {
                method: "DELETE"
            }).then(res => {
                if (res.ok) {
                    Swal.fire('Excluído!', 'Empresa removida.', 'success')
                    .then(() => window.location = "../index.html");
                } else {
                    res.text().then(txt => Swal.fire('Erro', txt, 'error'));
                }
            });
        }
    });
}