let ID_USUARIO = 5;
let paginaAtual = 1;

function formatarDuracao(segundos) {
    if (segundos === null || isNaN(segundos)) return 'Ativo';
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = Math.floor(segundos % 60);
    let duracao = [];
    if (horas > 0) duracao.push(`${horas}h`);
    if (minutos > 0) duracao.push(`${minutos}min`);
    if (secs > 0 || duracao.length === 0) duracao.push(`${secs}s`);
    return duracao.join(' ');
}

function renderizarTabela(alertas) {
    const tbody = document.getElementById('Conteudo_real');
    tbody.innerHTML = '';
    if (alertas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Nenhum alerta encontrado.</td></tr>';
        return;
    }
    alertas.forEach(alerta => {
        const dataInicio = alerta.horarioInicio ? alerta.horarioInicio.replace(' ', ' às ') : 'N/A';
        const dataFinal = alerta.horarioFinal ? alerta.horarioFinal.replace(' ', ' às ') : 'Ativo';
        const duracaoFormatada = formatarDuracao(alerta.duracaoSegundos);
        const criticidadeClass = alerta.nivel === 'CRITICO' ? 'text-danger fw-bold' :
            alerta.nivel === 'ALERTA' ? 'text-warning fw-bold' :
                'text-success';
        const row = `
            <tr>
                <td>${alerta.descricao}</td>
                <td>${alerta.tipoComponente}</td>
                <td>${dataInicio}</td>
                <td>${dataFinal}</td>
                <td>${alerta.funcaoMonitorar}</td>
                <td>${duracaoFormatada}</td>
                <td class="${criticidadeClass}">${alerta.nivel}</td>
                <td>${alerta.nomeMaquina}</td>
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
    const sortedPages = Array.from(pagesToShow).filter(p => p >= 1 && p <= totalPaginas).sort((a, b) => a - b);
    ul.innerHTML += `
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="carregarAlertas(${paginaAtual - 1})">Anterior</a>
        </li>
    `;
    let ultimaPaginaRenderizada = 0;
    sortedPages.forEach(p => {
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


function carregarAlertas(pagina = 1) {
    paginaAtual = pagina;
    const tbodyReal = document.getElementById('Conteudo_real');
    const tbodySkeleton = document.getElementById('Estrutura_esqueleto_carregamento');
    const divPaginacao = document.querySelector('.div_paginas');
    if (tbodyReal) tbodyReal.style.display = 'none';
    if (tbodySkeleton) tbodySkeleton.style.display = 'contents';
    if (divPaginacao) divPaginacao.style.display = 'none';
    const usuarioSessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
    const idFuncionario = usuarioSessao.idFuncionario || ID_USUARIO;
    if (!idFuncionario) {
        console.error("ID do usuário não encontrado na sessão.");
        if (tbodyReal) tbodyReal.style.display = 'contents';
        if (tbodySkeleton) tbodySkeleton.style.display = 'none';
        if (tbodyReal) tbodyReal.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-danger">ID de usuário ausente. Faça login novamente.</td></tr>';
        return;
    }
    fetch(`/alertas/listar/${idFuncionario}/${paginaAtual}`)
        .then(response => {
            if (response.status === 204) {
                return { alertas: [], totalAlertas: 0, totalPaginas: 0, paginaAtual: 1 };
            }
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.detalhes || `Erro HTTP: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            renderizarTabela(data.alertas);
            renderizarPaginacao(data.totalPaginas, data.paginaAtual);
        })
        .catch(error => {
            console.error('Falha ao carregar alertas:', error);
            const tbody = document.getElementById('Conteudo_real');
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Erro: ${error.message}. Verifique o console.</td></tr>`;
        })
        .finally(() => {
            if (tbodySkeleton) tbodySkeleton.style.display = 'none';
            if (tbodyReal) tbodyReal.style.display = 'contents';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    carregarAlertas(1);
});