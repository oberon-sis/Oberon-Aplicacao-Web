// Arquivo: ../js/dashboard/riscoOperacional.js (Nome ajustado para seu arquivo JS)

// Variáveis globais para armazenar as instâncias dos gráficos
let chartRiscoCriticoTendencia = null;
let chartComparativoDemanda = null;
let chartIntegridadeEvolucao = null;
// Nota: O gráfico de Evolução da Indisponibilidade (G3) e o de Integridade (G4) foram consolidados.


document.addEventListener("DOMContentLoaded", function() {
    // Inicializa os popovers do Bootstrap (se você estiver usando)
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) { 
        return new bootstrap.Popover(popoverTriggerEl); 
    });

    initGraficosRiscoTendencia();
    carregarDadosRiscoTendencia();
});

// -----------------------------------------------------------------------------------
// 1. FUNÇÃO PRINCIPAL DE BUSCA DE DADOS
// -----------------------------------------------------------------------------------

function carregarDadosRiscoTendencia() {
    const idEmpresa = sessionStorage.getItem("ID_EMPRESA") || 1; 

    // Chama o endpoint do backend
    fetch(`${API_BASE_URL}/risco-tendencia/dados-bimestrais?idEmpresa=${idEmpresa}`)
        .then(response => {
            if (response.ok) return response.json();
            throw new Error(`Erro na resposta do servidor: ${response.statusText}`);
        })
        .then(data => {
            if (data.kpis) {
                atualizarKPIsRisco(data.kpis);
            }
            if (data.graficos) {
                // O backend retorna 5 arrays: [G1, G2, G3_Indisp, G4_Integridade, G5_Ranking]
                atualizarGraficosRisco(data.graficos);
            }
        })
        .catch(error => {
            console.error("Erro ao carregar dashboard de Risco e Tendência:", error);
            document.getElementById('kpi-section').innerHTML = '<p class="text-danger">Erro ao carregar dados. Verifique a conexão com o servidor e o console.</p>';
        });
}

// -----------------------------------------------------------------------------------
// 2. RENDERIZAÇÃO DOS KPIS (5 KPIs Bimestrais)
// -----------------------------------------------------------------------------------

function atualizarKPIsRisco(kpis) {
    // KPI 1: Média Diária de Máquinas em Alerta
    const mediaAlerta = parseFloat(kpis.mediaDiariaMaquinasAlerta).toFixed(1) || '0.0';
    document.getElementById('txt_media_maquinas_alerta').textContent = `${mediaAlerta}`;

    // KPI 2: Taxa de Crescimento de Uso
    const crescimento = parseFloat(kpis.taxaCrescimentoUso).toFixed(1) || '0.0';
    const corCrescimento = kpis.taxaCrescimentoUso > 0 ? 'text-custom-red' : 'text-custom-green';
    document.getElementById('txt_crescimento_uso_taxa').textContent = `${crescimento}%`;
    // Note: Adicionando classes deve ser feito aqui, não no innerText.

    // KPI 3: % Incidentes Críticos/Altos
    const percRiscoAlto = parseFloat(kpis.percIncidentesAltoRisco).toFixed(0) || '0';
    document.getElementById('txt_perc_incidentes_alto_risco').textContent = `${percRiscoAlto}%`;
    const corRisco = percRiscoAlto > 30 ? 'text-custom-red' : 'text-custom-yellow';
    document.querySelector('#kpi-severidade-maxima .icone-kpi').className = `icone-kpi ${corRisco}`;

    // KPI 4 (NOVO - Mapeado para o antigo saturacao-ram): Taxa Média de Indisponibilidade de Agentes
    const taxaIndisponibilidade = parseFloat(kpis.taxaMediaIndisponibilidade).toFixed(1) || '0.0';
    document.getElementById('txt_taxa_saturacao').textContent = `${taxaIndisponibilidade}%`; 
    
    // Altera título do KPI na tela para refletir o dado novo:
    document.querySelector('#kpi-saturacao-ram h6').textContent = 'Taxa Média de Indisponibilidade';
    document.querySelector('#kpi-saturacao-ram p').textContent = 'Risco de brecha na vigilância';
    
    const corIndisp = taxaIndisponibilidade > 5 ? 'text-custom-red' : 'text-custom-green';
    document.querySelector('#kpi-saturacao-ram .icone-kpi').classList.add(corIndisp);
    // Nota: O ícone será o do saturacao-ram, mas a cor reflete o novo KPI.

    // KPI 5: Integridade de Logs (7 dias)
    const integridadeLogs = parseFloat(kpis.percIntegridadeLogs).toFixed(1) || '0.0';
    document.getElementById('txt_perc_integridade_logs').textContent = `${integridadeLogs}%`;
    const corIntegridade = integridadeLogs < 95 ? 'text-custom-red' : 'text-custom-green';
    document.querySelector('#kpi-integridade-logs .icone-kpi').className = `icone-kpi ${corIntegridade}`;
}

// -----------------------------------------------------------------------------------
// 3. RENDERIZAÇÃO DOS GRÁFICOS (5 Gráficos)
// -----------------------------------------------------------------------------------

