// ====================================================================
// CONFIGURAÇÕES GLOBAIS E INICIALIZAÇÃO DO DOM
// ====================================================================

// Variável Global para armazenar dados (para que o filtro de severidade funcione localmente)
let dashboardDataCache = null;

document.addEventListener("DOMContentLoaded", () => {
    // Carrega o dashboard inicial (Bimestre 5, conforme o título no HTML)
    carregarDashboardRisco(5);
    
    // Inicializa o Tour (o TourGuide.js deve estar carregado)
    inicializarTour();

    // Anexa o listener de mudança do filtro de Severidade UMA ÚNICA VEZ
    const selectFiltro = document.getElementById("filtro-severidade");
    if (selectFiltro) {
        selectFiltro.addEventListener("change", () => {
            if (dashboardDataCache?.graficos?.severidadeComparativa?.dadosBrutos) {
                // Se os dados já estiverem em cache, atualiza o gráfico localmente
                atualizarGraficoSeveridadeUnico(
                    selectFiltro.value,
                    dashboardDataCache.graficos.severidadeComparativa.dadosBrutos
                );
            }
        });
    }
});

// ====================================================================
// FUNÇÕES DE DADOS E FLUXO PRINCIPAL
// ====================================================================

/**
 * Função principal para buscar e renderizar os dados da dashboard
 * com base no bimestre selecionado.
 * @param {number} bimestre - O número do bimestre a ser carregado (ex: 5).
 */
async function carregarDashboardRisco(bimestre) {
    try {
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));
        if (!usuario || !usuario.fkEmpresa) {
            console.error("Usuário não autenticado ou fkEmpresa ausente.");
            return;
        }

        const fkEmpresa = usuario.fkEmpresa;
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.style.display = 'block';

        // URL da API adaptada para buscar os dados do bimestre
        const resposta = await fetch(`/dashboardEstrategica/geral/${fkEmpresa}?bimestre=${bimestre}`);
        if (!resposta.ok) throw new Error("Falha ao buscar dados da API");

        const dados = await resposta.json();
        dashboardDataCache = dados; // Armazena os novos dados no cache

        if (loadingMessage) loadingMessage.style.display = 'none';

        // 🚨 CORREÇÃO DINÂMICA DO TÍTULO: Atualiza o H2 principal
        document.getElementById('periodo_titulo_display').textContent = `2025 - Bimestre ${bimestre}`;
        // Atualiza o texto do dropdown para o bimestre selecionado (ou "Selecionar")
        document.getElementById('valor_pesquisa_periodo').textContent = `Selecionar`; 

        preencherKPIs(dados.kpis);
        preencherGraficos(dados.graficos);
        preencherTabelaRankingPrioridade(dados.graficos?.ranking?.tabela);

    } catch (erro) {
        console.error("Erro ao carregar dashboard: ", erro);
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.textContent = "Erro ao carregar dados. Verifique o console.";
    }
}

/**
 * Chamada pelo dropdown no HTML. Inicia o carregamento.
 */
function filtrarPeriodo(bimestre) {
    if (bimestre) {
        carregarDashboardRisco(bimestre);
    }
}

function preencherKPIs(kpis) {
    document.getElementById("kpi_incidentes_criticos").textContent = kpis.kpi_incidentes_criticos;
    document.getElementById("kpi_maquinas_saturacao").textContent = kpis.kpi_maquinas_saturacao;
    document.getElementById("kpi_comunicacao_estavel").textContent = kpis.kpi_comunicacao_estavel + "%";
    document.getElementById("kpi_integridade_logs").textContent = kpis.kpi_integridade_logs + "%";
    document.getElementById("kpi_score_risco").textContent = kpis.kpi_score_risco;
}

