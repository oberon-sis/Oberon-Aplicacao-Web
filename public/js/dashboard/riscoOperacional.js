document.addEventListener("DOMContentLoaded", () => {
    carregarDashboardRisco();
});

async function carregarDashboardRisco() {
    try {
        // Assume-se que 'usuario' e 'fkEmpresa' estão corretos
        const usuario = JSON.parse(sessionStorage.getItem("usuario"));

        if (!usuario || !usuario.fkEmpresa) {
            console.error("Usuário não autenticado ou fkEmpresa ausente.");
            return;
        }

        const fkEmpresa = usuario.fkEmpresa;

        // O id do canvas no seu novo HTML é 'comparativoBimestreChartNivel'
        const loadingMessage = document.getElementById('loading-message');
        if(loadingMessage) loadingMessage.style.display = 'block'; // Mostrar loading

        const resposta = await fetch(`/dashboardEstrategica/geral/${fkEmpresa}`);
        if (!resposta.ok) throw new Error("Falha ao buscar dados da API");

        const dados = await resposta.json();
        
        if(loadingMessage) loadingMessage.style.display = 'none'; // Esconder loading
        
        preencherKPIs(dados.kpis);
        preencherGraficos(dados.graficos);
        preencherTabelaRankingPrioridade(dados.graficos?.ranking?.tabela);

    } catch (erro) {
        console.error("Erro ao carregar dashboard: ", erro);
        const loadingMessage = document.getElementById('loading-message');
        if(loadingMessage) loadingMessage.textContent = "Erro ao carregar dados. Verifique o console.";
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
    // === NOVO GRÁFICO: Comparativo de Alertas por Nível — Bimestre ===
    // Usa a nova chave 'comparativoNivel' para preencher o canvas 'comparativoBimestreChartNivel'
    if (graficos?.comparativoNivel) {
        atualizarGraficoComparativoBimestre(
            "comparativoBimestreChartNivel", 
            graficos.comparativoNivel.labels,
            graficos.comparativoNivel.atual,
            graficos.comparativoNivel.passado
        );
    }
    // =================================================================

    // Gráfico original (deve ter sido renomeado para outro lugar)
    if (graficos?.comparativoBimestre) {
        atualizarGraficoComparativoBimestre(
            "comparativoBimestreChart",
            graficos.comparativoBimestre.labels,
            graficos.comparativoBimestre.atual,
            graficos.comparativoBimestre.passado
        );
    }

    if (graficos?.demanda) {
        atualizarGraficoBarra("comparativoDemandaChart", graficos.demanda.labels, graficos.demanda.data);
    }
    
    // O gráfico de Severidade Comparativa (que agora não existe no seu novo HTML)
    // Se o canvas ID 'graficoSeveridadeComparativa' for adicionado novamente, ele usará esta função:
    /*
    if (graficos?.comparativoNivel) {
        atualizarGraficoComparativoBimestre(
            "graficoSeveridadeComparativa", 
            graficos.comparativoNivel.labels,
            graficos.comparativoNivel.atual,
            graficos.comparativoNivel.passado
        );
    }
    */

    if (graficos?.ranking?.tabela) {
        preencherTabelaRankingPrioridade(graficos.ranking.tabela);
    }
}

function atualizarGraficoComparativoBimestre(id, labels, atual, passado) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    // Adicionando lógica para destruir a instância anterior (boa prática)
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    const newChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Bimestre Atual",
                    data: atual,
                    backgroundColor: "rgba(87, 111, 230, 0.8)",
                    borderRadius: 5
                },
                {
                    label: "Bimestre Passado",
                    data: passado,
                    backgroundColor: "rgba(180, 180, 200, 0.8)",
                    borderRadius: 5
                }
            ]
        },
        options: {
            indexAxis: "y", // 🔥 Horizontal
            responsive: true,
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.raw} alertas`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Quantidade de Alertas"
                    }
                }
            }
        }
    });
    
    // Armazena a instância para destruição posterior
    canvas.chartInstance = newChart;
}


function atualizarGraficoBarra(id, labels, data) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.warn("Canvas não encontrado:", id);
        return;
    }
    
    // Adicionando lógica para destruir a instância anterior (boa prática)
    if (canvas.chartInstance) {
        canvas.chartInstance.destroy();
    }

    const newChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Quantidade",
                    data: data,
                    backgroundColor: "#6C63FF",
                    borderRadius: 5
                }
            ]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            plugins: {
                legend: { display: false },
                datalabels: {
                    anchor: "end",
                    align: "right",
                    formatter: value => value
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Nº de Alertas"
                    },
                    ticks: { beginAtZero: true }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
    
    // Armazena a instância para destruição posterior
    canvas.chartInstance = newChart;
}

function preencherTabelaRankingPrioridade(ranking) {
    const tbody = document.getElementById("tbody-ranking-prioridade");
    tbody.innerHTML = "";

    if (!ranking || !Array.isArray(ranking)) {
        console.warn("Ranking não encontrado ou inválido");
        return;
    }

    ranking.forEach(item => {
        const tr = document.createElement("tr");

        const tdMaquina = document.createElement("td");
        tdMaquina.textContent = item.maquina || item.nome || "—";

        const tdAlertas = document.createElement("td");
        tdAlertas.textContent = item.alertasBimestre || item.totalAlertas || 0;

        tr.appendChild(tdMaquina);
        tr.appendChild(tdAlertas);

        tbody.appendChild(tr);
    });
}