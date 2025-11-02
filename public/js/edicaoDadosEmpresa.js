const ID_FUNCIONARIO_GERENTE_MOCK = sessionStorage.ID_USUARIO

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
      input: 'form-control',
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
    },
  })

    .then((resultadoSwal) => {
      if (resultadoSwal.isConfirmed) {
        const idFuncionarioGerente = ID_FUNCIONARIO_GERENTE_MOCK;
        const senhaGerente = resultadoSwal.value.senha;

        return fetch(`/gerenciamentoUsuario/ExcluirUsuario/${idFuncionario}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idGerente: idFuncionarioGerente,
            senha: senhaGerente,
          }),
        })
          .then((res) => {
            if (res.ok) {
              exibirSucesso('Exclusão Concluída', 'A Empresa foi excluída com sucesso.');
            } else {
              res.text().then((mensagemErro) => {
                exibirErro(
                  'Erro na Exclusão',
                  mensagemErro || 'Erro desconhecido ao tentar excluir.',
                );
              });
            }
          })
          .catch((err) => {
            exibirErro('Erro de Rede', 'Não foi possível conectar ao servidor: ' + err);
          });
      } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
        exibirErro('Exclusão Cancelada', 'A exclusão da Empresa foi cancelada pelo usuário.');
      }
    });
}

function AtualizarUsuario() {
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
      input: 'form-control',
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
    },
  })

    .then((resultadoSwal) => {
      if (resultadoSwal.isConfirmed) {
        const senhaGerente = resultadoSwal.value.senha;

        AtualizarEmpresa(senhaGerente);
      } else if (resultadoSwal.dismiss === Swal.DismissReason.cancel) {
        exibirErro('Atualização Cancelada', 'A Atualização da Empresa foi cancelada pelo usuário.');
      }
    });
}

function exibirSucesso(titulo, texto) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'success',
    confirmButtonColor: '#0C8186',
    confirmButtonText: 'OK',
  });
}
function exibirErro(titulo, texto) {
  Swal.fire({
    title: titulo,
    text: texto,
    icon: 'error',
    confirmButtonColor: '#0C8186',
    confirmButtonText: 'OK',
  });
}

function getDadosEmpresaBd() {
  fetch(`/edicaoEmpresa/getDadosEmpresaBd/4`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário');
      }
      return response.json();
    })
    .then((data) => {
      if (data.length > 0) {
        const usuario = data[0];

        var cargo = '';
        if (usuario.fkTipoUsuario == 1000) {
          cargo = 'Colaborador';
        } else if (usuario.fkTipoUsuario == 1001) {
          cargo = 'Administrador';
        } else if (usuario.fkTipoUsuario == 1002) {
          cargo = 'Gestor';
        } else {
          cargo = 'Cargo não identificado!';
        }

        // Exibir no HTML
        document.getElementById('nome_funcionario_logado').textContent = usuario.nome;
        document.getElementById('razao_social_atual').textContent = usuario.razaosocial;
        document.getElementById('cnpj_atual').textContent = usuario.cnpj;
        document.getElementById('nome_banco').textContent = usuario.razaosocial;
        document.getElementById('cargo_funcionario_logado').textContent = cargo;
      } else {
        alert('Nenhum dado encontrado para este funcionário.');
      }
    })
    .catch((erro) => {
      console.error('Erro ao carregar dados:', erro);
    });
}

function AtualizarEmpresa(senha) {
  const idFuncionario = sessionStorage.ID_USUARIO
  const razaoSocial = document.getElementById('ipt_razao_social').value;
  const cnpj = document.getElementById('ipt_cnpj').value;

  if (!confirm('Tem certeza que deseja atualizar os dados da empresa?')) return;

  fetch(`/edicaoEmpresa/atualizar/${idFuncionario}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razaoSocialServer: razaoSocial,
      cnpjServer: cnpj,
      senhaServer: senha,
    }),
  })
    .then((response) => {
      if (response.ok) {
        alert('Dados atualizados com sucesso!');
        getDadosEmpresaBd();
      } else {
        throw new Error('Erro ao atualizar os dados da empresa');
      }
    })
    .catch((error) => {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar: ' + error.message);
    });
}

function deleteEmpresa(senha) {
  if (!confirm('Tem certeza que deseja Deletar os dados da empresa?')) return;

  fetch(`/edicaoEmpresa/atualizar/${idFuncionario}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
    .then((response) => {
      if (response.ok) {
        alert('Dados atualizados com sucesso!');
        getDadosEmpresaBd();
      } else {
        throw new Error('Erro ao atualizar os dados da empresa');
      }
    })
    .catch((error) => {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar: ' + error.message);
    });
}
