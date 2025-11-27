document.addEventListener('DOMContentLoaded', function () {
  var idEmpresa = null;

  try {
    const usuarioJson = sessionStorage.getItem('usuario');
    if (!usuarioJson) {
      console.error('ERRO: Nenhum usuário encontrado no sessionStorage!');
      alert('Erro: Você não está logado. Redirecionando para o login...');
      window.location.href = '/login.html';
      return;
    }
    const usuario = JSON.parse(usuarioJson);
    idEmpresa = usuario.fkEmpresa || usuario.idEmpresa || usuario.ID_EMPRESA || usuario.empresa?.id;
    if (!idEmpresa) {
      console.error('ERRO: ID da empresa não encontrado no objeto usuario!');
      alert('Erro: Não foi possível identificar sua empresa. Entre em contato com o suporte.');
      return;
    }
    console.log('ID da Empresa encontrado:', idEmpresa);
  } catch (error) {
    console.error('ERRO ao processar dados do usuário:', error);
    alert('Erro ao processar login. Faça login novamente.');
    window.location.href = '/login.html';
    return;
  }

  let paginaAtual = 1;
  const itensPorPagina = 20;
  let filtrosAtuais = {
    funcionarioId: 'todos',
    tipoMudanca: 'todos',
    dataInicio: null,
    dataFim: null,
  };

  const conteudoTabela = document.getElementById('Conteudo_real');
  const paginacaoContainer = document.getElementById('paginazacao');
  const dropdownFuncionario = document.getElementById('dropdownFuncionario');
  const dropdownTipoMudanca = document.getElementById('dropdownTipoMudanca');
  const inputDataInicio = document.getElementById('filtroDataInicio');
  const inputDataFim = document.getElementById('filtroDataFim');
  const chkDataFim = document.getElementById('chkDataFim');
  const formFiltros = document.querySelector('.filtro-container form');
  const btnExportarCSV = document.querySelector('.verde_obscuro');

  function carregarFuncionarios() {
    fetch(`/logAuditoria/funcionarios/${idEmpresa}`)
      .then((response) => response.json())
      .then((data) => {
        const dropdownMenu = document.querySelector('#dropdownFuncionario').nextElementSibling;
        dropdownMenu.innerHTML = `
          <li><a class="dropdown-item dropdown-funcionario-item" href="#" data-value="todos">
            Todos os Funcionários
          </a></li>
        `;
        data.funcionarios.forEach((func) => {
          const li = document.createElement('li');
          li.innerHTML = `
            <a class="dropdown-item dropdown-funcionario-item" href="#" data-value="${func.idFuncionario}">
              ${func.nome}
            </a>
          `;
          dropdownMenu.appendChild(li);
        });
        document.querySelectorAll('.dropdown-funcionario-item').forEach((item) => {
          item.addEventListener('click', function (e) {
            e.preventDefault();
            const valor = this.getAttribute('data-value');
            const texto = this.textContent.trim();
            document.getElementById('valor_funcionario_selecionado').textContent = texto;
            filtrosAtuais.funcionarioId = valor;
          });
        });
      })
      .catch((error) => {
        console.error('Erro ao carregar funcionários:', error);
      });
  }

  document.querySelectorAll('.dropdown-tipo-mudanca-item').forEach((item) => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      const valor = this.getAttribute('data-value');
      const texto = this.textContent.trim();
      document.getElementById('valor_tipo_selecionado').textContent = texto;
      filtrosAtuais.tipoMudanca = valor;
    });
  });

  function buscarLogs(pagina = 1) {
    paginaAtual = pagina;
    const params = new URLSearchParams({
      pagina: pagina,
      itensPorPagina: itensPorPagina,
      funcionarioId: filtrosAtuais.funcionarioId,
      tipoMudanca: filtrosAtuais.tipoMudanca,
    });

    if (filtrosAtuais.dataInicio) {
      params.append('dataInicio', filtrosAtuais.dataInicio);
    }
    if (filtrosAtuais.dataFim && chkDataFim.checked) {
      params.append('dataFim', filtrosAtuais.dataFim);
    }

    conteudoTabela.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </td>
      </tr>
    `;

    fetch(`/logAuditoria/${idEmpresa}?${params}`)
      .then((response) => response.json())
      .then((data) => {
        renderizarTabela(data.logs);
        renderizarPaginacao(data.paginacao);
      })
      .catch((error) => {
        console.error('Erro ao buscar logs:', error);
        conteudoTabela.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-danger py-4">
              Erro ao carregar dados. Tente novamente.
            </td>
          </tr>
        `;
      });
  }

  function renderizarTabela(logs) {
    if (logs.length === 0) {
      conteudoTabela.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            Nenhum registro encontrado.
          </td>
        </tr>
      `;
      return;
    }

    conteudoTabela.innerHTML = logs
      .map((log) => {
        let corAcao = 'text-secondary';
        if (log.acao === 'INSERT') corAcao = 'text-success';
        else if (log.acao === 'UPDATE') corAcao = 'text-primary';
        else if (log.acao === 'DELETE') corAcao = 'text-danger';
        else if (log.acao === 'CONFIG') corAcao = 'text-info';
        const valorAntigoTexto = formatarValorJSON(log.valorAntigo);
        const valorNovoTexto = formatarValorJSON(log.valorNovo);
        return `
        <tr class="table-log-row">
          <td class="log-cell">${log.horarioFormatado}</td>
          <td class="log-cell ${corAcao} fw-semibold">${traduzirAcao(log.acao)}</td>
          <td class="descricao-cell">${log.descricao}</td>
          <td class="log-cell">${log.tabelaAfetada}</td>
          <td class="log-cell">${log.idAfetado}</td>
          <td class="log-cell">${log.usuarioResponsavel}</td>
          <td class="detail-cell" onclick="mostrarDetalhesLog(${log.idLogAuditoria}, '${escapeHtml(log.descricao)}', '${escapeHtml(valorAntigoTexto)}', '${escapeHtml(valorNovoTexto)}')">
            <i class="bi bi-eye-fill me-1"></i> Ver Detalhes
          </td>
        </tr>
      `;
      })
      .join('');
  }

  function traduzirAcao(acao) {
    const traducoes = {
      INSERT: 'INCLUSÃO',
      UPDATE: 'ALTERAÇÃO',
      DELETE: 'EXCLUSÃO',
      CONFIG: 'CONFIGURAÇÃO',
    };
    return traducoes[acao] || acao;
  }

  function formatarValorJSON(valorJson) {
    if (!valorJson) return 'N/A';

    try {
      const obj = typeof valorJson === 'string' ? JSON.parse(valorJson) : valorJson;
      return JSON.stringify(obj, null, 2);
    } catch (error) {
      return valorJson.toString();
    }
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '\n': '\\n',
      '\r': '\\r',
    };
    return text.replace(/[&<>"'\n\r]/g, (m) => map[m]);
  }

  window.mostrarDetalhesLog = function (idLog, descricao, valorAntigo, valorNovo) {
    document.getElementById('modalActionTitle').textContent = descricao;
    let descriptionText = '';
    if (valorAntigo === 'N/A' && valorNovo !== 'N/A') {
      descriptionText = 'Registro de Inclusão. O valor antigo é N/A.';
    } else if (valorAntigo !== 'N/A' && valorNovo === 'N/A') {
      descriptionText = 'Registro de Exclusão. O valor novo é N/A.';
    } else {
      descriptionText = 'Comparação dos valores antes e depois da alteração.';
    }
    document.getElementById('modalDescription').textContent = descriptionText;
    valorAntigo = valorAntigo.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    valorNovo = valorNovo.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    document.getElementById('modalValorAntigo').textContent = valorAntigo;
    document.getElementById('modalValorNovo').textContent = valorNovo;
    const modal = new bootstrap.Modal(document.getElementById('logDetailModal'));
    modal.show();
  };

  function renderizarPaginacao(paginacao) {
    const { paginaAtual, totalPaginas } = paginacao;

    if (totalPaginas <= 1) {
      paginacaoContainer.innerHTML = `
        <ul class="pagination pagination-sm">
          <li class="page-item disabled"><a class="page-link" href="#">Anterior</a></li>
          <li class="page-item active_pagina"><a class="page-link" href="#">1</a></li>
          <li class="page-item disabled"><a class="page-link" href="#">Seguinte</a></li>
        </ul>
      `;
      return;
    }
    let paginasHTML = '';
    paginasHTML += `
      <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="buscarLogs(${paginaAtual - 1}); return false;">Anterior</a>
      </li>
    `;
    const maxBotoes = 5;
    let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
    let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);
    if (fim - inicio < maxBotoes - 1) {
      inicio = Math.max(1, fim - maxBotoes + 1);
    }
    for (let i = inicio; i <= fim; i++) {
      paginasHTML += `
        <li class="page-item ${i === paginaAtual ? 'active_pagina' : ''}">
          <a class="page-link" href="#" onclick="buscarLogs(${i}); return false;">${i}</a>
        </li>
      `;
    }
    paginasHTML += `
      <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="buscarLogs(${paginaAtual + 1}); return false;">Seguinte</a>
      </li>
    `;
    paginacaoContainer.innerHTML = `<ul class="pagination pagination-sm">${paginasHTML}</ul>`;
  }

  window.buscarLogs = buscarLogs;

  formFiltros.addEventListener('submit', function (e) {
    e.preventDefault();
    const dataInicioValor = inputDataInicio.value.trim();
    const dataFimValor = inputDataFim.value.trim();
    console.log('Data Início (input):', dataInicioValor);
    console.log('Data Fim (input):', dataFimValor);
    console.log('Checkbox Data Fim:', chkDataFim.checked);
    filtrosAtuais.dataInicio = dataInicioValor ? converterDataParaISO(dataInicioValor) : null;
    filtrosAtuais.dataFim =
      dataFimValor && chkDataFim.checked ? converterDataParaISO(dataFimValor) : null;
    console.log('Data Início (ISO):', filtrosAtuais.dataInicio);
    console.log('Data Fim (ISO):', filtrosAtuais.dataFim);
    buscarLogs(1);
  });

  function converterDataParaISO(dataStr) {
    if (!dataStr) return null;
    const partes = dataStr.includes('/') ? dataStr.split('/') : dataStr.split('-');
    if (partes.length === 3) {
      const dia = partes[0].padStart(2, '0');
      const mes = partes[1].padStart(2, '0');
      const ano = partes[2];
      const dataISO = `${ano}-${mes}-${dia}`;
      const dataObj = new Date(dataISO);
      if (!isNaN(dataObj.getTime())) {
        return dataISO;
      }
    }
    console.warn('Data inválida:', dataStr);
    return null;
  }

  function aplicarMascaraData(input) {
    input.addEventListener('input', function (e) {
      let valor = e.target.value.replace(/\D/g, ''); // Remove não-dígitos

      if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
      }
      if (valor.length >= 5) {
        valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
      }
      e.target.value = valor;
    });
    input.addEventListener('blur', function (e) {
      const valor = e.target.value;
      if (valor && !validarFormatoData(valor)) {
        alert('Formato de data inválido. Use: dd/mm/aaaa');
        e.target.value = '';
      }
    });
  }

  function validarFormatoData(dataStr) {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dataStr)) return false;
    const partes = dataStr.split('/');
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    if (ano < 1900 || ano > 2100) return false;
    return true;
  }

  aplicarMascaraData(inputDataInicio);
  aplicarMascaraData(inputDataFim);

  const btnDataInicio = document.getElementById('btnDataInicio');
  const btnDataFim = document.getElementById('btnDataFim');

  if (btnDataInicio) {
    btnDataInicio.addEventListener('click', function () {
      inputDataInicio.focus();
    });
  }

  if (btnDataFim) {
    btnDataFim.addEventListener('click', function () {
      inputDataFim.focus();
    });
  }

  if (btnExportarCSV) {
    btnExportarCSV.addEventListener('click', function () {
      const params = new URLSearchParams({
        funcionarioId: filtrosAtuais.funcionarioId,
        tipoMudanca: filtrosAtuais.tipoMudanca,
      });

      if (filtrosAtuais.dataInicio) {
        params.append('dataInicio', filtrosAtuais.dataInicio);
      }

      if (filtrosAtuais.dataFim && chkDataFim.checked) {
        params.append('dataFim', filtrosAtuais.dataFim);
      }

      window.location.href = `/logAuditoria/exportar/${idEmpresa}?${params}`;
    });
  } else {
    console.warn('Botão de exportar CSV não encontrado no DOM');
  }

  carregarFuncionarios();
  buscarLogs(1);
});
