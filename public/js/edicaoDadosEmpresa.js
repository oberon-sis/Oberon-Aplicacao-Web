const ID_FUNCIONARIO_GERENTE_MOCK = 6;

function ExcluirUsuario(idFuncionario) {
    Swal.fire({
        title: 'Excluir Empresa',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Empresa, por favor, confirme com sua senha:</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="****">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="****">
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
                            exibirSucesso('Exclusão Concluída', 'A Empresa foi excluída com sucesso.');
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
                exibirErro('Exclusão Cancelada', 'A exclusão da Empresa foi cancelada pelo usuário.');
            }

        });
}




function AtualizarUsuario(idFuncionario) {
    Swal.fire({
        title: 'Atualizar Empresa',
        html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a atualização da Empresa, por favor, confirme com sua senha:</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
        <input type="password" id="swal-input-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="****">
      </div>
      <div class="form-group text-left">
        <label for="swal-input-confirmar-senha" class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control border-start-0  shadow-none input_pesquisa" placeholder="****">
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
                            exibirSucesso('Atualização Concluída', 'A Empresa foi Atualizada com sucesso.');
                            // Aqui você deve chamar a função para atualizar sua tabela/lista
                            // Por exemplo: atualizarListaMaquinas(); 
                        } else {
                            // Se houver erro no servidor (400, 403, 404, 500)
                            // Tenta ler a mensagem de erro que o backend enviou
                            res.text().then(mensagemErro => {
                                // O controller que fizemos no exemplo anterior envia status 403, 404, etc.
                                exibirErro('Erro na Atualização', mensagemErro || 'Erro desconhecido ao tentar excluir.');
                            });
                        }
                    })
                    .catch(err => {
                        // Erro de rede (fetch falhou)
                        exibirErro('Erro de Rede', 'Não foi possível conectar ao servidor: ' + err);
                    });

            } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
                // Se o usuário clicou em 'Cancelar'
                exibirErro('Atualização Cancelada', 'A Atualização da Empresa foi cancelada pelo usuário.');
            }

        });
}

function exibirSucesso(titulo, texto) { Swal.fire({ title: titulo, text: texto, icon: 'success', confirmButtonColor: '#0C8186', confirmButtonText: 'OK' }); } function exibirErro(titulo, texto) { Swal.fire({ title: titulo, text: texto, icon: 'error', confirmButtonColor: '#0C8186', confirmButtonText: 'OK' }); }