function preencherGraficos(graficos) {
    if (graficos?.comparativoNivel) {
        atualizarGraficoComparativoBimestre(
            "comparativoBimestreChartNivel",
            graficos.comparativoNivel.labels,
            graficos.comparativoNivel.atual,
            graficos.comparativoNivel.passado
        );
    }
    
    // Atualiza o gráfico de Severidade com o valor atual do filtro.
    if (graficos?.severidadeComparativa?.dadosBrutos) {
        const selectFiltro = document.getElementById("filtro-severidade");
        atualizarGraficoSeveridadeUnico(selectFiltro.value, graficos.severidadeComparativa.dadosBrutos);
    }
}

// ====================================================================
// FUNÇÕES DE GRÁFICOS (Renderização)
// ====================================================================

function atualizarGraficoSeveridadeUnico(severidadeSelecionada, dados) {
    const canvas = document.getElementById("graficoSeveridadeUnico");
    if (!canvas) return;
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    const normalize = s => (s === "Crítica" ? "Critica" : s);
    const componentes = ["CPU", "RAM", "DISCO", "REDE"];
    
    const atual = componentes.map(comp => {
        const item = dados.find(r => r.componente === comp && r.severidade === normalize(severidadeSelecionada));
        return item ? parseInt(item.atual) : 0;
    });
    const passado = componentes.map(comp => {
        const item = dados.find(r => r.componente === comp && r.severidade === normalize(severidadeSelecionada));
        return item ? parseInt(item.passado) : 0;
    });

    const chart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: componentes,
            datasets: [
                { label: "Bimestre Atual", data: atual, backgroundColor: "rgba(87, 111, 230, 0.8)", borderRadius: 6 },
                { label: "Bimestre Passado", data: passado, backgroundColor: "rgba(180, 180, 200, 0.8)", borderRadius: 6 }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} incidentes` } },
                datalabels: { anchor: "end", align: "top", formatter: v => (v > 0 ? v : ""), color: "#444", font: { weight: "bold" } }
            },
            scales: { y: { beginAtZero: true, title: { display: true, text: "Quantidade de Incidentes" }, ticks: { precision: 0 } } }
        },
        plugins: [ChartDataLabels]
    });

    canvas.chartInstance = chart;
}

function atualizarGraficoComparativoBimestre(id, labels, atual, passado) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    if (canvas.chartInstance) canvas.chartInstance.destroy();

    const newChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                { label: "Bimestre Atual", data: atual, backgroundColor: "rgba(87, 111, 230, 0.8)", borderRadius: 5 },
                { label: "Bimestre Passado", data: passado, backgroundColor: "rgba(180, 180, 200, 0.8)", borderRadius: 5 }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw} alertas` } }
            },
            scales: {
                x: { beginAtZero: true, title: { display: true, text: "Quantidade de Alertas" } }
            }
        }
    });
    canvas.chartInstance = newChart;
}

