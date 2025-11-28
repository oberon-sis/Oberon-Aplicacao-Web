const usuarioString = sessionStorage.getItem('usuario');
const usuarioObjeto = JSON.parse(usuarioString);
const ID_GERENTE = usuarioObjeto.idFuncionario;
const limitePorPagina = 14;

let parametroOberon = {};
let parametroEmpresa = {};

let paginaAtual = 1;
let valor_parametro = 'nome';
let termo = '';

let ipt_nome_cad, ipt_modelo_cad, ipt_mac_cad;
let ipt_pesquisa;

function limparEConverterLimite(valorBruto) {
  if (!valorBruto) return null;
  let valorLimpo = String(valorBruto)
    .replace(/ %|%| Mbps|Mbps/g, '')
    .trim();
  valorLimpo = valorLimpo.replace(/,/g, '.');
  const valorNumerico = parseFloat(valorLimpo);
  return isNaN(valorNumerico) ? null : valorNumerico;
}

function mudar_icone_on(id_da_img) {
  const icone = document.getElementById(id_da_img);
  if (!icone) return;
  if (!icone.dataset.srcNormal) {
    icone.dataset.srcNormal = icone.src;
  }
  const srcHover = icone.dataset.hoverSrc;
  icone.src = srcHover;
}

function mudar_icone_lv(id_da_img) {
  const icone = document.getElementById(id_da_img);
  if (!icone) return;
  const srcNormal = icone.dataset.srcNormal;
  icone.src = srcNormal;
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

function debounce(func, delay = 250) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function buscarEFiltrar(termoDeBusca) {
  if (valor_parametro == '') {
    valor_parametro = 'nome';
  }
  const termoFiltrado = termoDeBusca.trim();
  carregarMaquinas(paginaAtual, valor_parametro, termoFiltrado);
}

const buscarDebounced = debounce(buscarEFiltrar, 400);

function getTermo() {
  termo = ipt_pesquisa.value;
}

function atualizar_parametro_lista(valor) {
  let span_txt = document.getElementById('valor_pesquisa');
  let texto = '';

  if (valor == 1) {
    texto = 'Nome';
    valor_parametro = 'nome';
  } else if (valor == 2) {
    texto = 'Hostname';
    valor_parametro = 'hostname';
  } else if (valor == 3) {
    texto = 'Mac Address';
    valor_parametro = 'macAddress';
  } else if (valor == 4) {
    texto = 'IP';
    valor_parametro = 'ip';
  }

  span_txt.innerHTML = texto;
  carregarMaquinas(1, valor_parametro, termo);
}

function navigateSteps(direction, step1, step2, btnAvancar, btnVoltar, btnCadastrar) {
  if (direction === 'next') {
    step1.style.display = 'none';
    btnAvancar.style.display = 'none';
    step2.style.display = 'block';
    btnVoltar.style.display = 'inline-block';
    btnCadastrar.style.display = 'inline-block';
  } else if (direction === 'prev') {
    step2.style.display = 'none';
    btnVoltar.style.display = 'none';
    btnCadastrar.style.display = 'none';
    step1.style.display = 'block';
    btnAvancar.style.display = 'inline-block';
  }
}

function navigateStepsUpd(
  direction,
  step1Upd,
  step2Upd,
  btnAvancarUpd,
  btnVoltarUpd,
  btnCadastrarUpd,
  dadosAtuaisIdentificacao,
  dadosAtuaisAlertas,
) {
  if (direction === 'next') {
    step1Upd.style.display = 'none';
    btnAvancarUpd.style.display = 'none';
    step2Upd.style.display = 'block';
    btnVoltarUpd.style.display = 'inline-block';
    btnCadastrarUpd.style.display = 'inline-block';
    dadosAtuaisIdentificacao.style.display = 'none';
    dadosAtuaisAlertas.style.display = 'block';
  } else if (direction === 'prev') {
    step2Upd.style.display = 'none';
    btnVoltarUpd.style.display = 'none';
    btnCadastrarUpd.style.display = 'none';
    step1Upd.style.display = 'block';
    btnAvancarUpd.style.display = 'inline-block';
    dadosAtuaisIdentificacao.style.display = 'block';
    dadosAtuaisAlertas.style.display = 'none';
  }
}

function toggleParametros(checkboxEmpresa, checkboxOberon, paramsContainer, paramInputs) {
  const isDisabled = checkboxEmpresa.checked || checkboxOberon.checked;

  let dataSource = null;
  if (checkboxOberon.checked) {
    dataSource = parametroOberon;
  } else if (checkboxEmpresa.checked) {
    dataSource = parametroEmpresa;
  }

  let sufixo = '';
  if (paramInputs.length > 0) {
    if (paramInputs[0].id.includes('_cad')) sufixo = '_cad';
    else if (paramInputs[0].id.includes('_upd')) sufixo = '_upd';
  }

  const componentes = ['cpu', 'ram', 'disco', 'rede'];

  componentes.forEach((tipo) => {
    const iptOcioso = document.getElementById(`ipt_${tipo}_ocioso${sufixo}`);
    const iptAtencao = document.getElementById(`ipt_${tipo}_atencao${sufixo}`);
    const iptCritico = document.getElementById(`ipt_${tipo}_critico${sufixo}`);

    const chaveDados = tipo.toUpperCase();

    if (dataSource && dataSource[chaveDados]) {
      // Ocioso <-> ACEITÁVEL
      const valOcioso = dataSource[chaveDados].ACEITÁVEL?.limite ?? '';
      const valAtencao = dataSource[chaveDados].ATENÇÃO?.limite ?? '';
      const valCritico = dataSource[chaveDados].CRÍTICO?.limite ?? '';

      if (iptOcioso) iptOcioso.value = valOcioso;
      if (iptAtencao) iptAtencao.value = valAtencao;
      if (iptCritico) iptCritico.value = valCritico;
    } else if (isDisabled) {
      // Se marcou checkbox, mas não tem dados (limpa os inputs)
      if (iptOcioso) iptOcioso.value = '';
      if (iptAtencao) iptAtencao.value = '';
      if (iptCritico) iptCritico.value = '';
    }

    // Bloqueia ou Desbloqueia os inputs
    [iptOcioso, iptAtencao, iptCritico].forEach((input) => {
      if (input) {
        input.disabled = isDisabled;
        input.classList.toggle('text-muted', isDisabled);
      }
    });
  });

  if (paramsContainer) paramsContainer.classList.toggle('text-muted', isDisabled);
}


function excluir_maquina(idMaquina) {
  Swal.fire({
    title: 'Excluir Máquina',
    html: `
      <div class="form-group text-left mb-3">
        <p class="text-muted mb-3">Para confirmar a exclusão da Máquina, por favor, confirme abaixo</p>
        <label for="swal-input-senha" class="form-label font-weight-bold">Senha</label>
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
  }).then((resultadoSwal) => {
    if (resultadoSwal.isConfirmed) {
      const idFuncionarioGerente = ID_GERENTE;
      const senhaGerente = resultadoSwal.value.senha;
      return fetch(`/maquinas/excluirMaquina/${idMaquina}`, {
        method: 'DELETE',
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
            exibirSucesso('Exclusão Concluída', 'A Máquina foi excluída com sucesso.');
            carregarMaquinas(paginaAtual, valor_parametro, termo);
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
      exibirErro('Exclusão Cancelada', 'A exclusão da Máquina foi cancelada pelo usuário.');
    }
  });
}

async function carregarMaquinas(pagina, valor_parametro, termoDePesquisa) {
  getTermo();
  document.getElementById('Conteudo_real').style.display = 'none';
  document.getElementById('Estrutura_esqueleto_carregamento').style.display = '1';
  let pesquisa = termoDePesquisa;
  if (!ID_GERENTE) {
    exibirErro(
      'ID do gerente não encontrado',
      'ID do gerente não encontrado. Faça login novamente.',
    );
    return;
  }
  paginaAtual = pagina;
  try {
    const response = await fetch(
      `/maquinas/listarMaquinas?idGerente=${ID_GERENTE}&pagina=${paginaAtual}&limite=${limitePorPagina}&valorParametro=${valor_parametro}&termoDePesquisa=${pesquisa}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      const erro = await response.text();
      throw new Error(`Erro na API: ${erro}`);
    }
    const data = await response.json();
    renderizarTabela(data.dados);
    renderizarPaginacao(data.totalPaginas, data.paginaAtual);
  } catch (error) {
    console.error('Falha ao carregar máquinas:', error);
    const elementoTabela = document.getElementById('Conteudo_real');
    const elementoPaginacao = document.getElementById('paginazacao');
    elementoTabela.innerHTML = `<tr><td colspan="9" style="text-align:center;">Erro ao carregar dados: ${error.message}</td></tr>`;
    if (elementoPaginacao) elementoPaginacao.innerHTML = '';
  }
}

function renderizarTabela(maquinas) {
  let html = '';
  const elementoTabela = document.getElementById('Conteudo_real');

  if (maquinas.length === 0) {
    html = '<tr><td colspan="10" style="text-align:center;">Nenhuma máquina encontrada.</td></tr>';
  } else {
    maquinas.forEach((m) => {
      const origemBruta = m.origemParametro || 'N/A';
      const origemFormatada = origemBruta.charAt(0) + origemBruta.slice(1).toLowerCase();

      html += `
                <tr data-id-maquina="${m.idMaquina}">
                    <td>${m.idMaquina}</td>
                    <td><i class="bi bi-person-circle me-2"></i>${m.nome}</td>
                    <td>${m.hostname}</td>
                    <td>${m.modelo}</td>
                    <td>${m.status}</td>
                    <td>${m.sistemaOperacional}</td>
                    
                    <td>${origemFormatada}</td>
                    
                    <td>${m.macAddress}</td>
                    <td>${m.ip}</td>
                    <td>
                        <span class="opcao_crud text-primary" data-bs-toggle="modal"
                            data-bs-target="#modalAtualizarMaquina"
                            onClick="getDadosById(${m.idMaquina})"
                        >
                            <img src="../assets/svg/atualizar_blue.svg" alt="">
                            Editar
                            <i class="bi bi-arrow-clockwise"></i>
                        </span>
                    </td>
                    <td>
                        <span class="opcao_crud text-danger" onclick="excluir_maquina(${m.idMaquina})">
                            <img src="../assets/svg/excluir_red.svg" alt="">
                            Excluir
                            <i class="bi bi-trash"></i>
                        </span>
                    </td>
                </tr>
            `;
    });
  }

  setTimeout(() => {
    document.getElementById('Estrutura_esqueleto_carregamento').style.display = 'none';
    elementoTabela.innerHTML = html;
  }, 250);
  elementoTabela.style.display = '';
}

let idMaquinaEmEdicao = null;

async function getDadosById(idMaquina) {
  if (!idMaquina) return console.error('ID da Máquina não fornecido para edição.');
  idMaquinaEmEdicao = idMaquina;

  try {
    const response = await fetch(`/maquinas/buscarDadosParaEdicao/${idMaquina}`, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${await response.text()}`);
    }

    const dados = await response.json();

    document.getElementById('ipt_nome_upd').value = dados.maquina.nome || '';
    document.getElementById('ipt_modelo_upd').value = dados.maquina.modelo || '';
    document.getElementById('ipt_mac_upd').value = dados.maquina.macAddress || '';

    document.getElementById('txt_nome').innerHTML = dados.maquina.nome;
    document.getElementById('txt_modelo').innerHTML = dados.maquina.modelo;
    document.getElementById('txt_mac').innerHTML = dados.maquina.macAddress;

    preencherDadosAlertas(dados.parametros_por_componente);
  } catch (error) {
    console.error('Falha ao carregar dados da máquina:', error);
    exibirErro('Erro ao Carregar', 'Não foi possível carregar os dados da máquina para edição.');
  }
}

function preencherDadosAlertas(parametrosAgrupados) {
  const tipos = ['CPU', 'RAM', 'DISCO', 'REDE'];
  let origemGeral = 'ESPECÍFICO';
  let temParametrosEspecificos = false;

  tipos.forEach((tipo) => {
    const dadosComponente = parametrosAgrupados[tipo] || {};
    const nomeElemento = tipo.toLowerCase(); 

    const valOcioso = dadosComponente.ACEITÁVEL?.limite ?? '';
    const valAtencao = dadosComponente.ATENÇÃO?.limite ?? '';
    const valCritico = dadosComponente.CRÍTICO?.limite ?? '';

    if (valOcioso !== '' || valAtencao !== '' || valCritico !== '') {
      temParametrosEspecificos = true;
    }

    const iptOcioso = document.getElementById(`ipt_${nomeElemento}_ocioso_upd`);
    const iptAtencao = document.getElementById(`ipt_${nomeElemento}_atencao_upd`);
    const iptCritico = document.getElementById(`ipt_${nomeElemento}_critico_upd`);

    if (iptOcioso) iptOcioso.value = valOcioso;
    if (iptAtencao) iptAtencao.value = valAtencao;
    if (iptCritico) iptCritico.value = valCritico;

    const txtOcioso = document.getElementById(`txt_${nomeElemento}_ocioso`);
    const txtAtencao = document.getElementById(`txt_${nomeElemento}_atencao`);
    const txtCritico = document.getElementById(`txt_${nomeElemento}_critico`);

    const unidade = nomeElemento === 'rede' ? ' Mbps' : ' %';

    if (txtOcioso) txtOcioso.innerText = valOcioso ? valOcioso + unidade : '-';
    if (txtAtencao) txtAtencao.innerText = valAtencao ? valAtencao + unidade : '-';
    if (txtCritico) txtCritico.innerText = valCritico ? valCritico + unidade : '-';
  });

  if (!temParametrosEspecificos) {
    origemGeral = 'OBERON'; 
  }
  const chkEmpresa = document.getElementById('alertaEmpresaUpd');
  const chkOberon = document.getElementById('alertaOberonUpd');

  if (chkEmpresa && chkOberon) {
    chkEmpresa.checked = !temParametrosEspecificos && origemGeral === 'EMPRESA';
    chkOberon.checked = !temParametrosEspecificos && origemGeral === 'OBERON';

    const containerInputs = document.getElementById('parametrizacaoIndividualUpd');
    const listaInputs = containerInputs ? containerInputs.querySelectorAll('input') : [];
    toggleParametros(chkEmpresa, chkOberon, containerInputs, listaInputs);
  }
}

function atualizarMaquinaSubmit(event) {
  event.preventDefault();
  atualizarMaquina();
}

async function atualizarMaquina() {
  if (!idMaquinaEmEdicao) return;

  const nome = document.getElementById('ipt_nome_upd').value;
  const macAddress = document.getElementById('ipt_mac_upd').value;

  if (!nome || !macAddress) {
    exibirErro('Campos Obrigatórios', 'Preencha Nome e Mac Address.');
    return;
  }

  const origemParametro = getOrigemSelecionada('alertaEmpresaUpd', 'alertaOberonUpd');

  let cpuParams = null;
  let ramParams = null;
  let discoParams = null;
  let redeParams = null;

  if (origemParametro === 'ESPECÍFICO') {
    cpuParams = montarObjetoParametros('cpu', '_upd');
    ramParams = montarObjetoParametros('ram', '_upd');
    discoParams = montarObjetoParametros('disco', '_upd');
    redeParams = montarObjetoParametros('rede', '_upd');

    if (!cpuParams || !ramParams || !discoParams || !redeParams) {
      exibirErro('Atenção', 'Preencha todos os limites para configuração Específica.');
      return;
    }
  } else {
    console.log("verificar else especifico")
  }

  const payload = {
    idMaquina: idMaquinaEmEdicao,
    idFuncionario: ID_GERENTE,
    nome: nome,
    macAddress: macAddress,
    origemParametro: origemParametro,

    cpu_parametros: cpuParams,
    ram_parametros: ramParams,
    disco_parametros: discoParams,
    rede_parametros: redeParams,
  };

  try {
    const response = await fetch(`/maquinas/atualizarMaquina`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAtualizarMaquina'));
      modal?.hide();
      exibirSucesso('Atualizado', `Máquina ${nome} editada com sucesso!`);
      carregarMaquinas(paginaAtual, valor_parametro, termo);
    } else {
      const erroTxt = await response.text();
      exibirErro('Erro ao atualizar', erroTxt);
    }
  } catch (error) {
    console.error(error);
    exibirErro('Erro', 'Falha na conexão.');
  }
}

function renderizarPaginacao(totalPaginas, paginaAtual) {
  const elementoPaginacao = document.getElementById('paginazacao');
  if (!elementoPaginacao) return;
  let elementoPaginacao_ul = elementoPaginacao.querySelector('ul');
  if (!elementoPaginacao_ul) {
    elementoPaginacao.innerHTML = `<ul class="pagination pagination-sm"></ul>`;
    elementoPaginacao_ul = elementoPaginacao.querySelector('ul');
  }

  let htmlLista = '';

  const desabilitarAnterior = paginaAtual === 1 ? 'disabled' : '';
  const paginaAnterior = paginaAtual - 1;
  htmlLista += `
        <li class="page-item ${desabilitarAnterior}">
            <a class="page-link" onclick="carregarMaquinas(${paginaAnterior}, '${valor_parametro}', '${termo}'); return false;">Anterior</a>
        </li>
    `;

  const maxPaginasVisiveis = 5;
  let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
  let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

  if (fim - inicio + 1 < maxPaginasVisiveis) {
    inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
  }

  if (inicio > 1) {
    htmlLista += `
          <li class="page-item"><a class="page-link" onclick="carregarMaquinas(1, '${valor_parametro}', '${termo}'); return false;">1</a></li>
      `;
    if (inicio > 2) {
      htmlLista += `
              <li class="page-item disabled">
                  <span class="page-link">...</span>
              </li>
          `;
    }
  }

  for (let i = inicio; i <= fim; i++) {
    const ativo = i === paginaAtual ? 'active_pagina' : '';
    htmlLista += `
              <li class="page-item ${ativo}">
                  <a class="page-link" onclick="carregarMaquinas(${i}, '${valor_parametro}', '${termo}'); return false;">${i}</a>
              </li>
          `;
  }

  if (fim < totalPaginas) {
    if (fim < totalPaginas - 1) {
      htmlLista += `
              <li class="page-item disabled">
                  <span class="page-link">...</span>
              </li>
          `;
    }
    htmlLista += `
          <li class="page-item"><a class="page-link" onclick="carregarMaquinas(${totalPaginas}, '${valor_parametro}', '${termo}'); return false;">${totalPaginas}</a></li>
      `;
  }

  const desabilitarSeguinte = paginaAtual === totalPaginas ? 'disabled' : '';
  const paginaSeguinte = paginaAtual + 1;
  htmlLista += `
        <li class="page-item ${desabilitarSeguinte}">
            <a class="page-link" onclick="carregarMaquinas(${paginaSeguinte}, '${valor_parametro}', '${termo}'); return false;">Seguinte</a>
        </li>
    `;

  elementoPaginacao_ul.innerHTML = htmlLista;
}

async function cadastrarMaquina(event) {
  if (event) event.preventDefault();

  const nome = document.getElementById('ipt_nome_cad').value;
  const macAddress = document.getElementById('ipt_mac_cad').value;

  if (!nome || !macAddress) {
    exibirErro('Campos Obrigatórios', 'Preencha Nome e Mac Address.');
    return;
  }

  const origemParametro = getOrigemSelecionada('alertaEmpresa', 'alertaOberon');

  let cpuParams = null;
  let ramParams = null;
  let discoParams = null;
  let redeParams = null;

  if (origemParametro === 'ESPECÍFICO') {
    cpuParams = montarObjetoParametros('cpu', '_cad');
    ramParams = montarObjetoParametros('ram', '_cad');
    discoParams = montarObjetoParametros('disco', '_cad');
    redeParams = montarObjetoParametros('rede', '_cad');

    if (!cpuParams || !ramParams || !discoParams || !redeParams) {
      exibirErro(
        'Atenção',
        'Para configuração Específica, preencha TODOS os campos de Ocioso, Atenção e Crítico.',
      );
      return;
    }
  }

  const payload = {
    idFuncionario: ID_GERENTE,
    nome: nome,
    macAddress: macAddress,
    origemParametro: origemParametro,

    cpu_parametros: cpuParams,
    ram_parametros: ramParams,
    disco_parametros: discoParams,
    rede_parametros: redeParams,
  };

  try {
    const response = await fetch('/maquinas/cadastrarMaquina', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalCadastrarMaquina'));
      modal?.hide();
      exibirSucesso('Sucesso', `Máquina ${nome} cadastrada!`);
      carregarMaquinas(1, valor_parametro, termo);

      document.getElementById('formCadastrarMaquina').reset();
    } else {
      const erroTxt = await response.text();
      exibirErro('Erro', erroTxt);
    }
  } catch (error) {
    console.error(error);
    exibirErro('Erro', 'Falha na conexão.');
  }
}

async function carregarParametrosAtuais() {
  const checkboxEmpresa = document.getElementById('alertaEmpresa');
  const checkboxEmpresaAtualizar = document.getElementById('alertaEmpresaUpd');

  if (!ID_GERENTE) return console.error('ID do Gerente não definido.');

  try {
    const response = await fetch(`/maquinas/getParametrosPadrao/${ID_GERENTE}`, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Erro ao buscar parâmetros: ${await response.text()}`);
    }

    const dados = await response.json();

    const mapearDados = (origemObjeto) => {
      if (!origemObjeto) return {};

      const mapa = {};

      Object.entries(origemObjeto).forEach(([chave, info]) => {
        const partes = chave.split('_');
        const tipo = partes[0];
        const identificador = partes[partes.length - 1];

        if (!mapa[tipo]) {
          mapa[tipo] = {};
        }

        mapa[tipo][identificador] = {
          limite: info.limite,
          tipoComponete: info.tipoComponete,
          identificador: info.identificador,
        };
      });
      return mapa;
    };

    parametroEmpresa = mapearDados(dados.empresa);
    parametroOberon = mapearDados(dados.oberon);

    const atualizarTextoReferencia = (prefixo, dadosObjeto) => {
      const tipos = {
        CPU: 'cpu',
        RAM: 'ram',
        DISCO: 'disco',
        REDE: 'rede',
      };
      const identificadores = ['ACEITÁVEL', 'ATENÇÃO', 'CRÍTICO'];

      Object.entries(tipos).forEach(([tipoMaiusculo, nomeElemento]) => {
        const unidade = tipoMaiusculo === 'REDE' ? ' Mbps' : ' %';

        identificadores.forEach((identificador) => {
          const limite = dadosObjeto[tipoMaiusculo]?.[identificador]?.limite;

          const nomeIdentificador =
            identificador === 'ACEITÁVEL' ? 'ocioso' : identificador.toLowerCase();

          const el = document.getElementById(`${prefixo}_${nomeElemento}_${nomeIdentificador}`);

          if (el) {
            el.textContent = limite !== undefined ? `${limite} ${unidade}` : '-';
          }
        });
      });
    };

    atualizarTextoReferencia('oberon', parametroOberon);
    atualizarTextoReferencia('atual', parametroEmpresa);

    let somaLimitesEmpresa = 0;
    Object.values(parametroEmpresa).forEach((comp) => {
      somaLimitesEmpresa += comp.ACEITÁVEL?.limite || 0;
      somaLimitesEmpresa += comp.ATENÇÃO?.limite || 0;
      somaLimitesEmpresa += comp.CRÍTICO?.limite || 0;
    });

    const isParametroEmpresaZerado = somaLimitesEmpresa === 0;

    const configurarCheckbox = (checkbox) => {
      if (!checkbox) return;
      const label = document.querySelector(`label[for="${checkbox.id}"]`);

      if (isParametroEmpresaZerado) {
        checkbox.disabled = true;
        checkbox.checked = false;
        if (label) {
          label.title = 'Configure os Limites Padrão da Empresa para habilitar esta opção.';
          label.style.cursor = 'not-allowed';
          label.classList.add('text-muted');
        }
      } else {
        checkbox.disabled = false;
        if (label) {
          label.title = '';
          label.style.cursor = 'pointer';
          label.classList.remove('text-muted');
        }
      }
    };

    configurarCheckbox(checkboxEmpresa);
    configurarCheckbox(checkboxEmpresaAtualizar);
  } catch (error) {
    console.error('Falha ao carregar dados atuais:', error);
  }
}

