// ATENÇÃO: ESTE ARQUIVO É CÓDIGO DE FRONTEND (BROWSER).
// NÃO DEVE CONTER NENHUM COMANDO 'require()' DO NODE.JS AQUI.

// Variáveis globais para armazenar as instâncias dos gráficos e permitir atualização
let chartTendencia = null;
let chartProgressao = null;

// Função para simular o TMA (Tempo Médio Entre Alertas) e Previsão
// Nota: Esta função usa dados do banco (totalAlertas, totalMaquinas) para simular KPIs analíticos.
function simularDadosAnaliticos(totalAlertas, totalMaquinas, diasNoPeriodo) {
    if (totalAlertas === 0 || totalMaquinas === 0) {
        return {
            taxaCrescimento: "0.00%",
            tempoMedioAlerta: "N/A",
            previsaoAlertas: "0",
            componenteCritico: "N/A",
            maquinasSuspeitas: 0
        };
    }

    // Simulação: Comparação (Ex: 20% a mais que o período anterior)
    const taxaCrescimento = (Math.random() * 40 - 10).toFixed(2) + "%"; // Entre -10% e 30%
    
    // Simulação: TMA em horas (total de horas / total de alertas)
    const totalHoras = diasNoPeriodo * 24;
    const tmaHoras = (totalHoras / totalAlertas).toFixed(1);
    const tempoMedioAlerta = `${tmaHoras} hrs`;

    // Simulação: Previsão (Ex: 15% a mais que o atual)
    const previsaoAlertas = Math.round(totalAlertas * (1 + Math.random() * 0.2)).toString();

    // Mock do Componente Mais Crítico e Máquinas Suspeitas
    const componentes = ['CPU', 'RAM', 'DISCO'];
    const componenteCritico = componentes[Math.floor(Math.random() * componentes.length)];
    const maquinasSuspeitas = Math.floor(Math.random() * totalMaquinas / 5) + 1;


    return {
        taxaCrescimento: taxaCrescimento,
        tempoMedioAlerta: tempoMedioAlerta,
        previsaoAlertas: previsaoAlertas,
        componenteCritico: componenteCritico,
        maquinasSuspeitas: maquinasSuspeitas
    };
}


document.addEventListener("DOMContentLoaded", function() {
    // Inicializa os popovers do Bootstrap
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) { 
        return new bootstrap.Popover(popoverTriggerEl); 
    });

    // 1. Renderiza os gráficos vazios inicialmente
    initGraficosVazios();

    // 2. Busca os dados reais do backend (Bimestre 5 como default)
    carregarDadosDashboard(5);
});

/**
 * Função principal que orquestra a busca de dados
 * @param {number} bimestre - O bimestre a ser filtrado (ex: 5)
 */
function carregarDadosDashboard(bimestre) {
    const idEmpresa = sessionStorage.getItem("ID_EMPRESA") || 1; 
    const diasNoPeriodo = 60; // Assumindo 60 dias para um bimestre

    console.log(`Buscando dados para empresa: ${idEmpresa} no Bimestre: ${bimestre}`);

    // Rota CORRETA do backend
    fetch(`/dashboard/risco/${idEmpresa}?bimestre=${bimestre}`)
        .then(response => {
            if (response.ok) return response.json();
            // Esta linha é alcançada APENAS se o servidor responder com um status diferente de 200 (ex: 404, 500)
            throw new Error("Erro na resposta do servidor");
        })
        .then(data => {
            console.log("Dados recebidos:", data);
            
            // Simula e Atualiza os novos KPIs baseados nos dados brutos
            const dadosAnaliticos = simularDadosAnaliticos(
                data.graficos.totalAlertas,
                data.graficos.totalMaquinas,
                diasNoPeriodo
            );
            
            atualizarKPIs(data.kpis, dadosAnaliticos);
            atualizarListas(data.listas);
            atualizarGraficos(data.graficos);
        })
        .catch(error => {
            console.error("Erro ao carregar dashboard:", error);
            // Mostrar mensagem de erro na tela (usando Notificacao.js mockado)
            if (typeof mostrarNotificacao === 'function') {
                // Tenta usar a função global de notificação se disponível
                mostrarNotificacao('Erro ao carregar dados do dashboard. Verifique a API e o banco de dados.', 'danger');
            }
        });
}

/**
 * Atualiza os números dos Cards (KPIs)
 */
function atualizarKPIs(kpisDB, kpisAnaliticos) {
    // 1. Novos KPIs analíticos (simulados)
    document.getElementById('txt_taxa_crescimento').innerText = kpisAnaliticos.taxaCrescimento;
    document.getElementById('txt_tempo_medio_alerta').innerText = kpisAnaliticos.tempoMedioAlerta;
    document.getElementById('txt_componente_critico').innerText = kpisAnaliticos.componenteCritico;
    document.getElementById('txt_previsao_alerta').innerText = kpisAnaliticos.previsaoAlertas;
    document.getElementById('txt_maquinas_suspeitas').innerText = kpisAnaliticos.maquinasSuspeitas;

    // Ajusta a cor da taxa de crescimento
    const taxaElement = document.getElementById('txt_taxa_crescimento');
    const taxaValor = parseFloat(kpisAnaliticos.taxaCrescimento.replace('%', '').replace(',', '.'));
    taxaElement.className = taxaValor > 0 ? 'text-danger' : (taxaValor < 0 ? 'text-success' : 'text-secondary');
}

/**
 * Gerencia a atualização da tabela Ranking de Máquinas
 */
function atualizarListas(listas) {
    preencherTabelaRanking('tbody-ranking-prioridade', listas.rankingPrioridade);
}

/**
 * Preenche o HTML da tabela de Ranking de Máquinas
 */