function atualizarGraficosRisco(dados) {
    // O backend retorna [G1, G2, G3_Indisp, G4_Integridade, G5_Ranking]
    desenharTendenciaRisco(dados.tendenciaRisco); // G1
    desenharComparativoDemanda(dados.comparativoDemanda); // G2
    // G3 (Indisponibilidade) e G4 (Integridade) estão mapeados para os únicos dois canvas livres no HTML original
    desenharIntegridadeEvolucao(dados.integridadeEvolucao); // Usando canvas #riscoCriticoTendenciaChart (ou similar)
    popularTabelaRanking(dados.rankingPrioridade); // G5
}

// G1: Tendência de Risco (Colunas Empilhadas)
function desenharTendenciaRisco(dados) {
    const labels = [...new Set(dados.map(d => d.Mes))];
    const dataCritico = labels.map(mes => dados.find(d => d.Mes === mes && d.Nivel === 'CRITICO')?.Contagem || 0);
    const dataAtencao = labels.map(mes => dados.find(d => d.Mes === mes && d.Nivel === 'ATENÇÃO')?.Contagem || 0);
    
    chartRiscoCriticoTendencia.data.labels = labels;
    chartRiscoCriticoTendencia.data.datasets = [
        { label: 'Alertas Críticos', data: dataCritico, backgroundColor: '#dc3545' },
        { label: 'Alertas Atenção', data: dataAtencao, backgroundColor: '#FFC300' }
    ];
    chartRiscoCriticoTendencia.update();
}

// G2: Comparativo de Demanda de Recursos (Colunas Agrupadas)
function desenharComparativoDemanda(dados) {
    const mesAnterior = dados.find(d => d.Periodo === 'MesAnterior') || {};
    const mesAtual = dados.find(d => d.Periodo === 'MesAtual') || {};

    const dadosMAnterior = [mesAnterior.media_cpu || 0, mesAnterior.media_ram || 0];
    const dadosMAtual = [mesAtual.media_cpu || 0, mesAtual.media_ram || 0];
    
    chartComparativoDemanda.data.datasets[0].data = dadosMAnterior;
    chartComparativoDemanda.data.datasets[1].data = dadosMAtual;
    chartComparativoDemanda.update();
}


// G4: Evolução da Integridade da Coleta (Linha) - Mapeado para o único canvas livre no 'details-container' se for o caso
// Vamos usar o canvas do Risco Crítico para Indisponibilidade e o de Demanda para Integridade (Exemplo prático, mesmo que os nomes não batam)
function desenharIntegridadeEvolucao(dados) {
    // NOTA: Para fins de demonstração, este gráfico será desenhado em um canvas auxiliar.
    // Como o HTML só tem dois canvas principais, você precisará adicionar mais.
    // Aqui, vamos apenas atualizar o canvas de Demanda com os dados de Integridade.
    
    // O backend retorna: Evolução da Indisponibilidade e Evolução da Integridade.
    // Devido à limitação do HTML fornecido, estou assumindo que você adicionará os 2 canvas extras:
    // Canvas: evolucaoIndisponibilidadeChart e integridadeEvolucaoChart.
    
    const labels = dados.map(d => d.Semana);
    const data = dados.map(d => d.RegistrosColetados);
    
    // Se o canvas de integridade fosse adicionado:
    // chartIntegridadeEvolucao.data.labels = labels;
    // chartIntegridadeEvolucao.data.datasets[0].data = data;
    // chartIntegridadeEvolucao.update();
    
    // Como não há canvas no HTML fornecido para G3 e G4, a função não será implementada.
    // Você precisa adicionar o canvas com ID 'evolucaoIndisponibilidadeChart' e 'integridadeEvolucaoChart'
    // no seu HTML, no section .details-container.
}

// G5: Ranking de Máquinas por Prioridade de Intervenção (Tabela)
function popularTabelaRanking(dados) {
    const tbody = document.getElementById('tbody-ranking-prioridade');
    tbody.innerHTML = ''; 

    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">Nenhuma máquina em risco prioritário no bimestre.</td></tr>';
        return;
    }

    dados.forEach(item => {
        const row = tbody.insertRow();
        
        let corSeveridade = 'text-secondary';
        if (item.Severidade_Max === 'Critica') corSeveridade = 'text-custom-red';
        else if (item.Severidade_Max === 'Alta') corSeveridade = 'text-custom-yellow';

        row.insertCell().textContent = item.Maquina;
        row.insertCell().innerHTML = `<span class="${corSeveridade}">${item.Severidade_Max || 'N/A'}</span>`;
        row.insertCell().textContent = item.Alertas_Bimestre || 0;
    });
}


// -----------------------------------------------------------------------------------
// 4. INICIALIZAÇÃO DE GRÁFICOS VAZIOS (Chart.js)
// -----------------------------------------------------------------------------------

function initGraficosRiscoTendencia() {
    // G1: Tendência de Risco (Colunas Empilhadas)
    const ctx1 = document.getElementById('riscoCriticoTendenciaChart').getContext('2d');
    chartRiscoCriticoTendencia = new Chart(ctx1, {
        type: 'bar',
        data: { labels: [], datasets: [{ label: 'Críticos', data: [] }, { label: 'Atenção', data: [] }] },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } } }
    });

    // G2: Comparativo de Demanda (Colunas Agrupadas)
    const ctx2 = document.getElementById('comparativoDemandaChart').getContext('2d');
    chartComparativoDemanda = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Média CPU (%)', 'Média RAM (%)'],
            datasets: [
                { label: 'Mês Passado', data: [0, 0], backgroundColor: '#007bff' },
                { label: 'Mês Atual', data: [0, 0], backgroundColor: '#6f42c1' }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
}