function limparValor(valorBruto) {
  if (!valorBruto) return null;
  let valorLimpo = String(valorBruto)
    .replace(/[^0-9,.]/g, '')
    .replace(',', '.');
  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? null : numero;
}

function montarObjetoParametros(tipo, sufixo) {
  const ociosoVal = document.getElementById(`ipt_${tipo}_ocioso${sufixo}`)?.value;
  const atencaoVal = document.getElementById(`ipt_${tipo}_atencao${sufixo}`)?.value;
  const criticoVal = document.getElementById(`ipt_${tipo}_critico${sufixo}`)?.value;

  const ocioso = limparValor(ociosoVal);
  const atencao = limparValor(atencaoVal);
  const critico = limparValor(criticoVal);

  if (ocioso === null || atencao === null || critico === null) {
    return null;
  }

  return {
    aceitavel: ocioso, 
    atencao: atencao,
    critico: critico,
  };
}

function getOrigemSelecionada(idCheckEmpresa, idCheckOberon) {
  const chkEmpresa = document.getElementById(idCheckEmpresa);
  const chkOberon = document.getElementById(idCheckOberon);

  if (chkOberon && chkOberon.checked) return 'OBERON';
  if (chkEmpresa && chkEmpresa.checked) return 'EMPRESA';
  return 'ESPECÍFICO';
}


