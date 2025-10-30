let paginaAtual = 1;
let tipoFiltro = 'descricao';

function mudarTipoFiltro(novoTipo, textoBotao) {
  tipoFiltro = novoTipo;
  document.getElementById('btn_filtro_texto').innerText = `${textoBotao}`;
  document.getElementById('input_pesquisa_alerta').placeholder = `Buscar por ${textoBotao}`;
  carregarAlertas(1);
}

function renderizarTabela(alertas) {
  const tbody = document.getElementById('Conteudo_real');
  tbody.innerHTML = '';
  if (alertas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="text-center py-4">Nenhum alerta encontrado.</td></tr>';
    return;
  }
  alertas.forEach((alerta) => {
    const dataHoraRegistro = alerta.horarioRegistro
      ? alerta.horarioRegistro.replace(' ', ' às ')
      : 'N/A';
    let criticidadeClass = 'text-secondary';
    switch (alerta.nivel.toUpperCase()) {
      case 'CRITICO':
        criticidadeClass = 'text-danger fw-bold';
        break;
      case 'ATENCAO':
        criticidadeClass = 'text-warning fw-bold';
        break;
      case 'OCIOSO':
      default:
        criticidadeClass = 'text-success';
        break;
    }

    const row = `
      <tr>
        <td>${alerta.descricao}</td>
        <td>${alerta.tipoComponente}</td>
        <td>${alerta.funcaoMonitorar}</td>
        <td class="${criticidadeClass}">${alerta.nivel}</td>
        <td>${alerta.nomeMaquina}</td>
        <td>${dataHoraRegistro}</td> 
      </tr>
`;
    tbody.innerHTML += row;
  });
}

function renderizarPaginacao(totalPaginas, paginaAtual) {
  const navPaginas = document.querySelector('.div_paginas');
  const ul = document.querySelector('.pagination-sm');
  ul.innerHTML = '';
  if (totalPaginas <= 1) {
    navPaginas.style.display = 'none';
    return;
  }
  const pagesToShow = new Set();
  const range = 1;
  pagesToShow.add(1);
  pagesToShow.add(totalPaginas);
  for (let i = paginaAtual - range; i <= paginaAtual + range; i++) {
    if (i > 1 && i < totalPaginas) {
      pagesToShow.add(i);
    }
  }
  const sortedPages = Array.from(pagesToShow)
    .filter((p) => p >= 1 && p <= totalPaginas)
    .sort((a, b) => a - b);
  ul.innerHTML += `
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="carregarAlertas(${paginaAtual - 1})">Anterior</a>
        </li>
    `;
  let ultimaPaginaRenderizada = 0;
  sortedPages.forEach((p) => {
    if (p > ultimaPaginaRenderizada + 1) {
      ul.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }
    ul.innerHTML += `
            <li class="page-item ${p === paginaAtual ? 'active_pagina' : ''}">
                <a class="page-link" href="#" onclick="carregarAlertas(${p})">${p}</a>
            </li>
        `;
    ultimaPaginaRenderizada = p;
  });
  ul.innerHTML += `
        <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="carregarAlertas(${paginaAtual + 1})">Seguinte</a>
        </li>
    `;
  navPaginas.style.display = 'flex';
}

function montarUrlFiltros(idFuncionario, pagina) {
  const termoPesquisa = document.getElementById('input_pesquisa_alerta').value || '';
  const dataInicio = 'vazio';
  const dataFim =   'vazio';
  const termoEncoded = encodeURIComponent(termoPesquisa === '' ? 'vazio' : termoPesquisa);
  const tipoEncoded = encodeURIComponent(tipoFiltro);
  const inicioEncoded = encodeURIComponent(dataInicio);
  const fimEncoded = encodeURIComponent(dataFim);
  return `/alertas/listar/${idFuncionario}/${pagina}/${tipoEncoded}/${termoEncoded}/${inicioEncoded}/${fimEncoded}`;
}

function carregarAlertas(pagina = 1) {
  paginaAtual = pagina;
  const tbodyReal = document.getElementById('Conteudo_real');
  const tbodySkeleton = document.getElementById('Estrutura_esqueleto_carregamento');
  const divPaginacao = document.querySelector('.div_paginas');
  if (tbodyReal) tbodyReal.style.display = 'none';
  if (tbodySkeleton) tbodySkeleton.style.display = 'contents';
  if (divPaginacao) divPaginacao.style.display = 'none';
  const usuarioSessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const idFuncionario = JSON.parse(sessionStorage.getItem('usuario') || '{}').idUsuario

  if (!idFuncionario) {
    console.error('ID do usuário não encontrado na sessão.');
    if (tbodyReal) tbodyReal.style.display = 'contents';
    if (tbodySkeleton) tbodySkeleton.style.display = 'none';
    if (tbodyReal)
      tbodyReal.innerHTML =
        '<tr><td colspan="8" class="text-center py-4 text-danger">ID de usuário ausente. Faça login novamente.</td></tr>';
    return;
  }

  const url = montarUrlFiltros(idFuncionario, paginaAtual);

  fetch(url)
    .then((response) => {
      if (response.status === 204) {
        return { alertas: [], totalAlertas: 0, totalPaginas: 0, paginaAtual: 1 };
      }
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.detalhes || `Erro HTTP: ${response.status}`);
        });
      }
      return response.json();
    })
    .then((data) => {
      renderizarTabela(data.alertas);
      renderizarPaginacao(data.totalPaginas, data.paginaAtual);
    })
    .catch((error) => {
      console.error('Falha ao carregar alertas:', error);
      const tbody = document.getElementById('Conteudo_real');
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Erro: ${error.message}. Verifique o console.</td></tr>`;
    })
    .finally(() => {
      if (tbodySkeleton) tbodySkeleton.style.display = 'none';
      if (tbodyReal) tbodyReal.style.display = 'contents';
    });
}

function exportarRelatorio() {
  Swal.fire({
    title: 'Gerando Relatório...',
    text: 'Aguarde enquanto preparamos seu arquivo CSV.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const usuarioSessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
  const idFuncionario = JSON.parse(sessionStorage.getItem('usuario') || '{}').idUsuario


  if (!idFuncionario) {
    Swal.fire('Erro!', 'ID de usuário ausente.', 'error');
    return;
  }
  const url = montarUrlFiltros(idFuncionario, 1);
  const urlExport = url.replace(`/listar/${idFuncionario}/1/`, `/exportar/${idFuncionario}/`);
  fetch(urlExport)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.detalhes || `Erro HTTP: ${response.status}`);
        });
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `relatorio_alertas_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      Swal.fire('Sucesso!', 'Relatório CSV gerado e baixado!', 'success');
    })
    .catch((error) => {
      console.error('Falha na exportação:', error);
      Swal.fire('Erro!', `Falha ao gerar o relatório: ${error.message}`, 'error');
    });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarAlertas(1);
});