function preencherTabelaRanking(elementId, dados) {
    const tbody = document.getElementById(elementId);
    tbody.innerHTML = ""; // Limpa o conteúdo atual
    
    // Simula Severidade baseada na quantidade de alertas
    const dadosMapeados = dados.map(item => ({
        ...item,
        severidade: item.qtd_alertas > 50 ? 'Crítico' : (item.qtd_alertas > 20 ? 'Alto' : 'Médio'),
        cor: item.qtd_alertas > 50 ? 'text-danger' : (item.qtd_alertas > 20 ? 'text-warning' : 'text-secondary')
    }));

    // Ordena pela maior quantidade de alertas (prioridade)
    dadosMapeados.sort((a, b) => b.qtd_alertas - a.qtd_alertas);

    // Limita ao top 10 para a tabela
    dadosMapeados.slice(0, 10).forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.nomeMaquina}</td>
                <td><span class="${item.cor}"><i class="bi bi-circle-fill me-1"></i> ${item.severidade}</span></td>
                <td>${item.qtd_alertas}</td>
            </tr>
        `;
    });
}

/**
 * Atualiza os dados dentro dos gráficos Chart.js
 */
function atualizarGraficos(dadosGraficos) {
    // --- 1. Tendência de Desgaste (Line Chart) ---
    // Puxa os dados de alertas por dia e componente do banco
    const alertas = dadosGraficos.evolucao;
    
    // Extrai labels unicos (dias/semanas)
    const labels = [...new Set(alertas.map(a => a.dia))];
    
    // Mapeia valores para cada dataset (CPU, RAM, DISCO)
    const dadosCPU = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'CPU');
        return found ? found.qtd_alertas : 0;
    });
    const dadosRAM = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'RAM');
        return found ? found.qtd_alertas : 0;
    });
    const dadosDisco = labels.map(dia => {
        const found = alertas.find(a => a.dia === dia && a.tipoComponete === 'DISCO');
        return found ? found.qtd_alertas : 0;
    });

    chartTendencia.data.labels = labels;
    chartTendencia.data.datasets[0].data = dadosCPU;
    chartTendencia.data.datasets[1].data = dadosRAM;
    chartTendencia.data.datasets[2].data = dadosDisco;
    chartTendencia.update();

    // --- 2. Progressão Acumulada de Alertas (Line Chart) ---
    // Cria um dataset acumulado a partir dos dados totais de evolução (soma de CPU, RAM, DISCO)
    const totalAlertasPorDia = labels.map(dia => {
        return alertas.filter(a => a.dia === dia)
                      .reduce((acc, curr) => acc + curr.qtd_alertas, 0);
    });

    let acumulado = 0;
    const dadosProgressao = totalAlertasPorDia.map(total => {
        acumulado += total;
        return acumulado;
    });

    chartProgressao.data.labels = labels;
    chartProgressao.data.datasets[0].data = dadosProgressao;
    chartProgressao.update();

    // --- 3. Mapa Consolidado de Risco (Simulação em Tabela) ---
    // Mock de Mapa Consolidado usando dados do ranking
    const mapaDiv = document.getElementById('mapa-consolidado-content');
    mapaDiv.innerHTML = `
        <table class="table table-sm">
            <thead>
                <tr><th>Região</th><th>Risco Médio</th><th>Alertas</th></tr>
            </thead>
            <tbody>
                <tr><td>Filial A - SP</td><td><span class="text-danger">Alto</span></td><td>85</td></tr>
                <tr><td>Filial B - RJ</td><td><span class="text-warning">Médio</span></td><td>23</td></tr>
                <tr><td>Filial C - MG</td><td><span class="text-success">Baixo</span></td><td>5</td></tr>
            </tbody>
        </table>
    `;
}

/**
 * Inicializa os gráficos com dados vazios e configurações visuais
 */
function initGraficosVazios() {
    // --- Configuração Gráfico Tendência de Desgaste (Linha) ---
    const ctx1 = document.getElementById('tendenciaDesgasteChart').getContext('2d');
    chartTendencia = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'CPU', data: [], borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', tension: 0.3, pointRadius: 3 },
                { label: 'RAM', data: [], borderColor: '#ffc107', backgroundColor: 'rgba(255, 193, 7, 0.1)', tension: 0.3, pointRadius: 3 },
                { label: 'DISCO', data: [], borderColor: '#0dcaf0', backgroundColor: 'rgba(13, 202, 240, 0.1)', tension: 0.3, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { position: 'bottom' } 
            },
            scales: { 
                y: { 
                    beginAtZero: true, 
                    title: { display: true, text: 'Qtd. Alertas Críticos' },
                    ticks: { stepSize: 1 }
                } 
            }
        }
    });

    // --- Configuração Gráfico Progressão Acumulada (Linha) ---
    const ctx2 = document.getElementById('progressaoAcumuladaChart').getContext('2d');
    chartProgressao = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Alertas Acumulados',
                data: [],
                borderColor: '#0d6efd', 
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4, 
                fill: true,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Alertas Acumulados' },
                }
            }
        }
    });
}

/**
 * Funções Auxiliares da UI para filtro de período
 */
function filtrarPeriodo(bimestre) {
    document.getElementById('valor_pesquisa_periodo').innerText = `Bimestre ${bimestre}`;
    document.getElementById('ano_bimestre').innerText = `2025 - Bimestre ${bimestre}`;
    
    // Recarrega os dados para o novo bimestre selecionado
    carregarDadosDashboard(bimestre);
}

function iniciarTourGestor() {
    console.log("Iniciando o Tour do Painel de Risco...");
    // Lógica do TourGuide.js iria aqui
}