function preencherTabelaRankingPrioridade(ranking) {
    const tbody = document.getElementById("tbody-ranking-prioridade");
    tbody.innerHTML = "";
    if (!ranking || !Array.isArray(ranking)) return;

    ranking.forEach(item => {
        const tr = document.createElement("tr");

        const tdMaquina = document.createElement("td");
        tdMaquina.textContent = item.maquina || "—";

        const tdAlertas = document.createElement("td");
        tdAlertas.textContent = item.alertasBimestre ?? 0;

        const tdCpu = document.createElement("td");
        tdCpu.textContent = item.cpuMedia ? item.cpuMedia + "%" : "—";

        const tdRam = document.createElement("td");
        tdRam.textContent = item.ramMedia ? item.ramMedia + "%" : "—";

        const tdDisco = document.createElement("td");
        tdDisco.textContent = item.discoUso ? item.discoUso + "%" : "—";

        const tdIncidentes = document.createElement("td");
        tdIncidentes.textContent = item.totalIncidentes ?? "—";

        const tdSeveridade = document.createElement("td");
        tdSeveridade.textContent = item.severidadeMedia || "—";

        const tdStatus = document.createElement("td");
        tdStatus.textContent = item.status || "—";

        tr.appendChild(tdMaquina);
        tr.appendChild(tdAlertas);
        tr.appendChild(tdCpu);
        tr.appendChild(tdRam);
        tr.appendChild(tdDisco);
        tr.appendChild(tdIncidentes);
        tr.appendChild(tdSeveridade);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}


// ====================================================================
// INICIALIZAÇÃO DO TOUR (10 PASSOS)
// ====================================================================

const riscoOperacionalTourSteps = [
    {
        id: 'valor_pesquisa_periodo', 
        title: 'Passo 1/10: Seleção de Período',
        content: 'Use este menu para alternar entre os bimestres. Todos os dados, gráficos e rankings da dashboard serão atualizados para o período selecionado.',
        position: 'bottom',
    },
    {
        id: 'kpi-section', // Target: Seção Completa
        title: 'Passo 2/10: Visão Geral dos KPIs',
        content: 'Esta área apresenta todos os Indicadores Chave de Risco (KPIs) consolidados do sistema. Os próximos passos detalharão cada um individualmente.',
        position: 'bottom',
    },
    {
        id: 'kpi-tempo-critico', 
        title: 'Passo 3/10: Incidentes Críticos/Altos',
        content: 'Mede o percentual de alertas que atingiram o nível Crítico ou Alto no período selecionado. É um indicador chave da gravidade dos problemas.',
        position: 'bottom',
    },
    {
        id: 'kpi-crescimento-uso-taxa', 
        title: 'Passo 4/10: Máquinas Próximas à Saturação',
        content: 'Indica quantas máquinas estão operando consistentemente acima de um limite de uso pré-definido. É um sinal de risco futuro por falta de capacidade.',
        position: 'bottom',
    },
    {
        id: 'kpi-severidade-maxima', 
        title: 'Passo 5/10: Taxa de Comunicação Estável',
        content: 'Representa a porcentagem de tempo que a comunicação com os agentes das máquinas foi estável. Baixos valores podem indicar problemas de rede ou falha de monitoramento.',
        position: 'bottom',
    },
    {
        id: 'kpi-saturacao-ram', 
        title: 'Passo 6/10: Integridade de Logs',
        content: 'Mede a integridade dos logs de eventos. Baixa integridade compromete a auditoria e a precisão dos dados de risco. O ideal é 100%.',
        position: 'bottom',
    },
    {
        id: 'kpi-integridade-logs', 
        title: 'Passo 7/10: Score Consolidado de Risco',
        content: 'É uma pontuação única (calculada a partir de todos os KPIs e alertas) que resume o risco operacional total. Quanto menor o Score, melhor.',
        position: 'bottom',
    },
    {
        id: 'chart-comparativo-bimestres-nivel', 
        title: 'Passo 8/10: Comparativo de Alertas',
        content: 'Este gráfico compara a evolução dos Alertas por Nível (Crítico, Alto, Médio) entre o bimestre atual e o anterior, ajudando a identificar tendências de risco.',
        position: 'top',
    },
    {
        id: 'chart-distribuicao-severidade', 
        title: 'Passo 9/10: Distribuição de Severidade',
        content: 'Aqui você pode filtrar e analisar onde estão concentrados os incidentes de uma Severidade específica (Média, Alta ou Crítica) entre os componentes das máquinas.',
        position: 'top',
    },
    {
        id: 'chart-ranking-prioridade', 
        title: 'Passo 10/10: Ranking de Máquinas por Prioridade',
        content: 'A tabela lista as máquinas ranqueadas com base no seu nível de risco consolidado (o Score). É a sua principal ferramenta para saber onde priorizar a intervenção.',
        position: 'top',
    },
];

function inicializarTour() {
    if (typeof TourGuide !== 'undefined') {
        const riscoOperacionalTour = new TourGuide(riscoOperacionalTourSteps);
        window.iniciarTourGestor = () => riscoOperacionalTour.startTour();
    } else {
        console.error('TourGuide não está definido. O tour não será inicializado.');
    }
}