document.addEventListener('DOMContentLoaded', function () {
  ipt_pesquisa = document.getElementById('ipt_pesquisa');

  ipt_nome_cad = document.getElementById('ipt_nome_cad');
  ipt_mac_cad = document.getElementById('ipt_mac_cad');

  ipt_cpu_ocioso_cad = document.getElementById('ipt_cpu_ocioso_cad');
  ipt_cpu_atencao_cad = document.getElementById('ipt_cpu_atencao_cad');
  ipt_cpu_critico_cad = document.getElementById('ipt_cpu_critico_cad');

  ipt_ram_ocioso_cad = document.getElementById('ipt_ram_ocioso_cad');
  ipt_ram_atencao_cad = document.getElementById('ipt_ram_atencao_cad');
  ipt_ram_critico_cad = document.getElementById('ipt_ram_critico_cad');

  ipt_disco_ocioso_cad = document.getElementById('ipt_disco_ocioso_cad');
  ipt_disco_atencao_cad = document.getElementById('ipt_disco_atencao_cad');
  ipt_disco_critico_cad = document.getElementById('ipt_disco_critico_cad');

  ipt_rede_ocioso_cad = document.getElementById('ipt_rede_ocioso_cad');
  ipt_rede_atencao_cad = document.getElementById('ipt_rede_atencao_cad');
  ipt_rede_critico_cad = document.getElementById('ipt_rede_critico_cad');

  const formConfig = document.getElementById('formConfigParametros');
  const modalElementConfig = document.getElementById('modalConfigParametros');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const btnAvancar = document.getElementById('btnAvancar');
  const btnVoltar = document.getElementById('btnVoltar');
  const btnCadastrar = document.getElementById('btnCadastrar');

  const step1Upd = document.getElementById('step-update-1');
  const step2Upd = document.getElementById('step-update-2');
  const btnAvancarUpd = document.getElementById('btnAvancarUpd');
  const btnVoltarUpd = document.getElementById('btnVoltarUpd');
  const btnAtualizar = document.getElementById('btnCadastrarUpd');

  const checkboxEmpresa = document.getElementById('alertaEmpresa');
  const checkboxOberon = document.getElementById('alertaOberon');
  const paramsContainer = document.getElementById('parametrizacaoIndividual');

  const paramInputs = [
    ipt_cpu_ocioso_cad,
    ipt_cpu_atencao_cad,
    ipt_cpu_critico_cad,
    ipt_ram_ocioso_cad,
    ipt_ram_atencao_cad,
    ipt_ram_critico_cad,
    ipt_disco_ocioso_cad,
    ipt_disco_atencao_cad,
    ipt_disco_critico_cad,
    ipt_rede_ocioso_cad,
    ipt_rede_atencao_cad,
    ipt_rede_critico_cad,
  ].filter(Boolean); 

  const dadosAtuaisIdentificacao = document.getElementById('dadosAtuaisIdentificacao');
  const dadosAtuaisAlertas = document.getElementById('dadosAtuaisAlertas');
  const checkboxEmpresaUpd = document.getElementById('alertaEmpresaUpd');
  const checkboxOberonUpd = document.getElementById('alertaOberonUpd');
  const paramsContainerUpd = document.getElementById('parametrizacaoIndividualUpd');
  const paramInputsUpd = Array.from(
    document.querySelectorAll('#parametrizacaoIndividualUpd input'),
  );
  const modalElementUpd = document.getElementById('modalAtualizarMaquina');

  const modalAjuda = document.getElementById('modalMacHelp');
  const btnAbrir = document.getElementById('btnOpenMacHelp');
  const btnFecharX = document.getElementById('btnCloseMacHelp');
  const btnFechar = document.getElementById('btnFecharMacHelp');

  if (ID_GERENTE) {
    carregarMaquinas(1, 'nome', '');
    carregarParametrosAtuais();
  } else {
    exibirErro('Sessão inválida', 'Por favor, faça login.');
  }

  if (btnAbrir)
    btnAbrir.addEventListener('click', () => {
      modalAjuda.style.display = 'block';
    });
  if (btnFecharX)
    btnFecharX.addEventListener('click', () => {
      modalAjuda.style.display = 'none';
    });
  if (btnFechar)
    btnFechar.addEventListener('click', () => {
      modalAjuda.style.display = 'none';
    });
  if (modalAjuda) {
    modalAjuda.addEventListener('click', function (event) {
      if (event.target === modalAjuda) modalAjuda.style.display = 'none';
    });
  }
  const tabElms = document.querySelectorAll('#macTab button');
  tabElms.forEach(function (tabElm) {
    new bootstrap.Tab(tabElm);
  });

  if (checkboxEmpresa && checkboxOberon) {
    const handleCheckboxChange = (event) => {
      const clickedCheckbox = event.target;
      if (clickedCheckbox.checked) {
        if (clickedCheckbox.id === 'alertaEmpresa') {
          checkboxOberon.checked = false;
        } else if (clickedCheckbox.id === 'alertaOberon') {
          checkboxEmpresa.checked = false;
        }
      }
      toggleParametros(checkboxEmpresa, checkboxOberon, paramsContainer, paramInputs);
    };
    checkboxEmpresa.addEventListener('change', handleCheckboxChange);
    checkboxOberon.addEventListener('change', handleCheckboxChange);
    toggleParametros(checkboxEmpresa, checkboxOberon, paramsContainer, paramInputs);
  }
  if (btnAvancar)
    btnAvancar.addEventListener('click', () =>
      navigateSteps('next', step1, step2, btnAvancar, btnVoltar, btnCadastrar),
    );
  if (btnVoltar)
    btnVoltar.addEventListener('click', () =>
      navigateSteps('prev', step1, step2, btnAvancar, btnVoltar, btnCadastrar),
    );

  if (btnCadastrar) {
    btnCadastrar.addEventListener('click', (event) => cadastrarMaquina(event));
  }

  if (checkboxEmpresaUpd && checkboxOberonUpd) {
    const handleCheckboxChangeUpd = (event) => {
      const clickedCheckbox = event.target;
      if (clickedCheckbox.checked) {
        if (clickedCheckbox.id === 'alertaEmpresaUpd') {
          checkboxOberonUpd.checked = false;
        } else if (clickedCheckbox.id === 'alertaOberonUpd') {
          checkboxEmpresaUpd.checked = false;
        }
      }
      toggleParametros(checkboxEmpresaUpd, checkboxOberonUpd, paramsContainerUpd, paramInputsUpd);
    };
    checkboxEmpresaUpd.addEventListener('change', handleCheckboxChangeUpd);
    checkboxOberonUpd.addEventListener('change', handleCheckboxChangeUpd);
    toggleParametros(checkboxEmpresaUpd, checkboxOberonUpd, paramsContainerUpd, paramInputsUpd);
  }
  if (btnAvancarUpd)
    btnAvancarUpd.addEventListener('click', () =>
      navigateStepsUpd(
        'next',
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas,
      ),
    );
  if (btnVoltarUpd)
    btnVoltarUpd.addEventListener('click', () =>
      navigateStepsUpd(
        'prev',
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas,
      ),
    );

  if (modalElementUpd) {
    modalElementUpd.addEventListener('show.bs.modal', function (event) {
      navigateStepsUpd(
        'prev',
        step1Upd,
        step2Upd,
        btnAvancarUpd,
        btnVoltarUpd,
        btnAtualizar,
        dadosAtuaisIdentificacao,
        dadosAtuaisAlertas,
      );
      toggleParametros(checkboxEmpresaUpd, checkboxOberonUpd, paramsContainerUpd, paramInputsUpd);
    });
  }

  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', atualizarMaquinaSubmit);
  }

  if (ipt_pesquisa) {
    ipt_pesquisa.addEventListener('input', (event) => {
      if (event.target.value == '') {
        valor_parametro = 'nome';
        termo = '';
      }
      if ((valor_parametro = '')) {
        valor_parametro = 'nome';
      }
      buscarDebounced(event.target.value);
    });
  }
});
