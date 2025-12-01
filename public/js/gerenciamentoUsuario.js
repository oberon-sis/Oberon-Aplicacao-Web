var idUsuarioEdicao = null;
let tipoBusca = 'nome';

var inputPesquisa = document.querySelector('.input_pesquisa');
var botaoNome = document.getElementById('nome_busca');
var botaoEmail = document.getElementById('email_busca');
var dropdownTexto = document.querySelector('.dropdown-toggle');
var tabela = document.getElementById('Conteudo_real');

if (botaoNome) {
  botaoNome.addEventListener('click', (e) => {
    e.preventDefault();
    tipoBusca = 'nome';
    dropdownTexto.textContent = 'Nome';
  });
}

if (botaoEmail) {
  botaoEmail.addEventListener('click', (e) => {
    e.preventDefault();
    tipoBusca = 'email';
    dropdownTexto.textContent = 'E-mail';
  });
}

var timeoutPesquisa = null;
if (inputPesquisa) {
  inputPesquisa.addEventListener('input', () => {
    clearTimeout(timeoutPesquisa);
    timeoutPesquisa = setTimeout(() => {
      var valor = inputPesquisa.value.trim();

      if (valor === '') {
        buscarUsuarios(1);
        return;
      }
      PesquisarUsuarios(valor);
    }, 300);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  buscarUsuarios(1);
  getTipoUsuario();
});

function PesquisarUsuarios(valor) {
  tabela.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Pesquisando...</td></tr>`;

  fetch(
    `/gerenciamentoUsuario/PesquisarUsuario?campo=${tipoBusca}&valor=${encodeURIComponent(valor)}`,
  )
    .then((res) => {
      if (res.status === 200) return res.json();
      if (res.status === 204) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Nenhum resultado encontrado.</td></tr>`;
        return [];
      }
      throw new Error('Erro ao buscar usuários.');
    })
    .then((dados) => {
      if (!dados || dados.length === 0) return;
      renderizarTabela(dados);
    })
    .catch((erro) => {
      console.error('Erro na pesquisa:', erro);
      tabela.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erro na pesquisa (${erro.message})</td></tr>`;
    });
}

function buscarUsuarios(pagina = 1) {
  var paginacao = document.querySelector('.pagination');

  tabela.innerHTML = `
        ${Array.from({ length: 5 })
          .map(
            () => `
            <tr><td colspan="7"><div class="placeholder-glow"><span class="placeholder col-12"></span></div></td></tr>
        `,
          )
          .join('')}
    `;

  fetch(`/gerenciamentoUsuario/listarFuncionarios?page=${pagina}`)
    .then((res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    })
    .then((dados) => {
      var loadingElement = document.getElementById('Estrutura_esqueleto_carregamento');
      if (loadingElement) loadingElement.style.display = 'none';

      if (!dados || dados.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhum usuário encontrado.</td></tr>`;
        paginacao.innerHTML = `
            <li class="page-item ${pagina === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="buscarUsuarios(${pagina - 1})">Anterior</a></li>
            <li class="page-item active"><a class="page-link" href="#">${pagina}</a></li>
            <li class="page-item disabled"><a class="page-link" href="#">Próxima</a></li>
        `;
        return;
      }

      renderizarTabela(dados);

      fetch(`/gerenciamentoUsuario/listarFuncionarios?page=${pagina + 1}`)
        .then((nextRes) => (nextRes.ok ? nextRes.json() : []))
        .then((dadosProx) => {
          var temProxima = dadosProx && dadosProx.length > 0;
          paginacao.innerHTML = `
                <li class="page-item ${pagina === 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="buscarUsuarios(${pagina - 1})">Anterior</a></li>
                <li class="page-item active"><a class="page-link" href="#">${pagina}</a></li>
                <li class="page-item ${!temProxima ? 'disabled' : ''}"><a class="page-link" href="#" onclick="buscarUsuarios(${pagina + 1})">Próxima</a></li>
            `;
        })
        .catch(() => {});
    })
    .catch((err) => {
      console.error('Erro ao carregar:', err);
      tabela.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Erro ao carregar usuários.</td></tr>`;
    });
}

function renderizarTabela(dados) {
  tabela.innerHTML = '';
  dados.forEach((u) => {
    const tr = document.createElement('tr');

    const idReal = u.idFuncionario || u.id;

    tr.innerHTML = `
          <td>${idReal}</td>
          <td>${u.nome}</td>
          <td>${u.cpf || '-'}</td>
          <td>${u.email}</td>
          <td>${u.funcao || u.nomeTipoUsuario || u.tipoUsuario || '-'}</td>
          <td>
              <span class="opcao_crud text-primary" data-bs-toggle="modal" onclick="getUsuariobyID(${idReal})" data-bs-target="#modalAtualizarMaquina">
                  <img src="../assets/svg/atualizar_blue.svg" alt=""> Editar
              </span>
          </td>
          <td>
              <span class="opcao_crud text-danger" onclick="ExcluirUsuario(${idReal})">
                  <img src="../assets/svg/excluir_red.svg" alt=""> Excluir
              </span>
          </td>
      `;
    tabela.appendChild(tr);
  });
}

function getTipoUsuario() {
  fetch('/gerenciamentoUsuario/getTipoUsuario')
    .then((res) => {
      if (res.status === 204) throw new Error('Vazio');
      if (!res.ok) throw new Error(res.status);
      return res.json();
    })
    .then((tipos) => {
      var selectCadastro = document.querySelector('#modalCadastrarMaquina select');
      if (selectCadastro) preencherSelect(selectCadastro, tipos);

      var selectEdicao = document.getElementById('select_tipo_update_unico');
      if (selectEdicao) preencherSelect(selectEdicao, tipos);
    })
    .catch((erro) => console.error('Erro ao carregar tipos:', erro));
}

function preencherSelect(elementoSelect, dadosTipos) {
  elementoSelect.innerHTML = '<option value="" disabled selected>Selecione o tipo</option>';
  dadosTipos.forEach((tipo) => {
    const option = document.createElement('option');
    option.value = tipo.idTipoUsuario;
    option.text = tipo.nomeTipo;
    elementoSelect.appendChild(option);
  });
}

function cadastrar() {
  var nome = document.getElementById('nome_input').value;
  var email = document.getElementById('email_input').value;
  var cpf = document.getElementById('cpf_input').value;
  var senha = document.getElementById('senha_input').value;

  var select = document.querySelector('#modalCadastrarMaquina select');
  var fkTipoUsuario = select ? select.value : "";

  var idFuncionario = sessionStorage.ID_USUARIO;

  if (!nome || !email || !cpf || !senha || !fkTipoUsuario) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos corretamente!',
    });
    return;
  }
  if (!idFuncionario || idFuncionario == 'undefined') {
    Swal.fire({
      icon: 'error',
      title: 'Sessão expirada',
      text: 'Faça login novamente.',
    });
    return;
  }

  fetch('/gerenciamentoUsuario/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nomeServer: nome,
      cpfServer: cpf,
      emailServer: email,
      fkTipoUsuarioServer: fkTipoUsuario,
      senhaServer: senha,
      idFuncionarioServer: idFuncionario,
    }),
  })
    .then((res) => {
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado!',
          confirmButtonColor: '#0C8186',
        }).then(() => {
          buscarUsuarios(1);
          document.getElementById('nome_input').value = '';
          document.getElementById('email_input').value = '';
          document.getElementById('cpf_input').value = '';
          document.getElementById('senha_input').value = '';
        });
      } else {
        res.json().then((json) => {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: `Erro: ${json}`,
          });
        });
      }
    })
    .catch((err) => {
      Swal.fire({
        icon: 'error',
        title: 'Erro de rede',
        text: err,
      });
    });
}

function getUsuariobyID(idFuncionario) {
  idUsuarioEdicao = idFuncionario;

  fetch(`/gerenciamentoUsuario/getUsuariobyID/${idFuncionario}`)
    .then((res) => res.json())
    .then((dados) => {
      if (!dados || dados.length === 0) return alert('Usuário não encontrado!');
      var usuario = dados[0];

      if (document.getElementById('nome_atual'))
        document.getElementById('nome_atual').innerText = usuario.nome;
      if (document.getElementById('email_atual'))
        document.getElementById('email_atual').innerText = usuario.email;
      if (document.getElementById('tipoUsuario_atual'))
        document.getElementById('tipoUsuario_atual').innerText =
          usuario.nomeTipoUsuario || usuario.tipoUsuario;

      document.getElementById('ipt_nome').value = usuario.nome;
      document.getElementById('ipt_email').value = usuario.email;
      document.getElementById('ipt_senha').value = usuario.senha || '';

      var selectTipo = document.getElementById('select_tipo_update_unico');
      if (selectTipo) {
        if (selectTipo.options.length <= 1) {
          getTipoUsuario();
          setTimeout(() => (selectTipo.value = usuario.fkTipoUsuario), 500);
        } else {
          selectTipo.value = usuario.fkTipoUsuario;
        }
      }
    })
    .catch((error) => console.error('Erro:', error));
}

function salvarEdicao() {
  if (!idUsuarioEdicao) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Nenhum usuário selecionado.',
    });
    return;
  }

  var selectElement = document.getElementById('select_tipo_update_unico');
  if (!selectElement) {
    Swal.fire({
      icon: 'error',
      title: 'Erro crítico',
      text: 'Select de edição não encontrado.',
    });
    return;
  }

  var nome = document.getElementById('ipt_nome').value;
  var email = document.getElementById('ipt_email').value;
  var senha = document.getElementById('ipt_senha').value;
  var fkTipoUsuario = selectElement.value;

  if (!nome || !email || !fkTipoUsuario) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos obrigatórios',
      text: 'Preencha todos os campos obrigatórios!',
    });
    return;
  }

  var bodyData = {
    idFuncionarioServer: idUsuarioEdicao,
    nomeServer: nome,
    emailServer: email,
    senhaServer: senha,
    fkTipoUsuarioServer: fkTipoUsuario,
  };

  fetch('/gerenciamentoUsuario/salvarEdicao', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  })
    .then((res) => {
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Alterações salvas!',
          confirmButtonColor: '#0C8186',
        }).then(() => buscarUsuarios(1));
      } else {
        res.text().then((text) => {
          Swal.fire({
            icon: 'error',
            title: 'Erro ao salvar',
            text: text,
          });
        });
      }
    })
    .catch((err) => {
      Swal.fire({
        icon: 'error',
        title: 'Erro de rede',
        text: err,
      });
    });
}

function ExcluirUsuario(idFuncionario) {
  var idGerente = sessionStorage.ID_USUARIO;
  if (!idGerente || idGerente == 'undefined') {
    Swal.fire({
      icon: 'error',
      title: 'Sessão Expirada',
      text: 'Faça login novamente para excluir.',
    });
    return;
  }

  Swal.fire({
    title: 'Excluir Usuário',
    html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Confirme com sua senha:</p>
        <label class="form-label font-weight-bold">Senha do Gerente</label>
        <input type="password" id="swal-input-senha" class="form-control" placeholder="********">
      </div>
      <div class="form-group text-left">
        <label class="form-label font-weight-bold">Confirmar Senha</label>
        <input type="password" id="swal-input-confirmar-senha" class="form-control" placeholder="********">
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Excluir',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const senha = Swal.getPopup().querySelector('#swal-input-senha').value;
      const confirmarSenha = Swal.getPopup().querySelector('#swal-input-confirmar-senha').value;
      if (!senha || !confirmarSenha) {
        Swal.showValidationMessage('Preencha as senhas.');
        return false;
      }
      if (senha !== confirmarSenha) {
        Swal.showValidationMessage('As senhas não coincidem.');
        return false;
      }
      return { senha: senha };
    },
  }).then((resultadoSwal) => {
    if (resultadoSwal.isConfirmed) {
      const senhaGerente = resultadoSwal.value.senha;

      fetch(`/gerenciamentoUsuario/ExcluirUsuario/${idFuncionario}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idGerente: idGerente, senha: senhaGerente }),
      })
        .then((res) => {
          if (res.ok) {
            Swal.fire({
              title: 'Sucesso!',
              text: 'Usuário excluído.',
              icon: 'success',
              confirmButtonColor: '#0C8186',
            }).then(() => {
              buscarUsuarios(1);
            });
          } else {
            res.text().then((msg) => exibirErro('Erro', msg));
          }
        })
        .catch((err) => exibirErro('Erro', 'Falha na rede: ' + err));
    }
  });
}

function exibirErro(titulo, texto) {
  Swal.fire({ title: titulo, text: texto, icon: 'error', confirmButtonColor: '#0C8186' });
}
